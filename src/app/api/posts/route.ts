import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/posts?username=xxx
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // 비밀글은 content/password 숨김 (본인 아닐 때)
  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.username === username;

  return NextResponse.json(
    posts.map(p => ({
      ...p,
      content: p.isPrivate && !isOwner ? "" : p.content,
      password: "",  // 항상 숨김
    }))
  );
}

// POST /api/posts
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, content, category, isPrivate, password } = body;

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const post = await prisma.post.create({
    data: { userId: user.id, title, content, category: category || "", isPrivate: !!isPrivate, password: isPrivate ? password : "" },
  });

  return NextResponse.json(post, { status: 201 });
}

// PUT /api/posts
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, title, content, category, isPrivate, password } = body;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (post.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.post.update({
    where: { id },
    data: { title, content, category: category || "", isPrivate: !!isPrivate, password: isPrivate ? password : "" },
  });

  return NextResponse.json(updated);
}

// DELETE /api/posts
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (post.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}