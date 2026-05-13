import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  const hostWithoutPort = host.split(":")[0]; // "ming9.localhost"
  const isLocal = hostWithoutPort.endsWith(".localhost");
  const isSubdomain = isLocal && hostWithoutPort !== "localhost";
  const subdomain = isLocal ? hostWithoutPort.replace(".localhost", "") : "";

  console.log("HOST:", host);
  console.log("hostWithoutPort:", hostWithoutPort);
  console.log("isLocal:", isLocal);
  console.log("isSubdomain:", isSubdomain);
  console.log("subdomain:", subdomain);

  if (isSubdomain && subdomain) {
    url.pathname = `/u/${subdomain}${url.pathname}`;
    console.log("Rewriting to:", url.pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_static|favicon.ico).*)"],
};