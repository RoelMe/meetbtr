import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";

export interface MentionCandidate {
    id: string;
    name: string;
}

interface MentionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onValueChange: (value: string) => void; // Controlled
    candidates: MentionCandidate[];
    placeholder?: string;
    minHeight?: string;
}

export function MentionTextarea({
    value,
    onValueChange,
    candidates,
    className,
    placeholder,
    minHeight = "min-h-[100px]",
    ...props
}: MentionTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 });
    const [cursorPosition, setCursorPosition] = useState(0);
    const [matchString, setMatchString] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const checkTrigger = (text: string, cursorIndex: number) => {
        // Look for @ before cursor
        const textBeforeCursor = text.slice(0, cursorIndex);
        const lastAt = textBeforeCursor.lastIndexOf("@");

        if (lastAt !== -1) {
            // Check if there are spaces between @ and cursor (allow spaces for names like "John Doe")
            const query = textBeforeCursor.slice(lastAt + 1);
            // Allow regex match for name-like chars.
            // Simplified: If it's just after a space or start of line
            const charBeforeAt = lastAt > 0 ? textBeforeCursor[lastAt - 1] : " ";

            if (charBeforeAt === " " || charBeforeAt === "\n") {
                setMatchString(query);
                return true;
            }
        }
        return false;
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onValueChange(newValue);

        const cursorPos = e.target.selectionStart;
        setCursorPosition(cursorPos); // Track for insertion

        if (checkTrigger(newValue, cursorPos)) {
            setShowSuggestions(true);

            // Simple positioning logic (perfect positioning needs specialized lib or calculation hack)
            // We'll use a simplified floating logic for now. 
            // In a production app, we'd use 'textarea-caret' library to get coordinates.
            // Fallback: Just show below.
        } else {
            setShowSuggestions(false);
        }
    };

    // Filter candidates based on matchString
    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(matchString.toLowerCase())
    );

    const insertMention = (candidate: MentionCandidate) => {
        const textBeforeCursor = value.slice(0, cursorPosition);
        const lastAt = textBeforeCursor.lastIndexOf("@");
        const prefix = value.slice(0, lastAt);
        const suffix = value.slice(cursorPosition);

        const newValue = `${prefix}@${candidate.name} ${suffix}`;
        onValueChange(newValue);
        setShowSuggestions(false);
        setSelectedIndex(0);

        // Re-focus and set cursor? Ideally yes.
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newPos = prefix.length + candidate.name.length + 2; // +2 for @ and space
                textareaRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCandidates.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCandidates.length) % filteredCandidates.length);
        } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            if (filteredCandidates[selectedIndex]) {
                insertMention(filteredCandidates[selectedIndex]);
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative w-full">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={cn(
                    "w-full p-3 rounded-xl border border-slate-200 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 text-sm text-slate-800 placeholder:text-slate-400",
                    minHeight,
                    className
                )}
                placeholder={placeholder}
                {...props}
            />

            {showSuggestions && filteredCandidates.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-48 overflow-y-auto">
                    <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Mentioning
                    </div>
                    {filteredCandidates.map((candidate, index) => (
                        <button
                            key={candidate.id}
                            type="button"
                            onClick={() => insertMention(candidate)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors",
                                index === selectedIndex ? "bg-slate-50 text-slate-900" : "text-slate-600"
                            )}
                        >
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                {candidate.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{candidate.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
