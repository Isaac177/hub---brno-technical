import {
    signUp,
    confirmSignUp,
    signIn,
    fetchAuthSession,
    signInWithRedirect,
    signOut,
    getCurrentUser,
    resendSignUpCode,
    resetPassword,
    confirmResetPassword
} from 'aws-amplify/auth';

const API_URL = 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export const authService = {
    async register(email, password, givenName, familyName, middleName) {
        try {
            const { isSignUpComplete, userId, nextStep } = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                        given_name: givenName,
                        family_name: familyName,
                        middle_name: middleName,
                        name: `${givenName} ${middleName} ${familyName}`.trim()
                    },
                },
            });
            return { isSignUpComplete, userId, nextStep };
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    },

    async confirmSignUp(email, code) {
        try {
            const { isSignUpComplete } = await confirmSignUp({
                username: email,
                confirmationCode: code
            });

            if (isSignUpComplete) {
                try {
                    const response = await fetch(`${API_URL}/api/cognito-webhook/post-confirmation`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            triggerSource: "PostConfirmation_ConfirmSignUp",
                            request: {
                                userAttributes: {
                                    email,
                                    sub: crypto.randomUUID(),
                                    given_name: sessionStorage.getItem('given_name'),
                                    family_name: sessionStorage.getItem('family_name'),
                                    middle_name: sessionStorage.getItem('middle_name'),
                                },
                                timestamp: new Date().toISOString()
                            }
                        })
                    });

                    if (!response.ok) {
                        console.error('Failed to sync user with server:', await response.text());
                    }
                } catch (error) {
                    console.error('Error syncing user with server:', error);
                }
            }

            return { isSignUpComplete };
        } catch (error) {
            console.error('Error confirming sign up:', error);
            throw error;
        }
    },

    async resendConfirmationCode(email) {
        try {
            await resendSignUpCode({
                username: email
            });
        } catch (error) {
            console.error('Error resending confirmation code:', error);
            throw error;
        }
    },

    async forgotPassword(email) {
        try {
            await resetPassword({
                username: email
            });
            return true;
        } catch (error) {
            console.error('Error initiating password reset:', error);
            throw error;
        }
    },

    async confirmForgotPassword(email, code, newPassword) {
        try {
            await confirmResetPassword({
                username: email,
                confirmationCode: code,
                newPassword
            });
            return true;
        } catch (error) {
            console.error('Error confirming password reset:', error);
            throw error;
        }
    },

    async login(email, password) {
        try {
            await this.signOut();

            const { isSignedIn, nextStep } = await signIn({ username: email, password });
            if (isSignedIn) {
                const session = await fetchAuthSession();
                const token = session.tokens.accessToken.toString();
                localStorage.setItem('authToken', token);
                localStorage.setItem('authSession', JSON.stringify(session));
                return { isSignedIn, session };
            }
            return { isSignedIn, nextStep };
        } catch (error) {
            if (error.message === 'There is already a signed in user.') {
                await this.signOut();
                return this.login(email, password);
            }
            console.error('Error signing in:', error);
            throw error;
        }
    },

    async signOut() {
        try {
            await signOut({ global: true });
            localStorage.removeItem('authToken');
            localStorage.removeItem('authSession');
            localStorage.removeItem('userUniqueId');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    },

    async checkAuth() {
        try {
            const currentUser = await getCurrentUser();
            let session;

            try {
                session = await fetchAuthSession();
            } catch (sessionError) {
                console.log('Could not fetch fresh session, trying stored session');
                const storedSession = localStorage.getItem('authSession');
                if (storedSession) {
                    session = JSON.parse(storedSession);
                } else {
                    throw new Error('No session available');
                }
            }

            if (!session) {
                throw new Error('No session available');
            }

            localStorage.setItem('authSession', JSON.stringify(session));
            return { isSignedIn: true, session };
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authSession');
            return { isSignedIn: false };
        }
    },

    async socialLogin(provider) {
        try {
            await this.signOut();
            await signInWithRedirect({ provider: provider });
        } catch (error) {
            console.error('Error with social sign-in:', error);
            throw error;
        }
    },

    async handleSocialLoginRedirect() {
        try {
            const session = await fetchAuthSession();
            const token = session.tokens.accessToken.toString();
            localStorage.setItem('authToken', token);
            return { isSignedIn: true, session };
        } catch (error) {
            console.error('Error handling social sign-in redirect:', error);
            throw error;
        }
    },

    getToken() {
        return localStorage.getItem('authToken');
    },

    removeToken() {
        localStorage.removeItem('authToken');
    }
};
