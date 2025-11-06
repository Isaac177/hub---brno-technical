import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { apiService } from "../utils/apiService";

export const usePost = (id) => {
  return useQuery({
      queryKey: ['post', id],
      queryFn: async () => {
      try {

        //const response = await studentServiceDev.get(`/api/posts/${id}`);

        const response = await apiService.student.get(`/posts/${id}`, {
          headers: { 'Accept-Language': 'en' }
        });


        return response.data;

      } catch (error) {
        toast.error('Failed to fetch post');
        console.error('Error fetching post:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const usePostBySlug = (slug, { page = 1, limit = 5 } = {}) => {
  return useQuery({
    queryKey: ['post', slug, page, limit],
    queryFn: async () => {
      try {
        const response = await apiService.student.get(`/posts/slug/${slug}?page=${page}&limit=${limit}`, {
          headers: { 'Accept-Language': 'en' }
        });
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch post');
        console.error('Error fetching post:', error);
        throw error;
      }
    },
    enabled: !!slug,
  });
};


export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      return apiService.student.post('/posts', postData, {
        headers: {
          'Accept-Language': 'en',
          'user-email': userEmail,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...postData }) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      return apiService.student.put(`/posts/${id}`, postData, {
        headers: {
          'Accept-Language': 'en',
          'user-email': userEmail,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });
};

export const useUpdatePostDev = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...postData }) => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }
      return apiService.student.put(`/posts/${id}`, postData, {
        headers: {
          'user-email': userEmail,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      return apiService.student.delete(`/posts/${id}`, {
        headers: {
          'Accept-Language': 'en',
          'user-email': userEmail,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });
};

export const useTogglePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      return apiService.student.post(`/posts/${postId}/like`, {}, {
        headers: {
          'Accept-Language': 'en',
          'user-email': userEmail,
        }
      });
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries(['post', postId]);
      toast.success('Post like toggled successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle like');
    },
  });
};

export const useNewsPosts = ({ page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['news-posts', page, limit],
    queryFn: async () => {
      try {

        const response = await apiService.student.get(`/posts?page=${page}&limit=${limit}&type=NEWS&type=EVENT`, {
          headers: { 'Accept-Language': 'en' }
        });

        console.log('News posts response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching news posts:', error);
        throw error;
      }
    },
  });
};

export const usePosts = ({ type = "ALL", categoryId, search, page = 1, limit = 10 } = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', type, categoryId, search, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });

      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', categoryId);

      if (type !== "ALL") {
        params.append('type', type);
      }

      if (type === "ALL") {
        params.append('type', 'NEWS');
        params.append('type', 'EVENT');
        params.append('type', 'DISCUSSION');
        params.append('type', 'ANNOUNCEMENT');
      }

      const url = `/posts${type !== "ALL" ? `/type/${type}` : ''}?${params.toString()}`;
      return apiService.student.get(url, {
        headers: { 'Accept-Language': 'en' }
      });
    },
    select: (response) => response,
  });

  console.log('post Response:', data);

  const { mutate: deletePost } = useDeletePost();
  const { mutate: toggleLike } = useTogglePostLike();

  return {
    data,
    isLoading,
    error,
    refetch,
    deletePost,
    toggleLike,
  };
};

export const usePostStats = () => {
  return useQuery({
    queryKey: ['post-stats'],
    queryFn: async () => {
      const response = await apiService.student.get('/posts/stats', {
        headers: { 'Accept-Language': 'en' }
      });
      console.log('Post Stats Response:', response);
      return response;
    }
  });
};
