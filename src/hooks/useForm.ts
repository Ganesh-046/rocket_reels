import { useState, useCallback } from 'react';
import { log } from '../utils/logger';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: { [K in keyof T]: boolean };
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<FormErrors>) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  reset: () => void;
  resetErrors: () => void;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules
): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<{ [K in keyof T]: boolean }>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as { [K in keyof T]: boolean })
  );

  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!validationRules || !validationRules[field as string]) {
        return true;
      }

      const value = values[field];
      const rules = validationRules[field as string];
      let fieldError = '';

      if (rules.required && (!value || value.toString().trim() === '')) {
        fieldError = `${field as string} is required`;
      } else if (value) {
        if (rules.minLength && value.toString().length < rules.minLength) {
          fieldError = `${field as string} must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.toString().length > rules.maxLength) {
          fieldError = `${field as string} must be no more than ${rules.maxLength} characters`;
        } else if (rules.pattern && !rules.pattern.test(value.toString())) {
          fieldError = `${field as string} format is invalid`;
                 } else if (rules.custom) {
           const customError = rules.custom(value);
           fieldError = customError || '';
         }
      }

      setErrorsState(prev => ({
        ...prev,
        [field]: fieldError,
      } as FormErrors));

      return !fieldError;
    },
    [values, validationRules]
  );

  const validate = useCallback((): boolean => {
    if (!validationRules) {
      return true;
    }

    const fieldNames = Object.keys(validationRules) as (keyof T)[];
    const validationResults = fieldNames.map(field => validateField(field));
    const isValid = validationResults.every(result => result);
    
    log.hookCall('useForm.validate', { fieldCount: fieldNames.length, isValid, errors });
    return isValid;
  }, [validationRules, validateField, errors]);

  const setValue = useCallback(
    (field: keyof T, value: any) => {
      log.hookStateChange('useForm', field as string, value);
      setValuesState(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  const setError = useCallback(
    (field: keyof T, error: string) => {
      setErrorsState(prev => ({
        ...prev,
        [field]: error,
      }));
    },
    []
  );

  const setErrors = useCallback((newErrors: Partial<FormErrors>) => {
    setErrorsState(prev => ({
      ...prev,
      ...newErrors,
    }));
  }, []);

  const setTouched = useCallback(
    (field: keyof T, touchedValue: boolean) => {
      setTouchedState(prev => ({
        ...prev,
        [field]: touchedValue,
      }));
    },
    []
  );

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValue(field, value);
      if (touched[field]) {
        validateField(field);
      }
    },
    [setValue, touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched(field, true);
      validateField(field);
    },
    [setTouched, validateField]
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState(
      Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = false;
        return acc;
      }, {} as { [K in keyof T]: boolean })
    );
  }, [initialValues]);

  const resetErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const isValid = Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    handleChange,
    handleBlur,
    validate,
    validateField,
    reset,
    resetErrors,
  };
} 