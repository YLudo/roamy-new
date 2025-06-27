import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const path = request.nextUrl.pathname;

    const isPublicPath = path === "/login" || path === "/register" || path.includes("/activate");

    if (isPublicPath && token) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};