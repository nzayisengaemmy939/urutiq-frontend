import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
export function useFormValidation(initialValues, rules) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const validateField = (name, value) => {
        const fieldRules = rules[name];
        if (!fieldRules)
            return [];
        const fieldErrors = [];
        if (fieldRules.required && (!value || value.toString().trim() === "")) {
            fieldErrors.push("This field is required");
        }
        if (value && fieldRules.minLength && value.toString().length < fieldRules.minLength) {
            fieldErrors.push(`Minimum length is ${fieldRules.minLength} characters`);
        }
        if (value && fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
            fieldErrors.push(`Maximum length is ${fieldRules.maxLength} characters`);
        }
        if (value && fieldRules.pattern && !fieldRules.pattern.test(value.toString())) {
            fieldErrors.push("Invalid format");
        }
        if (value && fieldRules.min && Number(value) < fieldRules.min) {
            fieldErrors.push(`Minimum value is ${fieldRules.min}`);
        }
        if (value && fieldRules.max && Number(value) > fieldRules.max) {
            fieldErrors.push(`Maximum value is ${fieldRules.max}`);
        }
        if (value && fieldRules.custom) {
            const customError = fieldRules.custom(value);
            if (customError) {
                fieldErrors.push(customError);
            }
        }
        return fieldErrors;
    };
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        Object.keys(rules).forEach((key) => {
            const fieldErrors = validateField(key, values[key]);
            if (fieldErrors.length > 0) {
                newErrors[key] = fieldErrors;
                isValid = false;
            }
        });
        setErrors(newErrors);
        // Object.values may include undefined; assert as string[] after flattening
        return { isValid, errors: Object.values(newErrors).flat() };
    };
    const setValue = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        // Validate field on change if it's been touched
        if (touchedFields[name]) {
            const fieldErrors = validateField(name, value);
            setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
        }
    };
    const handleFieldTouch = (name) => {
        setTouchedFields((prev) => ({ ...prev, [name]: true }));
        // Validate field when touched
        const fieldErrors = validateField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
    };
    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouchedFields({});
    };
    return {
        values,
        errors,
        touchedFields,
        setValue,
        setTouched: handleFieldTouch,
        validateForm,
        reset,
        isFieldValid: (name) => !errors[name] || errors[name].length === 0,
        getFieldError: (name) => errors[name]?.[0] || null,
    };
}
export function FormField({ name, label, error, touched, children }) {
    const hasError = touched && error;
    const isValid = touched && !error;
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: name, className: "text-sm font-medium text-foreground", children: label }), _jsxs("div", { className: "relative", children: [children, hasError && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx(AlertCircle, { className: "w-4 h-4 text-red-500" }) })), isValid && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }) }))] }), hasError && (_jsxs("p", { className: "text-sm text-red-600 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), error] }))] }));
}
