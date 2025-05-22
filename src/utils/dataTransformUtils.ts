
/**
 * Transforms snake_case keys in an object to camelCase
 * @param obj The object with snake_case keys
 * @returns A new object with camelCase keys
 */
export function snakeToCamel<T = any>(obj: Record<string, any> | string | null | undefined): T {
  // Handle case where input is a string that might be JSON
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      console.error("Failed to parse JSON string:", e);
      return obj as unknown as T;
    }
  }
  
  // Handle null, undefined, or non-object inputs
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj as T;
  }
  
  // Handle arrays by recursively transforming each element
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamel(v)) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = obj[key];
    
    // Special handling for additional_exercises -> additionalExercises mapping
    if (key === 'additional_exercises' && Array.isArray(value)) {
      result['additionalExercises'] = value.map(exercise => {
        const transformedExercise = snakeToCamel(exercise);
        // Ensure proper mapping of special fields
        if (transformedExercise.isMeasured === undefined && exercise.is_measured !== undefined) {
          transformedExercise.isMeasured = exercise.is_measured;
        }
        if (transformedExercise.measurementType === undefined && exercise.measurement_type !== undefined) {
          transformedExercise.measurementType = exercise.measurement_type;
        }
        // Map nested parameters if they exist
        if (exercise.parameters) {
          transformedExercise.parameters = snakeToCamel(exercise.parameters);
        }
        return transformedExercise;
      });
      // Skip adding with the original key
      return result;
    }
    // Special handling for vehicles array with deep property conversion
    else if (camelKey === 'vehicles' && Array.isArray(value)) {
      result[camelKey] = value.map(vehicle => {
        const transformedVehicle = snakeToCamel(vehicle);
        // Special case for latacc/latAcc to ensure it's properly mapped
        if (transformedVehicle.latAcc === undefined && (vehicle.latacc !== undefined || vehicle.lat_acc !== undefined)) {
          transformedVehicle.latAcc = vehicle.latacc !== undefined ? vehicle.latacc : vehicle.lat_acc;
        }
        return transformedVehicle;
      });
    } 
    // Special individual field mappings
    else if (camelKey === 'latAcc' && value === undefined && obj.latacc !== undefined) {
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
export function camelToSnake<T = any>(obj: Record<string, any> | null | undefined): T {
  // Handle null, undefined, or non-object inputs
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj as T;
  }
  
  // Handle arrays by recursively transforming each element
  if (Array.isArray(obj)) {
    return obj.map(v => camelToSnake(v)) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const value = obj[key];
    
    // Special handling for additionalExercises -> additional_exercises mapping
    if (key === 'additionalExercises' && Array.isArray(value)) {
      result['additional_exercises'] = value.map(exercise => {
        const transformedExercise = camelToSnake(exercise);
        // Ensure proper mapping of special fields
        if (transformedExercise.is_measured === undefined && exercise.isMeasured !== undefined) {
          transformedExercise.is_measured = exercise.isMeasured;
        }
        if (transformedExercise.measurement_type === undefined && exercise.measurementType !== undefined) {
          transformedExercise.measurement_type = exercise.measurementType;
        }
        // Map nested parameters if they exist
        if (exercise.parameters) {
          transformedExercise.parameters = camelToSnake(exercise.parameters);
        }
        return transformedExercise;
      });
      // Skip adding with the original key
      return result;
    }
    // Special handling for vehicles array with deep property conversion
    else if (snakeKey === 'vehicles' && Array.isArray(value)) {
      result[snakeKey] = value.map(vehicle => {
        const transformedVehicle = camelToSnake(vehicle);
        // Special case for latAcc/lat_acc to ensure it's properly mapped
        if (transformedVehicle.lat_acc === undefined && vehicle.latAcc !== undefined) {
          transformedVehicle.lat_acc = vehicle.latAcc;
        }
        return transformedVehicle;
      });
    } 
    // Special individual field mappings
    else if (snakeKey === 'lat_acc' && value === undefined && obj.latAcc !== undefined) {
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
      console.log("Before transformation (fromApi) - Data type:", typeof data);
      console.log("Raw data:", data);
      
      // Parse JSON string if needed
      if (typeof data === 'string') {
        try {
          console.log("Attempting to parse data as JSON string");
          data = JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse JSON string:", e);
          // Continue with original data if parsing fails
        }
      }
      
      // Deep clone to avoid modifying the original
      let dataToTransform = data;
      if (dataToTransform && typeof dataToTransform === 'object') {
        try {
          dataToTransform = JSON.parse(JSON.stringify(dataToTransform));
        } catch (e) {
          console.error("Failed to clone data:", e);
        }
      }
      
      // Special handling for additional_exercises key
      if (dataToTransform && dataToTransform.additional_exercises !== undefined) {
        console.log("Found additional_exercises in the data");
        // Ensure additionalExercises will be set during transformation
      } else if (dataToTransform && dataToTransform.additionalExercises !== undefined) {
        console.log("Found additionalExercises in the data");
        dataToTransform.additional_exercises = dataToTransform.additionalExercises;
      }
      
      // Log the pre-processed data
      console.log("Data before snake to camel transformation:", JSON.stringify(dataToTransform, null, 2));
      
      // Transform the data
      const transformed = snakeToCamel<T>(dataToTransform);
      
      // Ensure additionalExercises exists in the transformed result
      if (transformed && (transformed as any).additionalExercises === undefined) {
        console.log("additionalExercises not found in transformed data, creating an empty array");
        (transformed as any).additionalExercises = 
          (dataToTransform && (dataToTransform.additional_exercises || dataToTransform.additionalExercises)) || [];
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
      console.log("Before transformation (toApi) - Data type:", typeof data);
      console.log("Raw data:", JSON.stringify(data, null, 2));
      
      // Deep clone to avoid modifying the original
      let dataToTransform = data;
      if (dataToTransform && typeof dataToTransform === 'object') {
        try {
          dataToTransform = JSON.parse(JSON.stringify(dataToTransform));
        } catch (e) {
          console.error("Failed to clone data:", e);
        }
      }
      
      // Special handling for additionalExercises key
      if (dataToTransform && dataToTransform.additionalExercises !== undefined) {
        console.log("Found additionalExercises in the data");
        // Ensure additional_exercises will be set during transformation
      } else if (dataToTransform && dataToTransform.additional_exercises !== undefined) {
        console.log("Found additional_exercises in the data");
        dataToTransform.additionalExercises = dataToTransform.additional_exercises;
      }
      
      // Log the pre-processed data
      console.log("Data before camel to snake transformation:", JSON.stringify(dataToTransform, null, 2));
      
      // Transform the data
      const transformed = camelToSnake<T>(dataToTransform);
      
      // Ensure additional_exercises exists in the transformed result
      if (transformed && (transformed as any).additional_exercises === undefined) {
        console.log("additional_exercises not found in transformed data, creating an empty array");
        (transformed as any).additional_exercises = 
          (dataToTransform && (dataToTransform.additionalExercises || dataToTransform.additional_exercises)) || [];
      }
      
      console.log("After transformation (toApi):", JSON.stringify(transformed, null, 2));
      return transformed;
    }
  };
};

// Create and export a default transformer instance
export const apiTransformer = createApiTransformer();
