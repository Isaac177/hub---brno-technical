import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetUsers = (authToken, language = 'en') => {
  return useQuery({
    queryKey: ['users', authToken, language],
    queryFn: async () => {
      console.log('🔍 useGetUsers - Starting API call', { 
        endpoint: '/student', 
        language,
        hasToken: !!authToken 
      });
      
      const result = await apiService.user.get(`/student`, {
        headers: { 
          'Accept-Language': language, 
          'Authorization': `Bearer ${authToken}` 
        }
      });
      
      console.log('📡 useGetUsers - Raw API response:', result);
      console.log('📡 useGetUsers - Response type:', typeof result, 'isArray:', Array.isArray(result));
      console.log('📡 useGetUsers - Result length:', result?.length);
      
      // Simply return the array - no pagination logic in hook
      return result;
    },
    enabled: Boolean(authToken),
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    retry: 1,
    onError: (error) => {
      console.error('❌ useGetUsers - Query failed:', error);
    },
    onSuccess: (data) => {
      console.log('✅ useGetUsers - Query succeeded:', data);
    }
  });
};

export const useDeleteUser = (authToken) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, email }) => {
      console.log('🗑️ Deleting user:', { userId, email });
      return await apiService.user.delete(`/student/${userId}`, {
        data: JSON.stringify(email),
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    }
  });
};

export const useActivateUser = (authToken) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, activate = true }) => {
      return await apiService.user.put(`/user/${userId}/status`, {
        status: activate ? 'ACTIVE' : 'INACTIVE'
      }, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      console.error('Activate/Deactivate user error:', error);
    }
  });
};

export const useUserManagement = (authToken, language = 'en') => {
  const deleteUserMutation = useDeleteUser(authToken);
  const activateUserMutation = useActivateUser(authToken);

  const deleteUser = async (userId, email) => {
    return deleteUserMutation.mutateAsync({ userId, email });
  };

  const activateUser = async (userId) => {
    return activateUserMutation.mutateAsync({ userId, activate: true });
  };

  const deactivateUser = async (userId) => {
    return activateUserMutation.mutateAsync({ userId, activate: false });
  };

  return {
    deleteUser,
    activateUser,
    deactivateUser,
    isDeleting: deleteUserMutation.isLoading,
    isActivating: activateUserMutation.isLoading,
    deleteError: deleteUserMutation.error,
    activateError: activateUserMutation.error
  };
};