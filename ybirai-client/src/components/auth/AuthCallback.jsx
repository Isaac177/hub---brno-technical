import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingCircle } from 'lucide-react';
import { useGetUserByEmail } from '../../hooks/useGetUserByEmail';
import { useLanguage } from '../../contexts/LanguageContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { userSub, updateAuthState } = useAuth();
  const { refetch: refetchUserData } = useGetUserByEmail();
  const { displayLanguage } = useLanguage();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const authResult = await authService.handleSocialLoginRedirect();

        // Update auth state with userSub
        updateAuthState({
          ...authResult,
          userSub
        });

        // Fetch user data
        await refetchUserData();

        // Navigate to education page with userSub and language prefix
        navigate(`/${displayLanguage}/${userSub}/education`);
      } catch (error) {
        console.error('Error handling redirect:', error);
        navigate(`/${displayLanguage}/login`);
      }
    };

    handleRedirect();
  }, [navigate, updateAuthState, refetchUserData, userSub, displayLanguage]);

  return <div className='flex items-center justify-center'>
    <LoadingCircle className='animate-spin' size='64' />
  </div>
}
