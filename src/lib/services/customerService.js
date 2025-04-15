// lib/services/customerService.js
import DbService from './dbService';
import { customerSchema } from '../schemas';

/**
 * Customer service for customer-related operations
 */
class CustomerService extends DbService {
  /**
   * Create a new CustomerService instance
   */
  constructor() {
    super('customers', customerSchema);
  }

  /**
   * Search customers by name (first name or last name)
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching customers
   */
  async searchByName(searchTerm) {
    try {
      const allCustomers = await this.getAll();
      
      // Perform client-side filtering (case-insensitive search in first and last name)
      const searchTermLower = searchTerm.toLowerCase();
      return allCustomers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchTermLower) || 
        customer.lastName.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search customers by pincode
   * @param {string} pincode - Pincode to search for
   * @returns {Promise<Array>} Array of matching customers
   */
  async searchByPincode(pincode) {
    try {
      return await this.query([{ field: 'pincode', operator: '==', value: pincode }]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get customers with birthdays in a given month
   * @param {number} month - Month (1-12)
   * @returns {Promise<Array>} Array of customers with birthdays in the month
   */
  async getCustomersWithBirthdaysInMonth(month) {
    try {
      const allCustomers = await this.getAll();
      
      return allCustomers.filter(customer => {
        if (!customer.dob) return false;
        
        // Convert Firestore timestamp to JS Date if needed
        const dobDate = customer.dob instanceof Date ? customer.dob : 
                       customer.dob.toDate ? customer.dob.toDate() : 
                       new Date(customer.dob);
        
        return dobDate.getMonth() + 1 === month;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get customers with anniversaries in a given month
   * @param {number} month - Month (1-12)
   * @returns {Promise<Array>} Array of customers with anniversaries in the month
   */
  async getCustomersWithAnniversariesInMonth(month) {
    try {
      const allCustomers = await this.getAll();
      
      return allCustomers.filter(customer => {
        if (!customer.anniversary) return false;
        
        // Convert Firestore timestamp to JS Date if needed
        const anniversaryDate = customer.anniversary instanceof Date ? customer.anniversary : 
                               customer.anniversary.toDate ? customer.anniversary.toDate() : 
                               new Date(customer.anniversary);
        
        return anniversaryDate.getMonth() + 1 === month;
      });
    } catch (error) {
      throw error;
    }
  }
}

// Create and export an instance of CustomerService
const customerService = new CustomerService();
export default customerService;