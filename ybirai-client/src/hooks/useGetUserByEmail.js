import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserContext.jsx";
import { apiService } from "../utils/apiService";

export const useGetUserByEmail = () => {
  const { updateUserData } = useUserData();
  const { session } = useAuth();
  const email = session?.tokens?.idToken?.payload?.email;

  return useQuery({
    queryKey: ['user', email],
    queryFn: async () => {
      if (!email) {
        throw new Error('Missing email');
      }

      try {
        const response = await apiService.user.get(`/user/byEmail/${encodeURIComponent(email)}`, {
          headers: { 'Accept-Language': 'en' }
        });

        if (response) {
          updateUserData(response);
          return response;
        }

        throw new Error('No user data received');
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    },
    enabled: !!email,
    retry: 2,
    staleTime: 300000,
    cacheTime: 3600000,
  });
};
