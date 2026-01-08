import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const selectVariants = cva(
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
)

const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
    return (
        <div className="relative">
            <select
                className={cn(selectVariants(), "appearance-none", className)}
                ref={ref}
                {...props}
            />
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>
    )
})
Select.displayName = "Select"


export { Select }
