import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const session = await getServerSession(authOptions);

  let templateId = 1;
  if (session?.user?.username) {
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
      select: { templateId: true },
    });
    templateId = user?.templateId ?? 1;
  }

  const res = NextResponse.json({
    username: session?.user?.username || null,
    templateId,
  });

  if (origin.endsWith(".localhost:3000") || origin === "http://localhost:3000") {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return res;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}