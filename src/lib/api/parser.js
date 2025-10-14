import { apiService } from '../api';
import { getHeaders, DEFAULT_COMPANY_ID } from '../config';
export const parserApi = {
    parse: async (text, companyId) => {
        const body = { text, companyId: companyId || DEFAULT_COMPANY_ID };
        return await apiService.post('/parser/parse', body, { headers: getHeaders() });
    },
    createEntry: async (text, companyId, autoCreate = true) => {
        const body = { text, companyId: companyId || DEFAULT_COMPANY_ID, autoCreate };
        return await apiService.post('/parser/create-entry', body, { headers: getHeaders() });
    },
    suggestions: async (text) => {
        return await apiService.post('/parser/suggestions', { text }, { headers: getHeaders() });
    }
};
export const insightsApi = {
    list: async (companyId, opts) => {
        const params = new URLSearchParams();
        if (companyId || DEFAULT_COMPANY_ID)
            params.append('companyId', companyId || DEFAULT_COMPANY_ID);
        if (opts?.category)
            params.append('category', opts.category);
        if (opts?.priority)
            params.append('priority', opts.priority);
        return await apiService.get(`/ai/insights?${params.toString()}`, { headers: getHeaders() });
    },
    generate: async (companyId) => {
        return await apiService.post('/ai/insights/generate', { companyId: companyId || DEFAULT_COMPANY_ID }, { headers: getHeaders() });
    }
};
