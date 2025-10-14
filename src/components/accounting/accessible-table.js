import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const AccessibleAccountingTable = ({ caption, headers, data, renderRow, onRowSelect, selectedRowId }) => {
    const handleKeyDown = (event, item) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onRowSelect?.(item);
        }
    };
    return (_jsxs("div", { role: "region", "aria-labelledby": "table-caption", children: [_jsxs("table", { className: "w-full", role: "table", "aria-describedby": "table-description", children: [_jsx("caption", { id: "table-caption", className: "sr-only", children: caption }), _jsx("thead", { children: _jsx("tr", { role: "row", children: headers.map((header, index) => (_jsx("th", { role: "columnheader", scope: "col", className: "text-left p-2 font-medium border-b", tabIndex: 0, children: header }, index))) }) }), _jsx("tbody", { children: data.map((item, index) => (_jsx("tr", { role: "row", className: `border-b hover:bg-muted/50 focus-within:bg-muted/50 ${selectedRowId === item.id ? 'bg-primary/10' : ''}`, tabIndex: onRowSelect ? 0 : -1, onKeyDown: (e) => handleKeyDown(e, item), onClick: () => onRowSelect?.(item), "aria-selected": selectedRowId === item.id, children: renderRow(item, index) }, item.id || index))) })] }), _jsxs("div", { id: "table-description", className: "sr-only", children: ["Table showing ", data.length, " items. Use arrow keys to navigate and Enter to select."] })] }));
};
