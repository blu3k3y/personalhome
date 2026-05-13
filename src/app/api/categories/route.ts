import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/categories?username=xxx
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(categories);
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const category = await prisma.category.create({
      data: { userId: user.id, name: name.trim() },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "이미 존재하는 카테고리예요." }, { status: 409 });
  }
}

// DELETE /api/categories
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (category.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}