// lib/services/freebieService.js
import DbService from './dbService';
import { freebieSchema, freebieSentSchema } from '../schemas';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config';

/**
 * Freebie service for freebie-related operations
 */
class FreebieService extends DbService {
  /**
   * Create a new FreebieService instance
   */
  constructor() {
    super('freebies', freebieSchema);
    this.freebieSentRef = collection(firestore, 'freebiesSent');
  }

  /**
   * Search freebies by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching freebies
   */
  async searchByName(searchTerm) {
    try {
      const allFreebies = await this.getAll();
      
      // Perform client-side filtering (case-insensitive search in name)
      const searchTermLower = searchTerm.toLowerCase();
      return allFreebies.filter(freebie => 
        freebie.name.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available freebies (quantity > 0)
   * @returns {Promise<Array>} Array of available freebies
   */
  async getAvailableFreebies() {
    try {
      return await this.query([{ field: 'availableQty', operator: '>', value: 0 }]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Record a freebie sent to a customer
   * @param {Object} freebieSentData - Freebie sent data
   * @returns {Promise<Object>} Created freebie sent record
   */
  async recordFreebieSent(freebieSentData) {
    try {
      // Validate data
      const freebieSentService = new DbService('freebiesSent', freebieSentSchema);
      const result = await freebieSentService.create(freebieSentData);
      
      // Update freebie quantity
      const freebie = await this.getById(freebieSentData.freebieId);
      if (freebie) {
        await this.update(freebieSentData.freebieId, {
          ...freebie,
          availableQty: Math.max(0, freebie.availableQty - 1)
        });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a customer has already received a specific freebie
   * @param {string} customerId - Customer ID
   * @param {string} freebieId - Freebie ID
   * @returns {Promise<boolean>} True if customer already received the freebie
   */
  async hasCustomerReceivedFreebie(customerId, freebieId) {
    try {
      const q = query(
        this.freebieSentRef,
        where('customerId', '==', customerId),
        where('freebieId', '==', freebieId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all freebies sent to a customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Array of freebies sent to the customer
   */
  async getFreebiesSentToCustomer(customerId) {
    try {
      const freebieSentService = new DbService('freebiesSent', freebieSentSchema);
      return await freebieSentService.query([
        { field: 'customerId', operator: '==', value: customerId }
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get freebies that a customer has not received yet
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Array of freebies not received by the customer
   */
  async getFreebiesNotReceivedByCustomer(customerId) {
    try {
      // Get all freebies and freebies sent to the customer
      const allFreebies = await this.getAll();
      const freebiesSent = await this.getFreebiesSentToCustomer(customerId);
      
      // Get set of freebie IDs already sent to the customer
      const freebieIdsSent = new Set(freebiesSent.map(fs => fs.freebieId));
      
      // Filter out freebies already sent and with zero quantity
      return allFreebies.filter(freebie => 
        !freebieIdsSent.has(freebie.id) && freebie.availableQty > 0
      );
    } catch (error) {
      throw error;
    }
  }
}

// Create and export an instance of FreebieService
const freebieService = new FreebieService();
export default freebieService;