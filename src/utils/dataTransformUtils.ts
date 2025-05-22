
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
    
    // Create a more comprehensive mapping that handles nested objects properly
    if (camelKey === 'vehicles' && Array.isArray(value)) {
      // Special handling for vehicles array
      result[camelKey] = value.map(vehicle => {
        const transformedVehicle = snakeToCamel(vehicle);
        // Special case for latacc/latAcc to ensure it's properly mapped
        if (transformedVehicle.latAcc === undefined && (vehicle.latacc !== undefined || vehicle.lat_acc !== undefined)) {
          transformedVehicle.latAcc = vehicle.latacc !== undefined ? vehicle.latacc : vehicle.lat_acc;
        }
        return transformedVehicle;
      });
    } else if (camelKey === 'additionalExercises' && Array.isArray(value)) {
      // Special handling for additional_exercises array with deep property conversion
      result[camelKey] = value.map(exercise => {
        const transformedExercise = snakeToCamel(exercise);
        // Handle special case mappings for exercises
        if (transformedExercise.isMeasured === undefined && exercise.is_measured !== undefined) {
          transformedExercise.isMeasured = exercise.is_measured;
        }
        if (transformedExercise.measurementType === undefined && exercise.measurement_type !== undefined) {
          transformedExercise.measurementType = exercise.measurement_type;
        }
        return transformedExercise;
      });
    } else if (camelKey === 'latAcc' && value === undefined && obj.latacc !== undefined) {
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
    
    // Create a more comprehensive mapping that handles nested objects properly
    if (snakeKey === 'vehicles' && Array.isArray(value)) {
      // Special handling for vehicles array
      result[snakeKey] = value.map(vehicle => {
        const transformedVehicle = camelToSnake(vehicle);
        // Special case for latAcc/lat_acc to ensure it's properly mapped
        if (transformedVehicle.lat_acc === undefined && vehicle.latAcc !== undefined) {
          transformedVehicle.lat_acc = vehicle.latAcc;
        }
        return transformedVehicle;
      });
    } else if (snakeKey === 'additional_exercises' && Array.isArray(value)) {
      // Special handling for additionalExercises array with deep property conversion
      result[snakeKey] = value.map(exercise => {
        const transformedExercise = camelToSnake(exercise);
        // Handle special case mappings for exercises
        if (transformedExercise.is_measured === undefined && exercise.isMeasured !== undefined) {
          transformedExercise.is_measured = exercise.isMeasured;
        }
        if (transformedExercise.measurement_type === undefined && exercise.measurementType !== undefined) {
          transformedExercise.measurement_type = exercise.measurementType;
        }
        return transformedExercise;
      });
    } else if (snakeKey === 'lat_acc' && value === undefined && obj.latAcc !== undefined) {
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
      
      // Handle case where additional_exercises might be named differently
      if (data && data.additional_exercises === undefined && data.additionalExercises !== undefined) {
        data.additional_exercises = data.additionalExercises;
      }
      
      const transformed = snakeToCamel<T>(data);
      
      // Create additionalExercises if it doesn't exist
      if (transformed && (transformed as any).additionalExercises === undefined) {
        (transformed as any).additionalExercises = (data && data.additional_exercises) || [];
      }
      
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
      
      // Handle case where additionalExercises might be named differently
      if (data && data.additionalExercises === undefined && data.additional_exercises !== undefined) {
        data.additionalExercises = data.additional_exercises;
      }
      
      const transformed = camelToSnake<T>(data);
      
      // Create additional_exercises if it doesn't exist
      if (transformed && (transformed as any).additional_exercises === undefined) {
        (transformed as any).additional_exercises = (data && data.additionalExercises) || [];
      }
      
      console.log("After transformation (toApi):", JSON.stringify(transformed, null, 2));
      return transformed;
    }
  };
};

// Create and export a default transformer instance
export const apiTransformer = createApiTransformer();
