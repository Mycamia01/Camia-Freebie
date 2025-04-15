// lib/services/dbService.js
import { 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp 
  } from "firebase/firestore";
  import { firestore } from "../firebase/config";
  import { validateData } from "../validation/validationService";
  
  /**
   * Base CRUD service for Firestore operations
   */
  class DbService {
    /**
     * Create a new DbService instance
     * @param {string} collectionName - Name of the Firestore collection
     * @param {Object} schema - Schema for validation
     */
    constructor(collectionName, schema) {
      this.collectionRef = collection(firestore, collectionName);
      this.collectionName = collectionName;
      this.schema = schema;
    }
  
    /**
     * Create a new document
     * @param {Object} data - Document data
     * @returns {Promise<Object>} Created document with ID
     */
    async create(data) {
      // Validate data against schema
      const validationResult = validateData(data, this.schema);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`);
      }
  
      try {
        // Add timestamps
        const dataWithTimestamps = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
  
        // Add document to Firestore
        const docRef = await addDoc(this.collectionRef, dataWithTimestamps);
        return { id: docRef.id, ...data };
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Get a document by ID
     * @param {string} id - Document ID
     * @returns {Promise<Object|null>} Document data or null if not found
     */
    async getById(id) {
      try {
        const docRef = doc(firestore, this.collectionName, id);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          return null;
        }
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Get all documents from the collection
     * @returns {Promise<Array>} Array of documents
     */
    async getAll() {
      try {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Update a document by ID
     * @param {string} id - Document ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated document
     */
    async update(id, data) {
      // Validate data against schema
      const validationResult = validateData(data, this.schema);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`);
      }
  
      try {
        const docRef = doc(firestore, this.collectionName, id);
        
        // Add updatedAt timestamp
        const dataWithTimestamp = {
          ...data,
          updatedAt: serverTimestamp()
        };
  
        await updateDoc(docRef, dataWithTimestamp);
        return { id, ...data };
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Delete a document by ID
     * @param {string} id - Document ID
     * @returns {Promise<void>}
     */
    async delete(id) {
      try {
        const docRef = doc(firestore, this.collectionName, id);
        await deleteDoc(docRef);
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Query documents with filters
     * @param {Array} filters - Array of filter objects { field, operator, value }
     * @param {Object} options - Query options (orderByField, orderDirection, limitCount)
     * @returns {Promise<Array>} Array of documents matching the query
     */
    async query(filters = [], options = {}) {
      try {
        let q = this.collectionRef;
  
        // Add filters
        if (filters.length > 0) {
          filters.forEach(filter => {
            q = query(q, where(filter.field, filter.operator, filter.value));
          });
        }
  
        // Add ordering
        if (options.orderByField) {
          q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
        }
  
        // Add limit
        if (options.limitCount) {
          q = query(q, limit(options.limitCount));
        }
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        throw error;
      }
    }
  }
  
  export default DbService;