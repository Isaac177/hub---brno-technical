// This file is no longer needed as we're using the comments hook
// You can safely delete this file

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { apiService } from "../utils/apiService";

export const useDiscussions = (postId, { page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['discussions', postId, page, limit],
    queryFn: async () => {
      try {
        const response = await apiService.student.get(`/posts/${postId}/discussions?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch discussions');
        throw error;
      }
    },
    enabled: !!postId,
  });
};

export const useReplies = (discussionId, { page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['discussion-replies', discussionId, page, limit],
    queryFn: async () => {
      try {
        const response = await apiService.student.get(`/discussions/${discussionId}/replies?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch replies');
        throw error;
      }
    },
    enabled: !!discussionId,
  });
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content, postId, parentId }) => {
      const userEmail = localStorage.getItem('userEmail');
      const response = await apiService.student.post('/discussions', 
        { content, postId, parentId }, 
        {
          headers: {
            'user-email': userEmail,
            'notification-type': parentId ? 'discussion-reply' : 'new-discussion'
          }
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['discussions', variables.postId]);
      if (variables.parentId) {
        queryClient.invalidateQueries(['discussion-replies', variables.parentId]);
      }
    },
  });
};

export const useUpdateDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }) => {
      const userEmail = localStorage.getItem('userEmail');
      const response = await apiService.student.put(
        `/discussions/${id}`,
        { content },
        {
          headers: {
            'user-email': userEmail,
            'notification-type': 'discussion-update'
          }
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['discussions']);
      queryClient.invalidateQueries(['discussion-replies']);
    },
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const userEmail = localStorage.getItem('userEmail');
      await apiService.student.delete(`/discussions/${id}`, {
        headers: {
          'user-email': userEmail,
          'notification-type': 'discussion-delete'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      queryClient.invalidateQueries(['discussion-replies']);
    },
  });
};

export const useToggleDiscussionLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discussionId) => {
      const userEmail = localStorage.getItem('userEmail');
      const response = await apiService.student.post(
        `/discussions/${discussionId}/like`,
        {},
        {
          headers: {
            'user-email': userEmail,
            'notification-type': 'discussion-like'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      queryClient.invalidateQueries(['discussion-replies']);
    },
  });
};
