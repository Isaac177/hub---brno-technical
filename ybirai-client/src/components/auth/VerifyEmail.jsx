import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from "../../services/authService.js";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
};

const pageTransition = {
    duration: 0.6,
    ease: 'easeInOut',
};

const VerifyEmail = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('verificationEmail');
        if (!storedEmail) {
            navigate('/register');
            return;
        }
        setEmail(storedEmail);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { isSignUpComplete } = await authService.confirmSignUp(email, verificationCode);
            if (isSignUpComplete) {
                sessionStorage.removeItem('verificationEmail');
                navigate('/login');
            }
        } catch (error) {
            let errorMessage = t('auth.verifyEmail.errors.verificationFailed');
            if (error.name === 'CodeMismatchException') {
                errorMessage = t('auth.verifyEmail.errors.invalidCode');
            } else if (error.name === 'ExpiredCodeException') {
                errorMessage = t('auth.verifyEmail.errors.expiredCode');
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        setIsLoading(true);
        try {
            await authService.resendConfirmationCode(email);
            alert(t('auth.verifyEmail.codeSent'));
        } catch (error) {
            setError(error.message || t('auth.verifyEmail.errors.resendFailed'));
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">{t('auth.verifyEmail.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        {t('auth.verifyEmail.sentTo')}<br />
                        <span className="font-medium text-gray-900 dark:text-white">{email}</span>
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={t('auth.verifyEmail.enterCode')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                    {t('auth.verifyEmail.verifying')}
                                </div>
                            ) : (
                                t('auth.verifyEmail.verify')
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendCode}
                            className="w-full text-blue-500 hover:text-blue-600 text-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {t('auth.verifyEmail.resendCode')}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default VerifyEmail;
