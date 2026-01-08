"use client";

import { ActionItemsTable } from "@/components/dashboard/ActionItemsTable";
import { SearchInput } from "@/components/ui/search-input";
import { useAuth } from "@/hooks/useAuth";
import { useUserActionItems } from "@/hooks/useUserActionItems";
import React from "react";

export default function ActionsPage() {
    const { user } = useAuth();
    const { actionItems, loading } = useUserActionItems(user?.uid);

    return (
        <div className="container mx-auto px-4 pt-4 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4 lowercase">Global Actions</h1>
                    <p className="text-slate-500 font-medium">View and filter all action items from your meetings.</p>
                </div>
                <SearchInput
                    placeholder="Search"
                    wrapperClassName="max-w-md w-full"
                />
            </div>

            <ActionItemsTable
                actionItems={actionItems}
                loading={loading}
                title=""
                description=""
            />
        </div>
    );
}
