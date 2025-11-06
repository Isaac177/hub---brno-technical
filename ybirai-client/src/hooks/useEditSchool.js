import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { prepareSchoolFormData } from "./useCreateSchool";
import { apiService } from "../utils/apiService.js";

export const useEditSchool = (schoolId) => {
  const queryClient = useQueryClient();
  const language = localStorage.getItem('language') || 'en';

  const editSchoolWithFormData = async (schoolData) => {
    try {
      const formData = prepareSchoolFormData(schoolData);
      return await apiService.student.put(`/school/${schoolId}`, formData, {
        headers: { 'Accept-Language': language }
      });
    } catch (error) {
      console.error('Error in editSchoolWithFormData:', error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: editSchoolWithFormData,
    onSuccess: () => {
      queryClient.invalidateQueries(['schools', language]);
      toast.success('School updated successfully');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Error updating school';
      console.error('Error updating school:', error);
      toast.error(errorMessage);
    }
  });
};
