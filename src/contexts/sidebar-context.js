import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const SidebarContext = createContext(undefined);
export function SidebarProvider({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };
    return (_jsx(SidebarContext.Provider, { value: { isCollapsed, setIsCollapsed, toggleSidebar }, children: children }));
}
export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
