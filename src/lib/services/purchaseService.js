// lib/services/purchaseService.js
import DbService from './dbService';
import { purchaseSchema, purchaseProductSchema } from '../schemas';
import productService from './productService';
import freebieService from './freebieService';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase/config';

/**
 * Purchase service for purchase-related operations
 */
class PurchaseService extends DbService {
  /**
   * Create a new PurchaseService instance
   */
  constructor() {
    super('purchases', purchaseSchema);
  }

  /**
   * Create a new purchase with products and optional freebie
   * @param {Object} purchaseData - Purchase data
   * @returns {Promise<Object>} Created purchase
   */
  async createPurchase(purchaseData) {
    try {
      // Validate products array
      if (!purchaseData.products || !Array.isArray(purchaseData.products) || purchaseData.products.length === 0) {
        throw new Error('Purchase must include at least one product');
      }

      // Validate each product in the products array
      purchaseData.products.forEach(product => {
        const validationResult = validateData(product, purchaseProductSchema);
        if (!validationResult.isValid) {
          throw new Error(`Product validation failed: ${JSON.stringify(validationResult.errors)}`);
        }
      });

      // Set purchase date if not provided
      if (!purchaseData.purchaseDate) {
        purchaseData.purchaseDate = Timestamp.now();
      }

      // Create the purchase
      const purchase = await this.create(purchaseData);

      // Update product quantities
      for (const product of purchaseData.products) {
        await productService.updateQuantity(product.productId, -product.qty);
      }

      // Record freebie sent if included
      if (purchaseData.freebieId) {
        const freebie = await freebieService.getById(purchaseData.freebieId);
        if (freebie) {
          await freebieService.recordFreebieSent({
            customerId: purchaseData.customerId,
            freebieId: purchaseData.freebieId,
            purchaseId: purchase.id,
            freebieName: freebie.name,
            sentDate: purchaseData.purchaseDate
          });
        }
      }

      return purchase;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get purchases by customer ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Array of purchases by the customer
   */
  async getPurchasesByCustomer(customerId) {
    try {
      return await this.query([
        { field: 'customerId', operator: '==', value: customerId }
      ], { orderByField: 'purchaseDate', orderDirection: 'desc' });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get purchases by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of purchases in the date range
   */
  async getPurchasesByDateRange(startDate, endDate) {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      return await this.query([
        { field: 'purchaseDate', operator: '>=', value: startTimestamp },
        { field: 'purchaseDate', operator: '<=', value: endTimestamp }
      ], { orderByField: 'purchaseDate', orderDirection: 'desc' });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get purchases with freebies
   * @returns {Promise<Array>} Array of purchases with freebies
   */
  async getPurchasesWithFreebies() {
    try {
      return await this.query([
        { field: 'freebieId', operator: '!=', value: null }
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate total sales for a given period
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<number>} Total sales amount
   */
  async calculateTotalSales(startDate, endDate) {
    try {
      const purchases = await this.getPurchasesByDateRange(startDate, endDate);
      return purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get monthly purchase statistics for the current year
   * @returns {Promise<Array>} Array of monthly purchase statistics
   */
  async getMonthlyPurchaseStats() {
    try {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st of current year
      const endDate = new Date(currentYear, 11, 31); // December 31st of current year
      
      const purchases = await this.getPurchasesByDateRange(startDate, endDate);
      
      // Initialize monthly stats
      const monthlyStats = Array(12).fill().map((_, i) => ({
        month: i + 1,
        monthName: new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }),
        totalSales: 0,
        purchaseCount: 0,
        averageAmount: 0
      }));
      
      // Calculate stats for each purchase
      purchases.forEach(purchase => {
        const month = purchase.purchaseDate instanceof Date 
          ? purchase.purchaseDate.getMonth()
          : purchase.purchaseDate.toDate().getMonth();
        
        monthlyStats[month].totalSales += purchase.totalAmount;
        monthlyStats[month].purchaseCount += 1;
      });
      
      // Calculate average amount
      monthlyStats.forEach(stat => {
        if (stat.purchaseCount > 0) {
          stat.averageAmount = stat.totalSales / stat.purchaseCount;
        }
      });
      
      return monthlyStats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a count of purchases for the current month
   * @returns {Promise<number>} Number of purchases in the current month
   */
  async getCurrentMonthPurchaseCount() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const purchases = await this.getPurchasesByDateRange(startOfMonth, endOfMonth);
      return purchases.length;
    } catch (error) {
      throw error;
    }
  }
}

// Helper function for validation
function validateData(data, schema) {
  // Reuse the validation function from validationService
  const errors = {};
  let isValid = true;

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
      return;
    }

    if (value === undefined || value === null || value === '') {
      return;
    }

    if (rules.validate && typeof rules.validate === 'function') {
      const validateResult = rules.validate(value, data);
      if (validateResult !== true) {
        errors[field] = validateResult || `${field} is invalid`;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
}

// Create and export an instance of PurchaseService
const purchaseService = new PurchaseService();
export default purchaseService;