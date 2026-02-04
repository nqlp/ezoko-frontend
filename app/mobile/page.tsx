import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

async function getSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    if (!sessionToken) {
        return null;
    }

    const userSession = await prisma.userSession.findFirst({
        where: {
            sessionToken,
            expiresAt: {
                gte: new Date(),
            },
        },
    });
    return userSession;
}

export default async function MobilePage() {
    const session = await getSession();

    return (
        <div className="wms-container">
            <header className="wms-header">
                <Image
                    src="/favicon.ico"
                    alt="Ezoko Logo"
                    width={40}
                    height={40}
                    className="wms-logo"
                />
                <h1>Ezoko WMS</h1>
            </header>

            {session ? (
                <div>
                    <p className="wms-success">
                        ✅ Hello, <strong>{session.shopifyUserName}</strong>
                    </p>
                </div>
            ) : (
                <div>
                    <a href="/api/auth/shopify" className="wms-btn">
                        🔐 Login with Shopify
                    </a>
                </div>
            )}
        </div>
    );
}