import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [userSub, setUserSub] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const authState = await authService.checkAuth()
        //console.log('Auth state received:', JSON.stringify(authState, null, 2));
        
        // Get stored userSub
        const storedUserSub = localStorage.getItem('userSub');
        
        if (authState.isSignedIn && authState.session) {
          console.log('User is signed in, setting state...');
          setIsSignedIn(true)
          setSession(authState.session)
          setUser(authState.session.tokens.idToken.payload)
          
          // Store user email in localStorage
          const userEmail = authState.session.tokens.idToken.payload.email;
          if (userEmail) {
            localStorage.setItem('userEmail', userEmail);
          }
          
          // Use session userSub or stored userSub
          const currentUserSub = authState.session.tokens.idToken.payload.sub || storedUserSub;
          if (currentUserSub) {
            setUserSub(currentUserSub)
            localStorage.setItem('userSub', currentUserSub)
          }
          
          // console.log('Auth state set:', {
          //   isSignedIn: true,
          //   user: authState.session.tokens.idToken.payload,
          //   email: authState.session.tokens.idToken.payload.email,
          //   userSub: currentUserSub
          // });
        } else if (storedUserSub) {
          // Try to restore session from stored userSub
          try {
            const restoredSession = await authService.restoreSession(storedUserSub);
            if (restoredSession) {
              setIsSignedIn(true);
              setSession(restoredSession);
              setUser(restoredSession.tokens.idToken.payload);
              setUserSub(storedUserSub);
              return;
            }
          } catch (error) {
            console.error('Failed to restore session:', error);
          }
          // If restoration fails, clear everything
          console.log('User is not signed in, clearing state...');
          setIsSignedIn(false)
          setSession(null)
          setUser(null)
          setUserSub(null)
          localStorage.removeItem('userSub')
        } else {
          console.log('User is not signed in, clearing state...');
          setIsSignedIn(false)
          setSession(null)
          setUser(null)
          setUserSub(null)
          localStorage.removeItem('userSub')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setIsSignedIn(false)
        setSession(null)
        setUser(null)
        setUserSub(null)
        localStorage.removeItem('userSub')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    const checkSessionValidity = async () => {
      if (isSignedIn && session) {
        try {
          const authState = await authService.checkAuth()
          if (!authState.isSignedIn) {
            clearAuthState()
          }
        } catch (error) {
          console.error('Error checking session validity:', error)
          clearAuthState()
        }
      }
    }

    const interval = setInterval(checkSessionValidity, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isSignedIn, session])

  const updateAuthState = ({ isSignedIn: newIsSignedIn, session: newSession, userInfo: newUserInfo, userSub: newUserSub }) => {
    console.log('Updating auth state:', { newIsSignedIn, newUserSub, newUserInfo });
    
    if (newIsSignedIn && newUserSub) {
      localStorage.setItem('userSub', newUserSub);
    }
    
    setIsSignedIn(newIsSignedIn);
    setSession(newSession);
    setUser(newUserInfo);
    setUserSub(newUserSub);
  }

  const clearAuthState = () => {
    console.log('Clearing auth state')
    setIsSignedIn(false)
    setSession(null)
    setUser(null)
    setUserSub(null)
    localStorage.removeItem('userSub')
    localStorage.removeItem('userEmail')
  }

  // useEffect(() => {
  //   console.log('Auth state updated:', { isSignedIn, session, user, userSub })
  // }, [isSignedIn, session, user, userSub])

  const value = {
    isSignedIn,
    session,
    user,
    userSub,
    isLoading,
    updateAuthState,
    clearAuthState
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
