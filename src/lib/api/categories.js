import { apiService } from '../api';
export const categoriesApi = {
    // Get all categories
    getCategories: async (companyId) => {
        const params = new URLSearchParams();
        if (companyId)
            params.append('companyId', companyId);
        return await apiService.get(`/api/categories?${params.toString()}`);
    },
    // Get category by ID
    getCategory: async (id) => {
        return await apiService.get(`/api/categories/${id}`);
    },
    // Create new category
    createCategory: async (data) => {
        return await apiService.post('/api/categories', data);
    },
    // Update category
    updateCategory: async (id, data) => {
        return await apiService.put(`/api/categories/${id}`, data);
    },
    // Delete category
    deleteCategory: async (id) => {
        return await apiService.delete(`/api/categories/${id}`);
    },
    // Get category hierarchy
    getCategoryHierarchy: async (companyId) => {
        const params = new URLSearchParams();
        if (companyId)
            params.append('companyId', companyId);
        return await apiService.get(`/api/categories/hierarchy?${params.toString()}`);
    },
    // Get categories as flat list for dropdowns
    getCategoriesFlat: async (companyId) => {
        const categories = await categoriesApi.getCategories(companyId);
        // Flatten nested categories with full path names
        const flattenCategories = (cats, parentPath = '') => {
            const result = [];
            cats.forEach(cat => {
                const fullPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
                result.push({
                    id: cat.id,
                    name: cat.name,
                    path: fullPath
                });
                if (cat.children && cat.children.length > 0) {
                    result.push(...flattenCategories(cat.children, fullPath));
                }
            });
            return result;
        };
        return flattenCategories(categories);
    }
};
