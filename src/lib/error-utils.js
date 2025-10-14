export function formatApiError(error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
            title: '🌐 Network Error',
            message: 'Unable to connect to the server. Please check your internet connection and try again.'
        };
    }
    // Handle timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return {
            title: '⏰ Timeout Error',
            message: 'The request took too long to complete. Please try again.'
        };
    }
    // Handle API errors with details
    if (error.details && Array.isArray(error.details)) {
        const validationErrors = error.details;
        const fieldErrors = validationErrors.map(err => `${err.field}: ${err.message}`).join('\n');
        return {
            title: '❌ Validation Error',
            message: 'Please fix the following errors:',
            details: fieldErrors
        };
    }
    // Handle specific error codes
    if (error.message) {
        if (error.message.includes('validation_error') || error.message.includes('Invalid request body')) {
            return {
                title: '❌ Validation Error',
                message: 'Please check your input and try again.'
            };
        }
        if (error.message.includes('ACCOUNT_CODE_EXISTS') ||
            error.message.includes('duplicate_entry') ||
            error.message.includes('already exists') ||
            error.message.includes('Account with this code already exists')) {
            return {
                title: '⚠️ Duplicate Account Code',
                message: 'An account with this code already exists. Please use a different code.'
            };
        }
        if (error.message.includes('not_found')) {
            return {
                title: '🔍 Not Found',
                message: 'The requested resource was not found.'
            };
        }
        if (error.message.includes('forbidden') || error.status === 403) {
            return {
                title: '🚫 Access Denied',
                message: 'You do not have permission to perform this action.'
            };
        }
        if (error.message.includes('invalid_token') || error.status === 401) {
            return {
                title: '🔐 Authentication Error',
                message: 'Please log in again to continue.'
            };
        }
        if (error.status === 500) {
            return {
                title: '⚙️ Server Error',
                message: 'An internal server error occurred. Please try again later.'
            };
        }
        // Return the actual error message for other cases
        return {
            title: '❌ Error',
            message: error.message
        };
    }
    // Fallback for unknown errors
    return {
        title: '❌ Unknown Error',
        message: 'An unexpected error occurred. Please try again.'
    };
}
export function logApiError(error, context) {
    console.group(`🚨 API Error${context ? ` (${context})` : ''}`);
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.details);
    console.groupEnd();
}
