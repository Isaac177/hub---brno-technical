import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from 'framer-motion'
import { authService } from "../../services/authService.js"
import { useAuth } from "../../contexts/AuthContext.jsx"
import { LoaderCircle, Eye, EyeOff } from "lucide-react"
import { useGetUserByEmail } from "../../hooks/useGetUserByEmail.js"
import { useTranslation } from 'react-i18next'
import { useLanguage } from "../../contexts/LanguageContext.jsx"

const pageVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    filter: 'blur(20px)',
  },
}

const pageTransition = {
  duration: 0.6,
  ease: 'easeInOut',
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(location.state?.message || '');
  const [showPassword, setShowPassword] = useState(false);
  const { displayLanguage } = useLanguage();
  const { t } = useTranslation();

  const { updateAuthState, isSignedIn, userSub } = useAuth();
  const { refetch: refetchUserData, data: userData } = useGetUserByEmail();

  const enrollmentIntent = sessionStorage.getItem('enrollmentIntent');

  useEffect(() => {
    const handleRedirect = async () => {
      if (isSignedIn && userSub) {
        if (!userData) {
          const result = await refetchUserData();
          if (!result.data || result.error) {
            navigate(`/${displayLanguage}/catalog`, { replace: true });
            return;
          }
        }

        if (userData?.role) {
          const role = userData.role.toUpperCase();
          const rolePrefix = role === 'SCHOOL_ADMIN' ? 'admin' :
            role === 'SUPER_ADMIN' ? 'super' :
              role === 'PLATFORM_ADMIN' ? 'platform_admin' :
                role === 'ADMIN' ? 'admin' : 'student';
          if (role === 'PLATFORM_ADMIN') {
            navigate(`/${displayLanguage}/${userSub}/${rolePrefix}/blog-management`, { replace: true });
          } else {
            navigate(`/${displayLanguage}/${userSub}/${rolePrefix}/education/schools`, { replace: true });
          }
        } else {
          navigate(`/${displayLanguage}/catalog`, { replace: true });
        }
      }
    };

    handleRedirect();
  }, [isSignedIn, userSub, userData, navigate, refetchUserData, displayLanguage]);

  const handleSuccessfulLogin = async (session) => {
    try {
      const userInfo = session?.tokens?.idToken?.payload;
      const userSub = session?.tokens?.idToken?.payload?.sub;
      const email = userInfo?.email;

      if (!userSub || !email) {
        console.error('Missing required user info:', { userSub, email });
        setError('Authentication error: Missing user information');
        return;
      }

      updateAuthState({
        isSignedIn: true,
        session: session,
        userInfo: userInfo,
        userSub: userSub
      });

      const result = await refetchUserData();

      if (!result.data || result.error) {
        navigate(`/${displayLanguage}/student/education/course/`, { replace: true });
        return;
      }

      const role = result.data.role.toUpperCase();
      const rolePrefix = role === 'SCHOOL_ADMIN' ? 'admin' :
        role === 'SUPER_ADMIN' ? 'super' :
          role === 'PLATFORM_ADMIN' ? 'platform_admin' :
            role === 'ADMIN' ? 'admin' : 'student';

      if (role === 'PLATFORM_ADMIN') {
        navigate(`/${displayLanguage}/${userSub}/${rolePrefix}/blog-management`, { replace: true });
      } else {
        navigate(`/${displayLanguage}/${userSub}/${rolePrefix}/education/schools`, { replace: true });
      }
    } catch (error) {
      console.error('Error in handleSuccessfulLogin:', error);
      setError(error.message || 'Error during login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authResult = await authService.login(email, password);

      if (authResult.isSignedIn) {
        await handleSuccessfulLogin(authResult.session);
      }
    } catch (error) {
      setError(error.message || t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      await authService.socialLogin(provider);
    } catch (error) {
      setError(error.message || t('auth.login.socialLoginError', { provider }));
    }
  };

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await authService.handleSocialLoginRedirect();
        if (result.isSignedIn) {
          await handleSuccessfulLogin(result.session);
        }
      } catch (error) {
        console.error('Error handling social login redirect:', error);
      }
    };

    if (location.hash || location.search) {
      handleRedirect();
    }
  }, [location]);

  return (
    <motion.div
      className="page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to">
        <div className="w-full max-w-md bg-white dark:bg-[#0d1626] rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">{t('auth.login.title')}</h2>
          {error && (
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-md mb-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-md mb-4">
              <p className="text-green-800 dark:text-green-200 text-sm">{message}</p>
            </div>
          )}
          {enrollmentIntent && (
            <p className="text-sm text-blue-500 dark:text-blue-400 mb-4 text-center">
              {t('auth.login.loginToEnroll')}
            </p>
          )}
          {/* <button
            onClick={() => handleSocialLogin('google')}
            className="w-full flex gap-2 items-center justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 text-gray-900 dark:text-white"
          >
            <span>{t('auth.login.withGoogle')}</span>
            <GoogleIcon />
          </button> */}
          {/* <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="px-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0d1626]">{t('auth.login.or')}</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div> */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder={t('auth.login.email')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.login.password')}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <Link to={`/${displayLanguage}/forgot-password`} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition duration-150"
            >
              {loading ? (
                <LoaderCircle className='animate-spin mx-auto' size='24' />
              ) : (
                <p>{t('auth.login.signIn')}</p>
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-700 dark:text-gray-300">{t('auth.login.noAccount')} </span>
            <Link to={`/${displayLanguage}/register`} className="text-blue-500 hover:underline dark:text-blue-400">{t('auth.login.signUp')}</Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;
