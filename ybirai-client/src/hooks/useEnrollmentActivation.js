import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../utils/apiService.js";

const logger = (action, data) => {
  console.log(`[useEnrollmentActivation] ${action}:`, data);
};

export const useEnrollmentActivation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId) => {
      logger('Starting activation request', { enrollmentId });
      try {
        const response = await apiService.student.post(
          `/enrollments/${enrollmentId}/activate`,
          null,
          { headers: { 'Accept-Language': 'en' } }
        );
        logger('Activation request successful', { 
          enrollmentId,
          response
        });
        return response;
      } catch (error) {
        logger('Activation request failed', { 
          enrollmentId,
          error: error?.message,
          status: error?.response?.status,
          data: error?.response?.data
        });
        throw error;
      }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries(['enrollments']);
      options.onSuccess?.(...args);
    },
    onError: options.onError,
  });
};
