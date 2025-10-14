import { apiService } from '../api'
import { getHeaders } from '../config'

export interface ParserParsedResult {
  originalText: string
  parsedTransaction: any
  confidence: number
  reasoning: string
  suggestions: string[]
  validationErrors: string[]
}

export interface ParseResponse {
  success: boolean
  data: ParserParsedResult
}

export interface CreateEntryResponse {
  success: boolean
  data: {
    parsed: ParserParsedResult
    journalEntry?: any
    transaction?: any
    autoCreated: boolean
  }
  error?: string
}

export const parserApi = {
  parse: async (text: string, companyId?: string): Promise<ParseResponse> => {
    const body = { text, companyId: companyId || DEFAULT_COMPANY_ID }
    return await apiService.post<ParseResponse>('/parser/parse', body, { headers: getHeaders() })
  },

  createEntry: async (text: string, companyId?: string, autoCreate = true): Promise<CreateEntryResponse> => {
    const body = { text, companyId: companyId || DEFAULT_COMPANY_ID, autoCreate }
    return await apiService.post<CreateEntryResponse>('/parser/create-entry', body, { headers: getHeaders() })
  },

  suggestions: async (text: string): Promise<{ success: boolean; data: { text: string; suggestions: string[] } }> => {
    return await apiService.post('/parser/suggestions', { text }, { headers: getHeaders() })
  }
}

export const insightsApi = {
  list: async (companyId?: string, opts?: { category?: string; priority?: string }) => {
    const params = new URLSearchParams()
    if (companyId || DEFAULT_COMPANY_ID) params.append('companyId', companyId || DEFAULT_COMPANY_ID)
    if (opts?.category) params.append('category', opts.category)
    if (opts?.priority) params.append('priority', opts.priority)
    return await apiService.get(`/ai/insights?${params.toString()}`, { headers: getHeaders() })
  },
  generate: async (companyId?: string) => {
    return await apiService.post('/ai/insights/generate', { companyId: companyId || DEFAULT_COMPANY_ID }, { headers: getHeaders() })
  }
}


