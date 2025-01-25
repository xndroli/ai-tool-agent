"use client";

import { createContext, useState, useContext } from "react";

interface NavigationContextType {
    isMobileNavOpen: boolean;
    setIsMobileNavOpen: (open: boolean) => void;
    closeMobileNav: () => void;
};

// Global state wrapper a.k.a. context (can push and pull values into context)
export const NavigationContext = createContext<NavigationContextType>({
    // Type definitions
    isMobileNavOpen: false,
    setIsMobileNavOpen: () => {},
    closeMobileNav: () => {},
});

export function NavigationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const closeMobileNav = () => setIsMobileNavOpen(false);

    return (
        <NavigationContext
            value={{ isMobileNavOpen, setIsMobileNavOpen, closeMobileNav }}
        >
            {children}
        </NavigationContext>
    );
};

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error("useNavigation must be used within a NavigationProvider");
    };
    return context;
};
