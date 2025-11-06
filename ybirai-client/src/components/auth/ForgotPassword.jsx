import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from "../../services/authService.js"
import { LoaderCircle } from "lucide-react"
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

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [codeSent, setCodeSent] = useState(false)
    const { displayLanguage } = useLanguage()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const validatePassword = () => {
        if (newPassword !== confirmPassword) {
            setError(t('auth.forgotPassword.errors.passwordMatch'));
            return false;
        }
        if (newPassword.length < 8) {
            setError(t('auth.forgotPassword.errors.passwordLength'));
            return false;
        }
        // Check for uppercase, lowercase, number and special character
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            setError(t('auth.forgotPassword.errors.passwordRequirements'));
            return false;
        }

        return true;
    }

    const handleSendCode = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await authService.forgotPassword(email)
            setCodeSent(true)
            setError(t('auth.forgotPassword.codeSent'))
        } catch (err) {
            setError(err.message || t('auth.forgotPassword.errors.sendCode'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')

        if (!validatePassword()) {
            return;
        }

        setIsLoading(true)

        try {
            await authService.confirmForgotPassword(email, code, newPassword)
            console.log('Password reset successful, navigating to:', `/${displayLanguage}/login`)
            navigate(`/${displayLanguage}/login`, {
                state: { message: t('auth.forgotPassword.resetSuccess') }
            })
        } catch (err) {
            setError(err.message || t('auth.forgotPassword.errors.resetPassword'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
        >
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-white">
                        {t('auth.forgotPassword.title')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                        {t('auth.forgotPassword.or')}{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            {t('auth.forgotPassword.returnToLogin')}
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className={`rounded-md p-4 ${error === t('auth.forgotPassword.codeSent') ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
                        <p className={`text-sm ${error === t('auth.forgotPassword.codeSent') ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                            {error}
                        </p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={codeSent ? handleResetPassword : handleSendCode}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                {t('auth.forgotPassword.email')}
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-neutral-800"
                                placeholder={t('auth.forgotPassword.email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={codeSent}
                            />
                        </div>

                        {codeSent && (
                            <>
                                <div>
                                    <label htmlFor="verification-code" className="sr-only">
                                        {t('auth.forgotPassword.verificationCode')}
                                    </label>
                                    <input
                                        id="verification-code"
                                        name="code"
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-neutral-800"
                                        placeholder={t('auth.forgotPassword.verificationCode')}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="new-password" className="sr-only">
                                        {t('auth.forgotPassword.newPassword')}
                                    </label>
                                    <input
                                        id="new-password"
                                        name="newPassword"
                                        type="password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-neutral-800"
                                        placeholder={t('auth.forgotPassword.newPassword')}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="sr-only">
                                        {t('auth.forgotPassword.confirmPassword')}
                                    </label>
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-neutral-800"
                                        placeholder={t('auth.forgotPassword.confirmPassword')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <LoaderCircle className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                            ) : null}
                            {codeSent ? t('auth.forgotPassword.resetPassword') : t('auth.forgotPassword.sendCode')}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}

export default ForgotPassword
