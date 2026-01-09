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

    // Overlay ref for syncing scroll
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (textareaRef.current && overlayRef.current) {
            overlayRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    return (
        <div className="relative w-full group">
            <div className="relative grid">
                {/* Highlight Overlay */}
                <div
                    ref={overlayRef}
                    aria-hidden="true"
                    className={cn(
                        "col-start-1 row-start-1 w-full p-3 whitespace-pre-wrap break-words pointer-events-none text-sm font-sans overflow-hidden border border-transparent", // Hide overflow, match border width
                        minHeight,
                        className,
                        "bg-transparent text-slate-800"
                    )}
                >
                    {value.split(/(@[\w\u00C0-\u00FF]+(?:\s[\w\u00C0-\u00FF]+)?)/g).map((part, i) => {
                        if (part.startsWith("@")) {
                            return <span key={i} className="text-blue-600 font-semibold bg-blue-50 rounded px-[2px] -mx-[2px]">{part}</span>;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                    {/* Add extra space to match textarea behavior if needed */}
                    <br />
                </div>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                    className={cn(
                        "col-start-1 row-start-1 relative z-10 w-full p-3 rounded-xl border border-slate-100 resize-y focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-200 text-sm font-sans bg-transparent",
                        "!text-transparent caret-slate-900 selection:bg-blue-100 selection:text-transparent", // Force transparent text to prevent ghosting
                        minHeight,
                        className
                    )}
                    placeholder={placeholder}
                    {...props}
                />
            </div>

            {showSuggestions && filteredCandidates.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-48 overflow-y-auto">
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
