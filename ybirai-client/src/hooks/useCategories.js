import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiService } from '../utils/apiService';

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await apiService.student.get("/category", {
          headers: { 'Accept-Language': 'en' }
        });

        if (!response) {
          console.error('No response from API');
          throw new Error('No response from API');
        }

        if (!Array.isArray(response)) {
          console.error('Unexpected response format:', response);
          throw new Error('Unexpected response format');
        }

        return response;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 1,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => {
      const userEmail = localStorage.getItem('userEmail');

      return apiService.student.post('/category', categoryData, {
        headers: { 'Accept-Language': 'en', 'user-email': userEmail }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...categoryData }) => {
      const userEmail = localStorage.getItem('userEmail');

      console.log('user email client', userEmail);

      return apiService.student.put(`/category/${id}`, categoryData, {
        headers: { 'Accept-Language': 'en', 'user-email': userEmail }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      const userEmail = localStorage.getItem('userEmail');

      return apiService.student.delete(`/category/${id}`, {
        headers: { 'Accept-Language': 'en', 'user-email': userEmail }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
};

