// lib/services/productService.js
import DbService from './dbService';
import { productSchema } from '../schemas';

/**
 * Product service for product-related operations
 */
class ProductService extends DbService {
  /**
   * Create a new ProductService instance
   */
  constructor() {
    super('products', productSchema);
  }

  /**
   * Search products by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching products
   */
  async searchByName(searchTerm) {
    try {
      const allProducts = await this.getAll();
      
      // Perform client-side filtering (case-insensitive search in name)
      const searchTermLower = searchTerm.toLowerCase();
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search products by variant
   * @param {string} variant - Variant to search for
   * @returns {Promise<Array>} Array of matching products
   */
  async searchByVariant(variant) {
    try {
      return await this.query([{ field: 'variant', operator: '==', value: variant }]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products with price in a specified range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Promise<Array>} Array of products in price range
   */
  async getProductsByPriceRange(minPrice, maxPrice) {
    try {
      const allProducts = await this.getAll();
      
      return allProducts.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products with low inventory (below specified threshold)
   * @param {number} threshold - Inventory threshold
   * @returns {Promise<Array>} Array of products with low inventory
   */
  async getLowInventoryProducts(threshold = 5) {
    try {
      return await this.query([{ field: 'qty', operator: '<=', value: threshold }]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product quantity
   * @param {string} id - Product ID
   * @param {number} qtyChange - Quantity change (positive or negative)
   * @returns {Promise<Object>} Updated product
   */
  async updateQuantity(id, qtyChange) {
    try {
      const product = await this.getById(id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      if (!product.category) {
        throw new Error(`Product with ID ${id} is missing required field 'category'`);
      }
      
      const newQty = product.qty + qtyChange;
      if (newQty < 0) {
        throw new Error(`Cannot reduce quantity below zero. Current: ${product.qty}, Change: ${qtyChange}`);
      }
      
      return await this.update(id, { ...product, qty: newQty });
    } catch (error) {
      throw error;
    }
  }
}

// Create and export an instance of ProductService
const productService = new ProductService();
export default productService;