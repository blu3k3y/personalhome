import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = "blu3k3y.cloud";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  const hostWithoutPort = host.split(":")[0];

  // 로컬 개발
  const isLocal = hostWithoutPort.endsWith(".localhost");

  // 프로덕션 서브도메인
  const isProdSubdomain =
    hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`) &&
    hostWithoutPort !== `www.${ROOT_DOMAIN}` &&
    hostWithoutPort !== ROOT_DOMAIN;

  const isSubdomain = isLocal || isProdSubdomain;

  const subdomain = isLocal
    ? hostWithoutPort.replace(".localhost", "")
    : hostWithoutPort.replace(`.${ROOT_DOMAIN}`, "");

  if (isSubdomain && subdomain) {
    url.pathname = `/u/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_static|favicon.ico).*)"],
};