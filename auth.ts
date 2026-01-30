import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import GitHub from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

/** 為 OAuth 使用者產生唯一 handle，避免與既有用戶重複 */
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

/** OAuth 登入時在 DB 建立或更新 User，回傳我們的 id 與 handle */
async function getOrCreateOAuthUser(
  profile: { email?: string | null; name?: string | null; image?: string | null },
  account: { provider: string; providerAccountId: string }
) {
  const name = profile.name ?? "User";
  const avatar = profile.image ?? null;
  const email = profile.email?.trim().toLowerCase() || null;

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name, avatar },
      });
      return { id: existing.id, handle: existing.handle };
    }
    const handle = await getUniqueHandle(email.split("@")[0]);
    const user = await prisma.user.create({
      data: { name, email, avatar, handle },
    });
    return { id: user.id, handle: user.handle };
  }

  const fallbackHandle = `@${account.provider}-${account.providerAccountId.slice(-10)}`;
  const handle = await getUniqueHandle(fallbackHandle);
  const existing = await prisma.user.findUnique({ where: { handle } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { name, avatar },
    });
    return { id: existing.id, handle: existing.handle };
  }
  const user = await prisma.user.create({
    data: { name, avatar, handle },
  });
  return { id: user.id, handle: user.handle };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.password) return null;
        const ok = await compare(String(credentials.password), user.password);
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
      ? [Facebook]
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
        };
        const { id, handle } = await getOrCreateOAuthUser(profileData, account);
        token.id = id;
        token.handle = handle;
        (token as { loginType?: string }).loginType = "oauth";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { handle?: string }).handle = token.handle as string;
        (session.user as { loginType?: string }).loginType = (token as { loginType?: string }).loginType as "email" | "oauth";
      }
      return session;
    },
  },
});
