// lib/schemas/index.js

import { validateData } from '../validation/validationService';

/**
 * Customer schema
 */
export const customerSchema = {
  firstName: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  lastName: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  phone: {
    type: 'string',
    required: true,
    pattern: /^\+?[0-9]{7,15}$/,
    validate: (value) =>
      /^\+?[0-9]{7,15}$/.test(value.trim()) || 'Phone number must be valid and contain 7 to 15 digits',
  },
  email: {
    type: 'string',
    required: true,
    pattern: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
    message: 'Email must be a valid email address',
  },
  address: {
    type: 'object',
    required: false,
    properties: {
      street: { type: 'string', required: false, maxLength: 100 },
      city: { type: 'string', required: false, maxLength: 50 },
      state: { type: 'string', required: false, maxLength: 50 },
      zip: { type: 'string', required: false, maxLength: 10 },
      country: { type: 'string', required: false, maxLength: 50 },
    },
  },
  pincode: {
    type: 'string',
    required: true,
    pattern: /^\d{5,10}$/,
    validate: (value) =>
      /^\d{5,10}$/.test(value.trim()) || 'Pincode must contain only numbers and be 5 to 10 digits long',
  },
  hairType: {
    type: 'string',
    required: false,
    maxLength: 50,
  },
  createdAt: {
    type: 'object',
    required: false,
  },
  updatedAt: {
    type: 'object',
    required: false,
  }
};

/**
 * Product schema
 */
export const productSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  price: {
    type: 'number',
    required: true,
    min: 0,
  },
  qty: {
    type: 'number',
    required: true,
    min: 0,
  },
  category: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  createdAt: {
    type: 'object',
    required: false,
  },
  updatedAt: {
    type: 'object',
    required: false,
  }
};

/**
 * Purchase Product Item schema (for items within a purchase)
 */
export const purchaseProductSchema = {
  productId: {
    type: 'string',
    required: true,
  },
  price: {
    type: 'number',
    required: true,
    min: 0,
  },
  qty: {
    type: 'number',
    required: true,
    min: 1,
  },
  subtotal: {
    type: 'number',
    required: false,
    min: 0,
    validate: (value, data) => {
      if (value === undefined || value === null) return true;
      return value === data.price * data.qty || 'Subtotal must equal price × quantity';
    }
  }
};

/**
 * Purchase schema - Updated to handle customerId/customer object properly
 */
export const purchaseSchema = {
  customerId: {
    type: 'string',
    required: function(value, data) {
      return !data.customer; // Only required if no customer object is provided
    },
    validate: (value) => typeof value === 'string' || 'customerId must be a string'
  },
  customer: {
    type: 'object',
    required: function(value, data) {
      return !data.customerId; // Only required if no customerId is provided
    },
    validate: (value) => {
      const result = validateData(value, customerSchema);
      return result.isValid || `Customer validation failed: ${JSON.stringify(result.errors)}`;
    }
  },
  products: {
    type: 'array',
    required: true,
    validate: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return 'At least one product is required';
      }
      for (const product of value) {
        const result = validateData(product, purchaseProductSchema);
        if (!result.isValid) {
          return `Product validation failed: ${JSON.stringify(result.errors)}`;
        }
      }
      return true;
    }
  },
  totalAmount: {
    type: 'number',
    required: true,
    min: 0,
    validate: (value, data) => {
      if (!data.products) return true;
      const calculatedTotal = data.products.reduce((sum, p) => sum + (p.subtotal || p.price * p.qty), 0);
      return value === calculatedTotal || `Total amount must equal sum of product subtotals (${calculatedTotal})`;
    }
  },
  freebieId: {
    type: 'string',
    required: false,
  },
  purchaseDate: {
    type: 'object',
    required: true,
    validate: (value) => value instanceof Object || 'Invalid purchase date'
  },
  createdAt: {
    type: 'object',
    required: false,
  }
};

/**
 * Freebie schema
 */
export const freebieSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  blend: {
    type: 'array',
    required: false,
    items: {
      type: 'string',
    },
  },
  availableQty: {
    type: 'number',
    required: true,
    min: 0,
  }
};

/**
 * Freebie Sent schema
 */
export const freebieSentSchema = {
  customerId: {
    type: 'string',
    required: true,
  },
  freebieId: {
    type: 'string',
    required: true,
  },
  purchaseId: {
    type: 'string',
    required: true,
  },
  freebieName: {
    type: 'string',
    required: true,
  },
  sentDate: {
    type: 'object',
    required: true,
  }
};