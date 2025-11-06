import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserContext.jsx";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { apiService } from "../utils/apiService.js";

export const useGetUserByEmailDev = () => {
  const { updateUserData } = useUserData();
  const { session } = useAuth();
  const { displayLanguage } = useLanguage();
  const email = session?.tokens?.idToken?.payload?.email;

  return useQuery({
    queryKey: ['user', email],
    queryFn: async () => {
      if (!email) {
        console.error('Missing required data:', { email });
        throw new Error('Missing email');
      }

      try {
        // const response = await apiCall(
        //   `/user/byEmail/${email}`,
        //   'GET',
        //   null,
        //   { language: displayLanguage }
        // );

        // Add language header for API requests
        const response = await apiService.user.get(`/user/byEmail/${email}`, {
          headers: {
            'Accept-Language': displayLanguage
          }
        });

        if (!response) {
          throw new Error('No user data received');
        }

        console.log('User data received from API:', response);
        updateUserData(response);
        return response;
      } catch (error) {
        console.error('API call error:', error);
        throw error;
      }
    },
    enabled: !!email,
    staleTime: 0,
    retry: false
  });
};
