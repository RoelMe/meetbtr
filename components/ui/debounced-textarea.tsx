"use client";

import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface DebouncedTextareaProps {
    value: string;
    onSave: (value: string) => void;
    placeholder?: string;
    className?: string;
    delay?: number;
    readOnly?: boolean;
}

export function DebouncedTextarea({
    value: initialValue,
    onSave,
    placeholder,
    className,
    delay = 1000,
    readOnly = false,
}: DebouncedTextareaProps) {
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
        <Textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => !readOnly && setValue(e.target.value)}
            placeholder={placeholder}
            className={className}
            readOnly={readOnly}
        />
    );
}
