// lib/services/authService.js
import { 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail
  } from "firebase/auth";
  import { auth } from "../firebase/config";
  
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<UserCredential>} Firebase user credential
   */
  export const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  };
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  export const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };
  
  /**
   * Reset password for a user
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };
  
  /**
   * Subscribe to auth state changes
   * @param {function} callback - Callback function to handle auth state changes
   * @returns {function} Unsubscribe function
   */
  export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  };
  
  /**
   * Get the current auth user
   * @returns {User|null} Current user or null if not authenticated
   */
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  export const isAuthenticated = () => {
    return !!auth.currentUser;
  };