import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!trimmedEmail || !password || password.length < 6) {
      return NextResponse.json(
        { error: "請提供有效的 email 與密碼（至少 6 字元）" },
        { status: 400 }
      );
    }
    const handle = `@${trimmedEmail.split("@")[0] ?? "user"}`;
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: trimmedEmail }, { handle }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "此 email 或 handle 已被使用" },
        { status: 409 }
      );
    }
    const hashedPassword = await hash(password, 10);
    const displayName = ((typeof name === "string" && name.trim()) || trimmedEmail.split("@")[0]) ?? "User";
    await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        name: displayName,
        handle,
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
