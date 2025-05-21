
/**
 * Transforms snake_case keys in an object to camelCase
 * @param obj The object with snake_case keys
 * @returns A new object with camelCase keys
 */
export function snakeToCamel<T = any>(obj: Record<string, any>): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamel(v)) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = obj[key];
    
    result[camelKey] = typeof value === 'object' ? snakeToCamel(value) : value;
    
    return result;
  }, {} as Record<string, any>) as T;
}

/**
 * Transforms camelCase keys in an object to snake_case
 * @param obj The object with camelCase keys
 * @returns A new object with snake_case keys
 */
export function camelToSnake<T = any>(obj: Record<string, any>): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(v => camelToSnake(v)) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const value = obj[key];
    
    result[snakeKey] = typeof value === 'object' ? camelToSnake(value) : value;
    
    return result;
  }, {} as Record<string, any>) as T;
}

/**
 * Creates a data transformer for API requests and responses
 * @returns Functions for transforming data between frontend and API
 */
export const createApiTransformer = () => {
  return {
    /**
     * Transforms API response data to frontend model format
     * @param data The API response data
     * @returns Frontend model data
     */
    fromApi: <T = any>(data: any): T => {
      return snakeToCamel<T>(data);
    },
    
    /**
     * Transforms frontend model data to API request format
     * @param data The frontend model data
     * @returns API request data
     */
    toApi: <T = any>(data: any): T => {
      return camelToSnake<T>(data);
    }
  };
};

// Create and export a default transformer instance
export const apiTransformer = createApiTransformer();
