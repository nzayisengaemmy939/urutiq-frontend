import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
export default function Unauthorized() {
    const navigate = useNavigate();
    return (_jsx("div", { className: "min-h-[60vh] flex items-center justify-center p-6", children: _jsxs(Card, { className: "max-w-md w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Unauthorized" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "You don\u0019t have permission to access this page. If you believe this is a mistake, contact an administrator." }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => navigate(-1), variant: "outline", children: "Go Back" }), _jsx(Button, { onClick: () => navigate('/dashboard'), children: "Go to Dashboard" })] })] })] }) }));
}
