// lib/services/purchaseService.js
import DbService from './dbService';
import { purchaseSchema, purchaseProductSchema } from '../schemas';
import productService from './productService';
import freebieService from './freebieService';
import customerService from './customerService';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { validateData } from '../validation/validationService';

/**
 * Purchase service for purchase-related operations
 */
class PurchaseService extends DbService {
  constructor() {
    super('purchases', purchaseSchema);
  }

  async createPurchase(purchaseData) {
    try {
      let customerId = purchaseData.customerId;
      if (!customerId && purchaseData.customer) {
        const { phone, email } = purchaseData.customer;
        console.log('Debug: phone:', phone, 'email:', email);
        let existingCustomers = [];

        if (phone) {
          existingCustomers = await customerService.query([
            { field: 'phone', operator: '==', value: phone }
          ]);
          console.log('Debug: existingCustomers by phone:', existingCustomers.length);
        }

        if (existingCustomers.length === 0 && email) {
          existingCustomers = await customerService.query([
            { field: 'email', operator: '==', value: email }
          ]);
          console.log('Debug: existingCustomers by email:', existingCustomers.length);
        }

        if (existingCustomers.length > 0) {
          customerId = existingCustomers[0].id;
          console.log('Debug: customerId found:', customerId);
        } else {
          const newCustomer = await customerService.create(purchaseData.customer);
          customerId = newCustomer.id;
          console.log('Debug: new customer created with id:', customerId);
        }
      }

      if (!customerId) {
        throw new Error('Customer information is required');
      }

      purchaseData.customerId = customerId;

      // Validate the main purchase data after setting customerId
      const purchaseValidation = validateData(purchaseData, purchaseSchema);
      if (!purchaseValidation.isValid) {
        throw new Error(`Validation failed: ${JSON.stringify(purchaseValidation.errors)}`);
      }

      if (!purchaseData.products || !Array.isArray(purchaseData.products) || purchaseData.products.length === 0) {
        throw new Error('Purchase must include at least one product');
      }

      // Validate and process each product
      purchaseData.products.forEach(product => {
        const validationResult = validateData(product, purchaseProductSchema);
        if (!validationResult.isValid) {
          throw new Error(`Product validation failed: ${JSON.stringify(validationResult.errors)}`);
        }

        // Calculate subtotal if not provided
        if (typeof product.subtotal !== 'number') {
          product.subtotal = product.price * product.qty;
        }
      });

      if (!purchaseData.purchaseDate) {
        purchaseData.purchaseDate = Timestamp.now();
      }

      const purchase = await this.create(purchaseData);

      // Update product quantities
      for (const product of purchaseData.products) {
        await productService.updateQuantity(product.productId, -product.qty);
      }

      // Handle freebie if included
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
      console.error('Purchase creation failed:', error);
      throw error;
    }
  }

  async getPurchasesByCustomer(customerId) {
    try {
      return await this.query([
        { field: 'customerId', operator: '==', value: customerId }
      ], { orderByField: 'purchaseDate', orderDirection: 'desc' });
    } catch (error) {
      console.error('Error fetching customer purchases:', error);
      throw error;
    }
  }

  async getPurchasesByDateRange(startDate, endDate) {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      return await this.query([
        { field: 'purchaseDate', operator: '>=', value: startTimestamp },
        { field: 'purchaseDate', operator: '<=', value: endTimestamp }
      ], { orderByField: 'purchaseDate', orderDirection: 'desc' });
    } catch (error) {
      console.error('Error fetching purchases by date range:', error);
      throw error;
    }
  }

  async getPurchasesWithFreebies() {
    try {
      return await this.query([
        { field: 'freebieId', operator: '!=', value: null }
      ]);
    } catch (error) {
      console.error('Error fetching purchases with freebies:', error);
      throw error;
    }
  }

  async calculateTotalSales(startDate, endDate) {
    try {
      const purchases = await this.getPurchasesByDateRange(startDate, endDate);
      return purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
    } catch (error) {
      console.error('Error calculating total sales:', error);
      throw error;
    }
  }

  async getMonthlyPurchaseStats() {
    try {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);
      
      const purchases = await this.getPurchasesByDateRange(startDate, endDate);
      
      const monthlyStats = Array(12).fill().map((_, i) => ({
        month: i + 1,
        monthName: new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }),
        totalSales: 0,
        purchaseCount: 0,
        averageAmount: 0
      }));
      
      purchases.forEach(purchase => {
        const month = purchase.purchaseDate instanceof Date 
          ? purchase.purchaseDate.getMonth()
          : purchase.purchaseDate.toDate().getMonth();
        
        monthlyStats[month].totalSales += purchase.totalAmount;
        monthlyStats[month].purchaseCount += 1;
      });
      
      monthlyStats.forEach(stat => {
        if (stat.purchaseCount > 0) {
          stat.averageAmount = stat.totalSales / stat.purchaseCount;
        }
      });
      
      return monthlyStats;
    } catch (error) {
      console.error('Error generating monthly stats:', error);
      throw error;
    }
  }

  async getCurrentMonthPurchaseCount() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const purchases = await this.getPurchasesByDateRange(startOfMonth, endOfMonth);
      return purchases.length;
    } catch (error) {
      console.error('Error fetching current month purchases:', error);
      throw error;
    }
  }
}

const purchaseService = new PurchaseService();
export default purchaseService;