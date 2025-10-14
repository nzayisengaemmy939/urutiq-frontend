import { useMutation, useQuery } from '@tanstack/react-query'
import { parserApi, insightsApi, ParseResponse, CreateEntryResponse } from '../lib/api/parser'

export const useParseTransaction = () => {
  return useMutation<{ data: ParseResponse }, Error, { text: string; companyId?: string } >({
    mutationFn: async (vars) => {
      const res = await parserApi.parse(vars.text, vars.companyId)
      return { data: res }
    }
  })
}

export const useCreateParsedEntry = () => {
  return useMutation<{ data: CreateEntryResponse }, Error, { text: string; companyId?: string; autoCreate?: boolean } >({
    mutationFn: async (vars) => {
      const res = await parserApi.createEntry(vars.text, vars.companyId, vars.autoCreate ?? true)
      return { data: res }
    }
  })
}

export const useParserSuggestions = (text: string) => {
  return useQuery<{ success: boolean; data: { text: string; suggestions: string[] } }, Error>({
    queryKey: ['parser-suggestions', text],
    queryFn: async () => parserApi.suggestions(text),
    enabled: Boolean(text && text.length > 3)
  })
}

export const useInsights = (companyId?: string, opts?: { category?: string; priority?: string }) => {
  return useQuery({
    queryKey: ['insights', companyId, opts?.category, opts?.priority],
    queryFn: async () => insightsApi.list(companyId, opts),
    enabled: true
  })
}

export const useGenerateInsights = () => {
  return useMutation({
    mutationFn: async (companyId?: string) => insightsApi.generate(companyId)
  })
}


