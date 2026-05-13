import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    // 빈값 체크
    if (!username || !email || !password)
      return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });

    // username 형식 체크 (영문 소문자, 숫자, 하이픈만 3~20자)
    if (!/^[a-z0-9-]{3,20}$/.test(username))
      return NextResponse.json(
        { error: "username은 영문 소문자, 숫자, 하이픈만 3~20자 가능해요." },
        { status: 400 }
      );

    // 비밀번호 길이 체크
    if (password.length < 8)
      return NextResponse.json({ error: "비밀번호는 8자 이상이어야 해요." }, { status: 400 });

    // 중복 체크
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing)
      return NextResponse.json(
        { error: "이미 사용 중인 이메일 또는 username이에요." },
        { status: 409 }
      );

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, email, password: hashed },
    });

    return NextResponse.json({ ok: true, username: user.username }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했어요." }, { status: 500 });
  }
}