// lib/validation/validationService.js
/**
 * Validate data against a schema
 * @param {Object} data - The data to validate
 * @param {Object} schema - The schema to validate against
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateData = (data, schema) => {
    const errors = {};
    let isValid = true;
  
    // Loop through each field in the schema
    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
  
      // If field is required and missing/empty
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        isValid = false;
        return;
      }
  
      // Skip other validations if value is empty and not required
      if (value === undefined || value === null || value === '') {
        return;
      }
  
      // Type validation
      if (rules.type) {
        if (rules.type === 'array') {
          if (!Array.isArray(value)) {
            errors[field] = `${field} must be an array`;
            isValid = false;
          }
        } else if (typeof value !== rules.type) {
          errors[field] = `${field} must be a ${rules.type}`;
          isValid = false;
        }
      }
  
      // Min length validation for strings and arrays
      if (rules.minLength !== undefined && 
          (typeof value === 'string' || Array.isArray(value)) && 
          value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
        isValid = false;
      }
  
      // Max length validation for strings and arrays
      if (rules.maxLength !== undefined && 
          (typeof value === 'string' || Array.isArray(value)) && 
          value.length > rules.maxLength) {
        errors[field] = `${field} cannot exceed ${rules.maxLength} characters`;
        isValid = false;
      }
  
      // Min value validation for numbers
      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
        isValid = false;
      }
  
      // Max value validation for numbers
      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors[field] = `${field} cannot exceed ${rules.max}`;
        isValid = false;
      }
  
      // Pattern validation for strings
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors[field] = rules.message || `${field} format is invalid`;
        isValid = false;
      }
  
      // Custom validation function
      if (rules.validate && typeof rules.validate === 'function') {
        const validateResult = rules.validate(value, data);
        if (validateResult !== true) {
          errors[field] = validateResult || `${field} is invalid`;
          isValid = false;
        }
      }
    });
  
    return { isValid, errors };
  };