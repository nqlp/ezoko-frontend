import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    // Only run on /api routes
    if (request.nextUrl.pathname.startsWith("/api")) {
        const res = NextResponse.next();

        // Set CORS headers
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.headers.set("Access-Control-Allow-Credentials", "true");

        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
