"use client";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, ReactNode, useState } from "react";

function Provider({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser();
    const [synced, setSynced] = useState(false);

    const CheckIsNewUser = async () => {
        if (!isLoaded || !user || synced) return;
    
        console.log("🔄 Syncing user to MongoDB:", user.primaryEmailAddress?.emailAddress);
    
        try {
            const result = await axios.post("/api/user", {
                name: user.fullName || user.username || "User",
                email: user.primaryEmailAddress?.emailAddress,
                image: user.imageUrl,
                // Support legacy Clerk format too
                fullname: user.fullName,
                primaryEmailAddress: {
                    emailAddress: user.primaryEmailAddress?.emailAddress,
                },
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
    }, [user, isLoaded]);

    return <>{children}</>;
}

export default Provider;
