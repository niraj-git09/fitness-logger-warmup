/**
 * FitCheck Client Configuration
 * Automatically uses VITE_API_URL in production, falls back to http://localhost:5000 in local development.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
