import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a custom fetch implementation with timeout and retry logic
const customFetch = (url: RequestInfo | URL, options?: RequestInit) => {
  const MAX_RETRIES = 3;
  const TIMEOUT = 15000; // 15 seconds timeout
  
  const fetchWithRetry = async (retriesLeft: number): Promise<Response> => {
    const controller = new AbortController();
    const { signal } = controller;
    
    // Create a promise that rejects after the timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);
    
    try {
      // Create the fetch promise with the abort signal
      const response = await fetch(url, {
        ...options,
        signal,
      });
      
      clearTimeout(timeoutId);
      
      // If response is not ok and we have retries left, retry
      if (!response.ok && retriesLeft > 0) {
        console.log(`Retrying fetch, ${retriesLeft} retries left`);
        return fetchWithRetry(retriesLeft - 1);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If we have retries left and it's a network error, retry
      if (retriesLeft > 0 && (error instanceof TypeError || error instanceof DOMException)) {
        console.log(`Fetch failed, retrying... ${retriesLeft} retries left`);
        // Add a small delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(retriesLeft - 1);
      }
      
      throw error;
    }
  };
  
  return fetchWithRetry(MAX_RETRIES);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: customFetch as typeof fetch,
  },
});

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (error.code === 'PGRST116') {
    return 'No videos available at the moment.';
  }
  
  // Handle PostgreSQL foreign key constraint violations
  if (error.code === '23503') {
    if (error.message.includes('registrations_course_id_fkey')) {
      return 'Cannot delete this course because there are student registrations associated with it. Please delete or reassign the registrations first, then try again.';
    }
    return 'Cannot delete this item because it is referenced by other records. Please remove the related records first.';
  }
  
  return error.message || 'An unexpected error occurred';
};