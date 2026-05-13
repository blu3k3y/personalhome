import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserHomeClient from "./UserHomeClient";
import Win98Home from "@/components/templates/Win98Home";
import KineticHome from "@/components/templates/KineticHome";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserHomePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return notFound();

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.username === username;

  const [posts, gallery, htmlFiles, dbCategories] = await Promise.all([
    prisma.post.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.gallery.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.htmlFile.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);

  const safePosts = posts.map(p => ({
    ...p,
    content: p.isPrivate && !isOwner ? "" : p.content,
    password: isOwner ? p.password : "",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const safeGallery = gallery.map(g => ({
    ...g,
    imageData: g.isPrivate && !isOwner ? null : g.imageData,
    password: isOwner ? g.password : "",
    createdAt: g.createdAt.toISOString(),
  }));

  const safeHtmlFiles = htmlFiles.map(f => ({
    ...f,
    htmlContent: f.isPrivate && !isOwner ? "" : f.htmlContent,
    password: isOwner ? f.password : "",
    createdAt: f.createdAt.toISOString(),
  }));

  const categoryList = dbCategories.map(c => ({ id: c.id, name: c.name }));

  const initialData = {
    posts: safePosts,
    gallery: safeGallery,
    htmlFiles: safeHtmlFiles,
    categories: categoryList,
  };

  if (user.templateId === 2) {
    return <Win98Home username={username} isOwner={isOwner} initialData={initialData} />;
  }

  if (user.templateId === 3) {
    return <KineticHome username={username} isOwner={isOwner} initialData={initialData} />;
  }

  return <UserHomeClient username={username} isOwner={isOwner} initialData={initialData} />;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return { title: `${username}.blu3k3y.cloud` };
}