import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export function ReactQueryProvider({ children }) {
    const [client] = useState(() => new QueryClient());
    return (_jsx(QueryClientProvider, { client: client, children: children }));
}
