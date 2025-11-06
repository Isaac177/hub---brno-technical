import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { apiService } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';

export const useComments = (postId, { page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['comments', postId, page, limit],
    queryFn: async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await apiService.student.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`, {
          headers: { 
            'Accept-Language': 'en',
            'user-email': userEmail
          }
        });
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch comments');
        throw error;
      }
    },
    enabled: !!postId,
  });
};

export const useReplies = (commentId, { page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['replies', commentId, page, limit],
    queryFn: async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await apiService.student.get(`/comments/${commentId}/replies?page=${page}&limit=${limit}`, {
          headers: { 
            'Accept-Language': 'en',
            'user-email': userEmail
          }
        });
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch replies');
        throw error;
      }
    },
    enabled: !!commentId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, postId, parentId }) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      const response = await apiService.student.post('/comments',
        { content, postId, parentId },
        { headers: { 'Accept-Language': 'en', 'user-email': userEmail } }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['comments', variables.postId]);
      if (variables.parentId) {
        queryClient.invalidateQueries(['replies', variables.parentId]);
      }
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      const response = await apiService.student.put(`/comments/${id}`,
        { content },
        { headers: { 'Accept-Language': 'en', 'user-email': userEmail } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['comments']);
      queryClient.invalidateQueries(['replies']);
      toast.success('Comment updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      const response = await apiService.student.delete(`/comments/${id}`, {
        headers: { 'Accept-Language': 'en', 'user-email': userEmail }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      queryClient.invalidateQueries(['replies']);
      toast.success('Comment deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
};

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      const response = await apiService.student.post(`/comments/${commentId}/like`, {}, {
        headers: { 'Accept-Language': 'en', 'user-email': userEmail }
      });
      return response.data;
    },
    onSuccess: (_, commentId) => {
      queryClient.invalidateQueries(['comments']);
      queryClient.invalidateQueries(['replies']);
      toast.success('Like toggled successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle like');
    },
  });
};

export const useAllComments = ({ page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['admin-comments', page, limit],
    queryFn: async () => {
      const userEmail = localStorage.getItem('userEmail');
      console.log('useAllComments userEmail:', userEmail);

      if (!userEmail) {
        toast.error('User email not found');
        throw new Error('User email not found');
      }

      const response = await apiService.student.get(`/comments?page=${page}&limit=${limit}`, {
        headers: { 'Accept-Language': 'en', 'user-email': userEmail }
      });

      return response;
    },
  });
};

export const useBlockComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      const response = await apiService.student.put(`/comments/${commentId}/block`, {}, {
        headers: { 'Accept-Language': 'en', 'user-email': userEmail }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments']);
      toast.success('Comment status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update comment status');
    },
  });
};
