import React, { useState, useEffect, useRef } from "react";
import { MentionTextarea, MentionCandidate } from "./mention-textarea";

interface DebouncedMentionTextareaProps {
    value: string;
    onSave: (value: string) => void;
    candidates: MentionCandidate[];
    placeholder?: string;
    className?: string;
    delay?: number;
    readOnly?: boolean;
    minHeight?: string;
}

export function DebouncedMentionTextarea({
    value: initialValue,
    onSave,
    candidates,
    placeholder,
    className,
    delay = 1000,
    readOnly = false,
    minHeight
}: DebouncedMentionTextareaProps) {
    const [value, setValue] = useState(initialValue);
    const skipNextEffect = useRef(false);

    // Sync internal state with external value when it changes (from other users)
    useEffect(() => {
        if (initialValue !== value) {
            setValue(initialValue);
            skipNextEffect.current = true;
        }
    }, [initialValue]);

    // Debounce logic
    useEffect(() => {
        if (skipNextEffect.current) {
            skipNextEffect.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (value !== initialValue) {
                onSave(value);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return (
        <MentionTextarea
            value={value}
            onValueChange={(val) => !readOnly && setValue(val)}
            candidates={candidates}
            placeholder={placeholder}
            className={className}
            readOnly={readOnly}
            minHeight={minHeight}
        />
    );
}
