import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
const KeyboardNavigationContext = createContext({
    isKeyboardUser: false,
    focusedElement: null,
    setFocusedElement: () => { },
});
export const useKeyboardNavigation = () => useContext(KeyboardNavigationContext);
export function KeyboardNavigationProvider({ children }) {
    const [isKeyboardUser, setIsKeyboardUser] = useState(false);
    const [focusedElement, setFocusedElement] = useState(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (!mounted)
            return;
        const handleKeyDown = (e) => {
            // Detect keyboard usage
            if (e.key === "Tab") {
                setIsKeyboardUser(true);
            }
            // Global keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case "k":
                        e.preventDefault();
                        // Focus global search
                        const searchInput = document.querySelector("[data-search-input]");
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.select();
                        }
                        break;
                    case "n":
                        e.preventDefault();
                        // Open quick add transaction
                        const quickAddButton = document.querySelector("[data-quick-add]");
                        if (quickAddButton) {
                            quickAddButton.click();
                        }
                        break;
                    case "/":
                        e.preventDefault();
                        // Focus sidebar search
                        const sidebarSearch = document.querySelector("[data-sidebar-search]");
                        if (sidebarSearch) {
                            sidebarSearch.focus();
                        }
                        break;
                    case "e":
                        e.preventDefault();
                        // Quick expense entry
                        window.location.href = "/purchases";
                        break;
                    case "i":
                        e.preventDefault();
                        // Quick invoice creation
                        window.location.href = "/sales";
                        break;
                    case "r":
                        e.preventDefault();
                        // Quick report generation
                        window.location.href = "/reports";
                        break;
                    case "a":
                        e.preventDefault();
                        // Open AI insights
                        window.location.href = "/ai-insights";
                        break;
                    case ",":
                        e.preventDefault();
                        // Open settings
                        window.location.href = "/settings";
                        break;
                }
            }
            // Escape key handling
            if (e.key === "Escape") {
                // Close modals, dropdowns, etc.
                const activeModal = document.querySelector('[data-modal][data-state="open"]');
                if (activeModal) {
                    const closeButton = activeModal.querySelector("[data-close]");
                    if (closeButton) {
                        closeButton.click();
                    }
                }
            }
        };
        const handleMouseDown = () => {
            setIsKeyboardUser(false);
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleMouseDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [mounted]);
    return (_jsx(KeyboardNavigationContext.Provider, { value: {
            isKeyboardUser,
            focusedElement,
            setFocusedElement,
        }, children: _jsx("div", { className: isKeyboardUser ? "keyboard-user" : "", children: children }) }));
}
