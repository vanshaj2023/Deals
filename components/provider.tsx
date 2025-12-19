"use client";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, ReactNode, useState } from "react";

function Provider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [synced, setSynced] = useState(false);

    const CheckIsNewUser = async () => {
        if (status !== 'authenticated' || !session?.user || synced) return;
    
        console.log("🔄 Syncing user to MongoDB:", session.user.email);
    
        try {
            const result = await axios.post("/api/user", {
                name: session.user.name || "User",
                email: session.user.email,
                image: session.user.image,
            });
    
            console.log("User synced to MongoDB:", result.data);
            setSynced(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error syncing user:", error.response?.data || error.message);
            } else {
                console.error("Error syncing user:", (error as Error).message);
            }
        }
    };

    useEffect(() => {
        CheckIsNewUser();
    }, [session, status]);

    return <>{children}</>;
}

export default Provider;
