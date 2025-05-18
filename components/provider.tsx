"use client";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, ReactNode } from "react";

function Provider({ children }: { children: ReactNode }) {
    const { user } = useUser();

    const CheckIsNewUser = async () => {
        if (!user) return;
    
        console.log("User object:", user); // Debugging
    
        try {
            const result = await axios.post("/api/user", {
                fullname: user.fullName, // Clerk uses `fullName`
                primaryEmailAddress: {
                    emailAddress: user.primaryEmailAddress?.emailAddress || null,
                },
            });
    
            console.log("API Response:", result.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error checking user:", error.response?.data || error.message);
            } else {
                console.error("Error checking user:", (error as Error).message);
            }
        }
    };
    

    useEffect(() => {
        CheckIsNewUser();
    }, [user]);

    return <>{children}</>;
}

export default Provider;
