import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from "../../services/authService.js"
import { motion } from 'framer-motion'
import GoogleIcon from './google-icon.jsx'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from "lucide-react"
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

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [givenName, setGivenName] = useState('')
    const [familyName, setFamilyName] = useState('')
    const [middleName, setMiddleName] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { displayLanguage } = useLanguage()

    const validateForm = () => {
        if (password !== confirmPassword) {
            setError(t('auth.register.errors.passwordMatch'));
            return false;
        }
        if (password.length < 8) {
            setError(t('auth.register.errors.passwordLength'));
            return false;
        }
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            setError(t('auth.register.errors.passwordRequirements'));
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const { isSignUpComplete, userId, nextStep } = await authService.register(
                email,
                password,
                givenName,
                familyName,
                middleName
            )

            if (isSignUpComplete) {
                window.alert(t('auth.register.success'))
                navigate(`/${displayLanguage}/login`)
            } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
                sessionStorage.setItem('verificationEmail', email)
                sessionStorage.setItem('given_name', givenName)
                sessionStorage.setItem('family_name', familyName)
                sessionStorage.setItem('middle_name', middleName)
                navigate(`/${displayLanguage}/verify-email`)
            }
        } catch (error) {
            let errorMessage = t('auth.register.errors.generic')
            if (error.name === 'UsernameExistsException') {
                errorMessage = t('auth.register.errors.emailExists')
            } else if (error.name === 'InvalidPasswordException') {
                errorMessage = t('auth.register.errors.invalidPassword')
            } else if (error.message) {
                errorMessage = error.message
            }
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

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
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">{t('auth.register.title')}</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder={t('auth.register.email')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={t('auth.register.firstName')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                value={givenName}
                                onChange={(e) => setGivenName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={t('auth.register.lastName')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={t('auth.register.middleName')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.register.password')}
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
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t('auth.register.confirmPassword')}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {/* <button
                            className="w-full flex gap-2 items-center justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 text-gray-900 dark:text-white"
                        >
                            <span>{t('auth.register.withGoogle')}</span>
                            <GoogleIcon />
                        </button> */}
                        <button type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                    {t('auth.register.registering')}
                                </div>
                            ) : (
                                t('auth.register.signUp')
                            )}
                        </button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{t('auth.register.haveAccount')} </span>
                        <Link to={`/${displayLanguage}/login`} className="text-blue-500 hover:underline dark:text-blue-400">{t('auth.register.signIn')}</Link>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default Register