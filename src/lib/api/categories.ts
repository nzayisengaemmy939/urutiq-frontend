import { apiService } from '../api'

export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  companyId?: string
  tenantId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  products?: any[]
  _count?: {
    products: number
  }
  children?: Category[]
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  companyId?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  isActive?: boolean
}

export const categoriesApi = {
  // Get all categories
  getCategories: async (companyId?: string): Promise<Category[]> => {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    
    return await apiService.get<Category[]>(`/api/categories?${params.toString()}`)
  },

  // Get category by ID
  getCategory: async (id: string): Promise<Category> => {
    return await apiService.get<Category>(`/api/categories/${id}`)
  },

  // Create new category
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    return await apiService.post<Category>('/api/categories', data)
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    return await apiService.put<Category>(`/api/categories/${id}`, data)
  },

  // Delete category
  deleteCategory: async (id: string): Promise<{ message: string }> => {
    return await apiService.delete<{ message: string }>(`/api/categories/${id}`)
  },

  // Get category hierarchy
  getCategoryHierarchy: async (companyId?: string): Promise<Category[]> => {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    
    return await apiService.get<Category[]>(`/api/categories/hierarchy?${params.toString()}`)
  },

  // Get categories as flat list for dropdowns
  getCategoriesFlat: async (companyId?: string): Promise<{ id: string; name: string; path: string }[]> => {
    const categories = await categoriesApi.getCategories(companyId)
    
    // Flatten nested categories with full path names
    const flattenCategories = (cats: Category[], parentPath = ''): { id: string; name: string; path: string }[] => {
      const result: { id: string; name: string; path: string }[] = []
      
      cats.forEach(cat => {
        const fullPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name
        result.push({
          id: cat.id,
          name: cat.name,
          path: fullPath
        })
        
        if (cat.children && cat.children.length > 0) {
          result.push(...flattenCategories(cat.children, fullPath))
        }
      })
      
      return result
    }
    
    return flattenCategories(categories)
  }
}
