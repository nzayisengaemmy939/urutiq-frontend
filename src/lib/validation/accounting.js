import { z } from 'zod';
// Account validation schema
export const accountSchema = z.object({
    name: z.string().min(1, 'Account name is required').max(100, 'Account name too long'),
    code: z.string().min(1, 'Account code is required').max(20, 'Account code too long'),
    description: z.string().max(500, 'Description too long').optional(),
    accountTypeId: z.string().min(1, 'Account type is required'),
    parentId: z.string().optional(),
    isActive: z.boolean().default(true)
});
// Journal entry validation schema
export const journalEntrySchema = z.object({
    reference: z.string().min(1, 'Reference is required'),
    description: z.string().min(1, 'Description is required'),
    date: z.string().min(1, 'Date is required'),
    lines: z.array(z.object({
        accountId: z.string().min(1, 'Account is required'),
        description: z.string().min(1, 'Line description is required'),
        debit: z.number().min(0, 'Debit must be positive'),
        credit: z.number().min(0, 'Credit must be positive')
    })).min(2, 'At least 2 lines required')
}).refine((data) => {
    const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0);
    return Math.abs(totalDebits - totalCredits) < 0.01;
}, {
    message: 'Total debits must equal total credits',
    path: ['lines']
});
// Custom hook for form validation
export const useAccountingValidation = (schema) => {
    const validate = (data) => {
        try {
            const result = schema.parse(data);
            return { success: true, data: result };
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                const errors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    errors[path] = err.message;
                });
                return { success: false, errors };
            }
            return { success: false, errors: { general: 'Validation failed' } };
        }
    };
    return { validate };
};
