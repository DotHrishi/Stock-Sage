'use server'

import { connectToDatabase } from "@/database/mongoose";
import UserPreferences from "@/database/models/userPreferences.model";
import { headers } from "next/headers";

export async function getUserPreferences() {
    try {
        const { auth } = await import('@/lib/better-auth/auth');
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return null;
        }

        await connectToDatabase();
        
        const prefs = await UserPreferences.findOne({ userId: session.user.id });
        
        if (!prefs) {
            return { sectors: [] };
        }

        return {
            sectors: prefs.sectors as string[]
        };
    } catch (error) {
        console.error("Error fetching user preferences:", error);
        return null;
    }
}

export async function updateUserPreferences(sectors: string[]) {
    try {
        const { auth } = await import('@/lib/better-auth/auth');
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized" };
        }

        await connectToDatabase();

        await UserPreferences.findOneAndUpdate(
            { userId: session.user.id },
            { sectors },
            { upsert: true, new: true }
        );

        return { success: true };
    } catch (error) {
        console.error("Error updating user preferences:", error);
        return { success: false, message: "An error occurred while saving preferences." };
    }
}
