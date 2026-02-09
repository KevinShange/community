import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, birthday } = body as {
      email?: string;
      password?: string;
      name?: string;
      birthday?: string; // YYYY-MM-DD
    };
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!trimmedEmail || !password || password.length < 6) {
      return NextResponse.json(
        { error: "請提供有效的 email 與密碼（至少 6 字元）" },
        { status: 400 }
      );
    }
    const handle = `@${trimmedEmail.split("@")[0] ?? "user"}`;
    // 衝突：已有同 email 的 credential 帳號，或 handle 已被使用（OAuth 會用 @xxx-google 等，不與此衝突）
    const existingByEmail = await prisma.user.findFirst({
      where: { email: trimmedEmail, password: { not: null } },
    });
    const existingByHandle = await prisma.user.findUnique({ where: { handle } });
    if (existingByEmail || existingByHandle) {
      return NextResponse.json(
        { error: "此 email 或 handle 已被使用" },
        { status: 409 }
      );
    }
    const hashedPassword = await hash(password, 10);
    const displayName = ((typeof name === "string" && name.trim()) || trimmedEmail.split("@")[0]) ?? "User";
    let birthdayDate: Date | null = null;
    if (typeof birthday === "string" && birthday.trim()) {
      const d = new Date(birthday.trim());
      if (!Number.isNaN(d.getTime())) birthdayDate = d;
    }
    await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        name: displayName,
        handle,
        ...(birthdayDate && { birthday: birthdayDate }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "註冊失敗" },
      { status: 500 }
    );
  }
}
