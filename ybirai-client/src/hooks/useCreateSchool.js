import { apiService } from "../utils/apiService.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const prepareSchoolFormData = (schoolData) => {
  const formData = new FormData();

  formData.append('request', new Blob(
    [JSON.stringify(schoolData.request)],
    { type: 'application/json' }
  ));

  if (schoolData.logo instanceof File) {
    formData.append('logo', schoolData.logo);
  }

  for (let pair of formData.entries()) {
    console.log('FormData entry:', pair[0], typeof pair[1], pair[1]);
  }

  return formData;
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  const language = localStorage.getItem('language') || 'en';

  const createSchoolWithFormData = async (schoolData) => {
    try {
      const formData = prepareSchoolFormData(schoolData);
      return await apiService.user.post('/school', formData, language);
    } catch (error) {
      console.error('Error in createSchoolWithFormData:', error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: createSchoolWithFormData,
    onSuccess: () => {
      queryClient.invalidateQueries(['schools', language]);
      toast.success('School created successfully');
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Error creating school';
      console.error('Error creating school:', error);
      toast.error(errorMessage);
    }
  });
};
