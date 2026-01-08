import { useState, useEffect } from "react";

const GUEST_NAME_KEY = "agendar_guest_name";

export function useGuest() {
    const [guestName, setGuestName] = useState<string | null>(null);

    useEffect(() => {
        const savedName = localStorage.getItem(GUEST_NAME_KEY);
        if (savedName) {
            setGuestName(savedName);
        }
    }, []);

    const saveGuestName = (name: string) => {
        localStorage.setItem(GUEST_NAME_KEY, name);
        setGuestName(name);
    };

    const clearGuestName = () => {
        localStorage.removeItem(GUEST_NAME_KEY);
        setGuestName(null);
    };

    return { guestName, saveGuestName, clearGuestName };
}
