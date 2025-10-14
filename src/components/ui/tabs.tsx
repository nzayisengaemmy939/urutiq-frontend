import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

// Enhanced Tabs Root with improved styling and variants
interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  variant?: "default" | "pills" | "underline" | "bordered"
  size?: "sm" | "md" | "lg"
}

function Tabs({ 
  className, 
  variant = "default",
  size = "md",
  ...props 
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-variant={variant}
      data-size={size}
      className={cn(
        "flex flex-col",
        {
          "gap-2": variant === "default" || variant === "pills",
          "gap-0": variant === "underline" || variant === "bordered",
        },
        className
      )}
      {...props}
    />
  )
}

// Enhanced TabsList with multiple design variants
interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  variant?: "default" | "pills" | "underline" | "bordered"
  size?: "sm" | "md" | "lg"
}

function TabsList({
  className,
  variant = "default",
  size = "md",
  ...props
}: TabsListProps) {
  const baseClasses = "inline-flex items-center justify-center transition-all duration-200"
  
  const variantClasses = {
    default: "bg-muted text-muted-foreground rounded-lg p-[3px] shadow-sm",
    pills: "bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-inner",
    underline: "border-b border-border bg-transparent",
    bordered: "border border-border rounded-lg bg-card shadow-sm p-1"
  }
  
  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm", 
    lg: "h-12 text-base"
  }

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        "w-fit",
        className
      )}
      {...props}
    />
  )
}

// Enhanced TabsTrigger with improved animations and states
interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  variant?: "default" | "pills" | "underline" | "bordered"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  badge?: string | number
}

function TabsTrigger({
  className,
  children,
  variant = "default",
  size = "md",
  icon,
  badge,
  ...props
}: TabsTriggerProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "whitespace-nowrap relative"
  )
  
  const variantClasses = {
    default: cn(
      "rounded-md border border-transparent px-3 py-1.5",
      "text-muted-foreground hover:text-foreground",
      "data-[state=active]:bg-background data-[state=active]:text-foreground",
      "data-[state=active]:shadow-sm data-[state=active]:border-border/50",
      "hover:bg-muted/50"
    ),
    pills: cn(
      "rounded-full px-4 py-2 border border-transparent",
      "text-gray-600 dark:text-gray-400 hover:text-foreground",
      "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700",
      "data-[state=active]:text-foreground data-[state=active]:shadow-md",
      "hover:bg-white/50 dark:hover:bg-gray-700/50"
    ),
    underline: cn(
      "border-b-2 border-transparent px-4 py-3 -mb-px",
      "text-muted-foreground hover:text-foreground",
      "data-[state=active]:border-primary data-[state=active]:text-primary",
      "hover:border-border"
    ),
    bordered: cn(
      "rounded-md px-3 py-2 border border-transparent",
      "text-muted-foreground hover:text-foreground",
      "data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
      "data-[state=active]:border-primary/20",
      "hover:bg-muted/30"
    )
  }
  
  const sizeClasses = {
    sm: "h-7 px-2 text-xs gap-1.5",
    md: "h-9 px-3 text-sm gap-2",
    lg: "h-11 px-4 text-base gap-2.5"
  }

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex items-center justify-center [&_svg]:size-4">
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {badge && (
        <span className={cn(
          "inline-flex items-center justify-center rounded-full",
          "bg-primary/20 text-primary text-xs font-semibold min-w-[18px] h-[18px] px-1.5",
          "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        )}>
          {badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
}

// Enhanced TabsContent with animation support
interface TabsContentProps extends React.ComponentProps<typeof TabsPrimitive.Content> {
  animated?: boolean
}

function TabsContent({
  className,
  animated = true,
  ...props
}: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        animated && "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95",
        animated && "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:zoom-out-95",
        animated && "duration-200",
        className
      )}
      {...props}
    />
  )
}

// Compound component for easier usage
interface TabsGroupProps extends TabsProps {
  items: Array<{
    value: string
    label: string
    content: React.ReactNode
    icon?: React.ReactNode
    badge?: string | number
    disabled?: boolean
  }>
}

const TabsGroup = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsGroupProps
>(({ items, variant = "default", size = "md", className, ...props }, ref) => {
  return (
    <Tabs ref={ref} variant={variant} size={size} className={className} {...props}>
      <TabsList variant={variant} size={size}>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            variant={variant}
            size={size}
            icon={item.icon}
            badge={item.badge}
            disabled={item.disabled}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
})
TabsGroup.displayName = "TabsGroup"

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsGroup }
