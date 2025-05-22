
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
    
    // Special case mapping for known fields
    if (camelKey === 'latAcc' && value === undefined && obj.latacc !== undefined) {
      result[camelKey] = obj.latacc;
    } else if (camelKey === 'isMeasured' && value === undefined && obj.is_measured !== undefined) {
      result[camelKey] = obj.is_measured;
    } else if (camelKey === 'measurementType' && value === undefined && obj.measurement_type !== undefined) {
      result[camelKey] = obj.measurement_type;
    } else {
      // Regular recursion for nested objects and arrays
      result[camelKey] = typeof value === 'object' ? snakeToCamel(value) : value;
    }
    
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
    
    // Special case mapping for known fields
    if (snakeKey === 'lat_acc' && value === undefined && obj.latAcc !== undefined) {
      result[snakeKey] = obj.latAcc;
    } else if (snakeKey === 'is_measured' && value === undefined && obj.isMeasured !== undefined) {
      result[snakeKey] = obj.isMeasured;
    } else if (snakeKey === 'measurement_type' && value === undefined && obj.measurementType !== undefined) {
      result[snakeKey] = obj.measurementType;
    } else {
      // Regular recursion for nested objects and arrays
      result[snakeKey] = typeof value === 'object' ? camelToSnake(value) : value;
    }
    
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
      console.log("Before transformation (fromApi):", JSON.stringify(data, null, 2));
      const transformed = snakeToCamel<T>(data);
      console.log("After transformation (fromApi):", JSON.stringify(transformed, null, 2));
      return transformed;
    },
    
    /**
     * Transforms frontend model data to API request format
     * @param data The frontend model data
     * @returns API request data
     */
    toApi: <T = any>(data: any): T => {
      console.log("Before transformation (toApi):", JSON.stringify(data, null, 2));
      const transformed = camelToSnake<T>(data);
      console.log("After transformation (toApi):", JSON.stringify(transformed, null, 2));
      return transformed;
    }
  };
};

// Create and export a default transformer instance
export const apiTransformer = createApiTransformer();
