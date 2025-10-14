import type React from "react"

import { useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any) => string | null
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: Partial<Record<keyof T, ValidationRule>>,
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string[]>>>({})
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = (name: keyof T, value: any): string[] => {
    const fieldRules = rules[name]
    if (!fieldRules) return []

    const fieldErrors: string[] = []

    if (fieldRules.required && (!value || value.toString().trim() === "")) {
      fieldErrors.push("This field is required")
    }

    if (value && fieldRules.minLength && value.toString().length < fieldRules.minLength) {
      fieldErrors.push(`Minimum length is ${fieldRules.minLength} characters`)
    }

    if (value && fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
      fieldErrors.push(`Maximum length is ${fieldRules.maxLength} characters`)
    }

    if (value && fieldRules.pattern && !fieldRules.pattern.test(value.toString())) {
      fieldErrors.push("Invalid format")
    }

    if (value && fieldRules.min && Number(value) < fieldRules.min) {
      fieldErrors.push(`Minimum value is ${fieldRules.min}`)
    }

    if (value && fieldRules.max && Number(value) > fieldRules.max) {
      fieldErrors.push(`Maximum value is ${fieldRules.max}`)
    }

    if (value && fieldRules.custom) {
      const customError = fieldRules.custom(value)
      if (customError) {
        fieldErrors.push(customError)
      }
    }

    return fieldErrors
  }

  const validateForm = (): ValidationResult => {
    const newErrors: Partial<Record<keyof T, string[]>> = {}
    let isValid = true

    Object.keys(rules).forEach((key) => {
      const fieldErrors = validateField(key as keyof T, values[key as keyof T])
      if (fieldErrors.length > 0) {
        newErrors[key as keyof T] = fieldErrors
        isValid = false
      }
    })

  setErrors(newErrors)
  // Object.values may include undefined; assert as string[] after flattening
  return { isValid, errors: (Object.values(newErrors).flat() as string[]) }
  }

  const setValue = (name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }))

    // Validate field on change if it's been touched
    if (touchedFields[name]) {
      const fieldErrors = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: fieldErrors }))
    }
  }

  const handleFieldTouch = (name: keyof T) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }))

    // Validate field when touched
    const fieldErrors = validateField(name, values[name])
    setErrors((prev) => ({ ...prev, [name]: fieldErrors }))
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouchedFields({})
  }

  return {
    values,
    errors,
    touchedFields,
    setValue,
    setTouched: handleFieldTouch,
    validateForm,
    reset,
    isFieldValid: (name: keyof T) => !errors[name] || errors[name]!.length === 0,
    getFieldError: (name: keyof T) => errors[name]?.[0] || null,
  }
}

interface FormFieldProps {
  name: string
  label: string
  error?: string
  touched?: boolean
  children: React.ReactNode
}

export function FormField({ name, label, error, touched, children }: FormFieldProps) {
  const hasError = touched && error
  const isValid = touched && !error

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {children}
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        )}
        {isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}
