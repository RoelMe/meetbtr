"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    wrapperClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, wrapperClassName, ...props }, ref) => {
        return (
            <div
                className={cn(
                    "flex items-center border-b border-primary py-2 transition-colors focus-within:border-primary",
                    wrapperClassName
                )}
            >
                <Search className="h-4 w-4 text-primary mr-2" />
                <input
                    className={cn(
                        "flex h-9 w-full bg-transparent py-1 text-sm shadow-none outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
