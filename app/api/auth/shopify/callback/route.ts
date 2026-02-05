import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken, generateSessionToken } from "@/lib/shopify-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
        return NextResponse.json(
            { error: "Missing code or state" },
            { status: 400 }
        );
    }


    // Check state matches the one we saved (CSRF protection)
    const cookieStore = await cookies();
    const storedState = cookieStore.get("shopify_auth_state")?.value;

    if (state !== storedState) {
        return NextResponse.json(
            { error: "Invalid state" },
            { status: 403 }
        );
    }

    cookieStore.delete("shopify_auth_state");

    try {
        const tokenData = await exchangeCodeForToken(
            process.env.SHOPIFY_STORE_DOMAIN!,
            code
        );

        const sessionToken = generateSessionToken();

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // upsert: update if exists, create if not
        await prisma.userSession.upsert({
            where: {
                shopifyUserId: String(tokenData.associatedUser.id),
            },
            update: {
                sessionToken,
                accessToken: tokenData.accessToken,
                expiresAt: expiresAt,
                shopifyUserEmail: tokenData.associatedUser.email,
                shopifyUserName: `${tokenData.associatedUser.firstName} ${tokenData.associatedUser.lastName}`,
            },
            create: {
                shopifyUserId: String(tokenData.associatedUser.id),
                shopifyUserEmail: tokenData.associatedUser.email,
                shopifyUserName: `${tokenData.associatedUser.firstName} ${tokenData.associatedUser.lastName}`,
                sessionToken,
                accessToken: tokenData.accessToken,
                expiresAt,
            },
        });

        // Set the session cookie so user stays logged in
        cookieStore.set("wms_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 7, // 7 days
            path: "/",
        });

        return NextResponse.redirect(`${process.env.APP_URL}/m`);
    } catch (error) {
        console.error("OAuth callback error exchanging code for token:", error);
        return NextResponse.json(
            { error: "Failed to exchange code for token" },
            { status: 500 }
        );
    }
}