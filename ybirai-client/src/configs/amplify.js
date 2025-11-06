import { Amplify } from 'aws-amplify';

const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        phone: false,
        username: false
      },
      oauth: {
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
        scope: ['email', 'profile', 'openid'],
        responseType: 'code',
        redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN,
        redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT,
      }
    }
  }
};

Amplify.configure(awsconfig);
