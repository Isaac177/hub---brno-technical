import React, { createContext, useContext, useState, useEffect } from 'react';

const UserDataContext = createContext();

export function UserDataProvider({ children }) {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const updateUserData = (data) => {
    setUserData(data);
    if (data) {
      localStorage.setItem('userData', JSON.stringify(data));
    } else {
      localStorage.removeItem('userData');
    }
  };

  return (
    <UserDataContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
