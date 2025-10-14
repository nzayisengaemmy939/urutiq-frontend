import { useMutation, useQuery } from '@tanstack/react-query';
import { parserApi, insightsApi } from '../lib/api/parser';
export const useParseTransaction = () => {
    return useMutation({
        mutationFn: async (vars) => {
            const res = await parserApi.parse(vars.text, vars.companyId);
            return { data: res };
        }
    });
};
export const useCreateParsedEntry = () => {
    return useMutation({
        mutationFn: async (vars) => {
            const res = await parserApi.createEntry(vars.text, vars.companyId, vars.autoCreate ?? true);
            return { data: res };
        }
    });
};
export const useParserSuggestions = (text) => {
    return useQuery({
        queryKey: ['parser-suggestions', text],
        queryFn: async () => parserApi.suggestions(text),
        enabled: Boolean(text && text.length > 3)
    });
};
export const useInsights = (companyId, opts) => {
    return useQuery({
        queryKey: ['insights', companyId, opts?.category, opts?.priority],
        queryFn: async () => insightsApi.list(companyId, opts),
        enabled: true
    });
};
export const useGenerateInsights = () => {
    return useMutation({
        mutationFn: async (companyId) => insightsApi.generate(companyId)
    });
};
