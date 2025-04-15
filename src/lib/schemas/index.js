// lib/schemas/index.js

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
    pincode: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 10,
      pattern: /^\d+$/,
      message: 'Pincode must contain only numbers'
    },
    dob: {
      type: 'string',
      required: false,
      validate: (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Invalid date format';
      }
    },
    anniversary: {
      type: 'string',
      required: false,
      validate: (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Invalid date format';
      }
    },
    skinType: {
      type: 'string',
      required: false,
      maxLength: 50,
    },
    hairType: {
      type: 'string',
      required: false,
      maxLength: 50,
    },
    forOwnConsumption: {
      type: 'boolean',
      required: false,
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
    variant: {
      type: 'string',
      required: false,
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
   * Freebie schema
   */
  export const freebieSchema = {
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    description: {
      type: 'string',
      required: false,
      maxLength: 500,
    },
    value: {
      type: 'number',
      required: false,
      min: 0,
    },
    availableQty: {
      type: 'number',
      required: true,
      min: 0,
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
   * Purchase schema
   */
  export const purchaseSchema = {
    customerId: {
      type: 'string',
      required: true,
    },
    products: {
      required: true,
      validate: (value) => {
        return Array.isArray(value) && value.length > 0 || 'At least one product is required';
      }
    },
    totalAmount: {
      type: 'number',
      required: true,
      min: 0,
    },
    freebieId: {
      type: 'string',
      required: false,
    },
    purchaseDate: {
      type: 'object',
      required: true,
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
    name: {
      type: 'string',
      required: true,
    },
    variant: {
      type: 'string',
      required: false,
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
    },
    createdAt: {
      type: 'object',
      required: false,
    }
  };