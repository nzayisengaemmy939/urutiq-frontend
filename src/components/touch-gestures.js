import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
export function TouchGestures({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, children, className, }) {
    const touchStartRef = useRef(null);
    const elementRef = useRef(null);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        };
        const handleTouchEnd = (e) => {
            if (!touchStartRef.current)
                return;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            const minSwipeDistance = 50;
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        onSwipeRight?.();
                    }
                    else {
                        onSwipeLeft?.();
                    }
                }
            }
            else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        onSwipeDown?.();
                    }
                    else {
                        onSwipeUp?.();
                    }
                }
            }
            touchStartRef.current = null;
        };
        element.addEventListener("touchstart", handleTouchStart, { passive: true });
        element.addEventListener("touchend", handleTouchEnd, { passive: true });
        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchend", handleTouchEnd);
        };
    }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
    return (_jsx("div", { ref: elementRef, className: className, children: children }));
}
