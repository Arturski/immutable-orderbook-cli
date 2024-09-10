// errorHandler.ts
export const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error.message || error);
    // Add more sophisticated error handling/logging as needed
  };
  