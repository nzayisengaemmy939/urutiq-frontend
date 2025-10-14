import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";
function Tabs({ className, variant = "default", size = "md", ...props }) {
    return (_jsx(TabsPrimitive.Root, { "data-slot": "tabs", "data-variant": variant, "data-size": size, className: cn("flex flex-col", {
            "gap-2": variant === "default" || variant === "pills",
            "gap-0": variant === "underline" || variant === "bordered",
        }, className), ...props }));
}
function TabsList({ className, variant = "default", size = "md", ...props }) {
    const baseClasses = "inline-flex items-center justify-center transition-all duration-200";
    const variantClasses = {
        default: "bg-muted text-muted-foreground rounded-lg p-[3px] shadow-sm",
        pills: "bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-inner",
        underline: "border-b border-border bg-transparent",
        bordered: "border border-border rounded-lg bg-card shadow-sm p-1"
    };
    const sizeClasses = {
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
        lg: "h-12 text-base"
    };
    return (_jsx(TabsPrimitive.List, { "data-slot": "tabs-list", className: cn(baseClasses, variantClasses[variant], sizeClasses[size], "w-fit", className), ...props }));
}
function TabsTrigger({ className, children, variant = "default", size = "md", icon, badge, ...props }) {
    const baseClasses = cn("inline-flex items-center justify-center gap-2 font-medium transition-all duration-200", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "whitespace-nowrap relative");
    const variantClasses = {
        default: cn("rounded-md border border-transparent px-3 py-1.5", "text-muted-foreground hover:text-foreground", "data-[state=active]:bg-background data-[state=active]:text-foreground", "data-[state=active]:shadow-sm data-[state=active]:border-border/50", "hover:bg-muted/50"),
        pills: cn("rounded-full px-4 py-2 border border-transparent", "text-gray-600 dark:text-gray-400 hover:text-foreground", "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700", "data-[state=active]:text-foreground data-[state=active]:shadow-md", "hover:bg-white/50 dark:hover:bg-gray-700/50"),
        underline: cn("border-b-2 border-transparent px-4 py-3 -mb-px", "text-muted-foreground hover:text-foreground", "data-[state=active]:border-primary data-[state=active]:text-primary", "hover:border-border"),
        bordered: cn("rounded-md px-3 py-2 border border-transparent", "text-muted-foreground hover:text-foreground", "data-[state=active]:bg-primary/10 data-[state=active]:text-primary", "data-[state=active]:border-primary/20", "hover:bg-muted/30")
    };
    const sizeClasses = {
        sm: "h-7 px-2 text-xs gap-1.5",
        md: "h-9 px-3 text-sm gap-2",
        lg: "h-11 px-4 text-base gap-2.5"
    };
    return (_jsxs(TabsPrimitive.Trigger, { "data-slot": "tabs-trigger", className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className), ...props, children: [icon && (_jsx("span", { className: "flex items-center justify-center [&_svg]:size-4", children: icon })), _jsx("span", { className: "flex-1", children: children }), badge && (_jsx("span", { className: cn("inline-flex items-center justify-center rounded-full", "bg-primary/20 text-primary text-xs font-semibold min-w-[18px] h-[18px] px-1.5", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"), children: badge }))] }));
}
function TabsContent({ className, animated = true, ...props }) {
    return (_jsx(TabsPrimitive.Content, { "data-slot": "tabs-content", className: cn("flex-1 outline-none", animated && "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95", animated && "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:zoom-out-95", animated && "duration-200", className), ...props }));
}
const TabsGroup = React.forwardRef(({ items, variant = "default", size = "md", className, ...props }, ref) => {
    return (_jsxs(Tabs, { ref: ref, variant: variant, size: size, className: className, ...props, children: [_jsx(TabsList, { variant: variant, size: size, children: items.map((item) => (_jsx(TabsTrigger, { value: item.value, variant: variant, size: size, icon: item.icon, badge: item.badge, disabled: item.disabled, children: item.label }, item.value))) }), items.map((item) => (_jsx(TabsContent, { value: item.value, children: item.content }, item.value)))] }));
});
TabsGroup.displayName = "TabsGroup";
export { Tabs, TabsList, TabsTrigger, TabsContent, TabsGroup };
