import { getUserPreferences } from "@/lib/actions/userPreferences.actions";
import SettingsForm from "./SettingsForm";

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const preferences = await getUserPreferences();
    const initialSectors = preferences?.sectors || [];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
                <p className="text-slate-500 mt-2">Customize your dashboard by selecting the sectors you are most interested in.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                <SettingsForm initialSectors={initialSectors} />
            </div>
        </div>
    )
}
