import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import GitHub from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginInputSchema } from "@/lib/schemas";

/** 為 OAuth 使用者產生唯一 handle：基底字 + 登入方式識別，避免與既有用戶重複 */
async function getUniqueHandle(base: string): Promise<string> {
  const normalized = base.startsWith("@") ? base : `@${base}`;
  let handle = normalized.replace(/\s+/g, "").slice(0, 30);
  let n = 0;
  while (await prisma.user.findUnique({ where: { handle } })) {
    n += 1;
    handle = `${normalized.slice(0, 24)}-${n}`;
  }
  return handle;
}

/** 登入方式識別字（用於 handle 後綴） */
const PROVIDER_SUFFIX: Record<string, string> = {
  google: "google",
  facebook: "facebook",
  github: "github",
};

/** 從 OAuth profile 解析生日：支援 Facebook "MM/DD/YYYY"、Google 物件 { year, month, day } 或 ISO 字串 */
function parseProfileBirthday(profile: {
  birthday?: string | { year?: number; month?: number; day?: number } | null;
}): Date | null {
  const raw = profile.birthday;
  if (raw == null) return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    // Facebook: "MM/DD/YYYY" 或 "YYYY-MM-DD"
    const fbMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const iso = fbMatch
      ? `${fbMatch[3]}-${fbMatch[1].padStart(2, "0")}-${fbMatch[2].padStart(2, "0")}`
      : trimmed;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === "object" && raw !== null && "year" in raw) {
    const y = raw.year;
    const m = raw.month != null ? raw.month - 1 : 0;
    const day = raw.day ?? 1;
    if (typeof y !== "number") return null;
    const d = new Date(y, m, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** OAuth 登入時依 provider+providerAccountId 建立或更新 User，handle = 基底 + 登入方式，不同方式視為不同使用者 */
async function getOrCreateOAuthUser(
  profile: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
    picture?: string | null;
    birthday?: string | { year?: number; month?: number; day?: number } | null;
  },
  account: { provider: string; providerAccountId: string }
) {
  const name = profile.name ?? "User";
  // 部分 OAuth provider 使用 picture 而非 image，兩者都讀取以確保第三方頭像被寫入
  const avatar = (profile.picture ?? profile.image ?? null) as string | null;
  const email = profile.email?.trim().toLowerCase() || null;
  const birthday = parseProfileBirthday(profile);
  const providerSuffix = PROVIDER_SUFFIX[account.provider] ?? account.provider;

  // 先依 OAuth 身份（provider + providerAccountId）查詢是否已存在
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    include: { user: true },
  });
  if (existingAccount) {
    // 僅在用戶尚未設定頭像時用第三方頭像更新，避免覆蓋用戶已上傳的頭像；生日同理
    const updateData: { name: string; email?: string; avatar?: string | null; birthday?: Date | null } = { name };
    if (email != null) updateData.email = email;
    if (existingAccount.user.avatar == null && avatar != null) updateData.avatar = avatar;
    if (existingAccount.user.birthday == null && birthday != null) updateData.birthday = birthday;
    await prisma.user.update({
      where: { id: existingAccount.userId },
      data: updateData,
    });
    return { id: existingAccount.userId, handle: existingAccount.user.handle };
  }

  // 新 OAuth 使用者：handle = 基底字 + 登入方式識別（如 @johndoe-google）
  const base =
    email != null && email.length > 0
      ? email.split("@")[0]
      : (profile.name?.replace(/\s+/g, "") ?? account.providerAccountId.slice(-10));
  const handle = await getUniqueHandle(`${base}-${providerSuffix}`);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      avatar,
      handle,
      ...(birthday && { birthday }),
      accounts: {
        create: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    },
  });
  return { id: user.id, handle: user.handle };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginInputSchema.safeParse({
          email: credentials?.email ?? "",
          password: credentials?.password ?? "",
        });
        if (!parsed.success) return null;
        const { email } = parsed.data;
        const user = await prisma.user.findFirst({
          where: { email, password: { not: null } },
        });
        if (!user?.password) return null;
        const ok = await compare(parsed.data.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          image: user.avatar ?? undefined,
          handle: user.handle,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google]
      : []),
    ...(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
      ? [
          Facebook({
            authorization: {
              params: { scope: "email,public_profile,user_birthday" },
            },
          }),
        ]
      : []),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [GitHub]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
    updateAge: 24 * 60 * 60,   // 每 24 小時更新
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user && account) {
        if (account.provider === "credentials") {
          token.id = user.id;
          token.handle = (user as { handle?: string }).handle;
          (token as { loginType?: string }).loginType = "email";
          return token;
        }
        const profileData = (profile ?? user) as {
          email?: string | null;
          name?: string | null;
          image?: string | null;
          picture?: string | null;
        };
        const { id, handle } = await getOrCreateOAuthUser(profileData, account);
        token.id = id;
        token.handle = handle;
        (token as { loginType?: string }).loginType = "oauth";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.handle) {
        session.user.id = token.id as string;
        (session.user as { handle?: string }).handle = token.handle as string;
        (session.user as { loginType?: string }).loginType = (token as { loginType?: string }).loginType as "email" | "oauth";
        // 從 DB 取得最新名稱與頭像，讓編輯個人檔案後發文框等處能顯示更新後的頭像
        const user = await prisma.user.findUnique({
          where: { handle: token.handle as string },
          select: { name: true, avatar: true },
        });
        if (user) {
          session.user.name = user.name;
          session.user.image = user.avatar ?? session.user.image ?? null;
        }
      }
      return session;
    },
  },
});
