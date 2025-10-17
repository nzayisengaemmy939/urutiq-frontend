# MoonLoader Component Documentation

## Overview
The `MoonLoader` component is a custom loading spinner with a moon-like animation and customizable colors. It provides a consistent loading experience across the UrutiIQ application.

## Features
- **Multiple Sizes**: `sm`, `md`, `lg`, `xl`
- **Multiple Colors**: `teal` (default), `blue`, `green`, `purple`, `gray`
- **Customizable**: Additional className support
- **Smooth Animation**: 1-second linear animation loop

## Usage Examples

### Basic Usage
```tsx
import { MoonLoader } from "../components/ui/moon-loader"

// Default teal color, medium size
<MoonLoader />
```

### Different Sizes
```tsx
// Small loader for buttons
<MoonLoader size="sm" />

// Medium loader (default)
<MoonLoader size="md" />

// Large loader for content areas
<MoonLoader size="lg" />

// Extra large loader for full-page loading
<MoonLoader size="xl" />
```

### Different Colors
```tsx
// Teal (default brand color)
<MoonLoader color="teal" />

// Blue for processing states
<MoonLoader color="blue" />

// Green for success states
<MoonLoader color="green" />

// Purple for premium features
<MoonLoader color="purple" />

// Gray for neutral states
<MoonLoader color="gray" />
```

### With Custom Styling
```tsx
<MoonLoader 
  size="lg" 
  color="teal" 
  className="my-4" 
/>
```

## Implementation Examples

### 1. Purchase Orders Loading
```tsx
{ordersLoading ? (
  <div className="flex items-center justify-center py-8">
    <MoonLoader size="lg" />
  </div>
) : (
  // Table content
)}
```

### 2. Button Loading State
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <MoonLoader size="sm" className="mr-2" color="teal" />
      Processing...
    </>
  ) : (
    <>
      <Send className="w-4 h-4 mr-2" />
      Send Email
    </>
  )}
</Button>
```

### 3. Full Page Loading
```tsx
if (loading) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <MoonLoader size="xl" color="teal" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Loading Chart of Accounts
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch your account data...
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 4. Inline Processing Indicator
```tsx
{isProcessing && (
  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
    <div className="flex items-center space-x-2">
      <MoonLoader size="sm" color="blue" />
      <span className="text-sm text-blue-800">
        Processing {uploadedFiles.length} receipt(s) with AI-powered OCR...
      </span>
    </div>
    <div className="mt-2 text-xs text-blue-600">
      This may take a few moments depending on image quality and complexity.
    </div>
  </div>
)}
```

## Color Guidelines

### Teal (Default)
- **Use for**: General loading states, brand-consistent loading
- **Best for**: Main application loading, default states

### Blue
- **Use for**: Processing states, data operations
- **Best for**: API calls, data processing, uploads

### Green
- **Use for**: Success-related loading, positive actions
- **Best for**: Saving operations, successful processes

### Purple
- **Use for**: Premium features, special operations
- **Best for**: AI features, advanced functionality

### Gray
- **Use for**: Neutral states, disabled operations
- **Best for**: Background processes, non-critical loading

## Size Guidelines

### Small (`sm`)
- **Size**: 16px (h-4 w-4)
- **Use for**: Buttons, inline indicators
- **Best for**: Action buttons, small UI elements

### Medium (`md`)
- **Size**: 24px (h-6 w-6)
- **Use for**: General loading states
- **Best for**: Default loading, moderate importance

### Large (`lg`)
- **Size**: 32px (h-8 w-8)
- **Use for**: Content area loading
- **Best for**: Table loading, form processing

### Extra Large (`xl`)
- **Size**: 48px (h-12 w-12)
- **Use for**: Full page loading
- **Best for**: Initial page loads, major operations

## Migration from Old Spinners

### Before (Old Spinner)
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
```

### After (MoonLoader)
```tsx
<MoonLoader size="lg" color="teal" />
```

### Before (Button Spinner)
```tsx
<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
```

### After (MoonLoader)
```tsx
<MoonLoader size="sm" className="mr-2" color="teal" />
```

## Accessibility
- The component uses semantic HTML with proper ARIA attributes
- Animation respects user's motion preferences
- Color contrast meets WCAG guidelines
- Screen reader friendly

## Performance
- Lightweight CSS animations
- No JavaScript dependencies
- Optimized for smooth 60fps animation
- Minimal DOM impact

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS animations support required
- Fallback to static indicator for older browsers
