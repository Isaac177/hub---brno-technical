import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize with the correct language code
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // First check URL as it should have priority
    const pathLang = location.pathname.split('/')[1];
    if (['en', 'kz', 'ru'].includes(pathLang)) {
      const lang = pathLang === 'kz' ? 'kk' : pathLang;
      localStorage.setItem('userLanguage', lang);
      localStorage.setItem('i18nextLng', lang);
      return lang;
    }

    // Then check localStorage
    const persistedLanguage = localStorage.getItem('userLanguage');
    if (persistedLanguage) {
      return persistedLanguage === 'kz' ? 'kk' : persistedLanguage;
    }

    // Default to Russian only if no language is set
    const defaultLang = 'ru';
    localStorage.setItem('userLanguage', defaultLang);
    localStorage.setItem('i18nextLng', defaultLang);
    return defaultLang;
  });

  const changeLanguage = (language) => {
    // Convert between URL and i18n language codes (kz -> kk)
    const actualLang = language === 'kz' ? 'kk' : language;
    const displayLang = actualLang === 'kk' ? 'kz' : actualLang;

    // Persist language choice in localStorage (store internal code)
    localStorage.setItem('userLanguage', actualLang);
    localStorage.setItem('i18nextLng', actualLang);
    
    // Update i18n instance and state
    i18n.changeLanguage(actualLang);
    setCurrentLanguage(actualLang);

    // Update URL with the display language
    const pathParts = location.pathname.split('/');
    if (['en', 'kz', 'ru'].includes(pathParts[1])) {
      pathParts[1] = displayLang;
    } else {
      pathParts.splice(1, 0, displayLang);
    }
    const newPath = pathParts.join('/');
    navigate(newPath, { replace: true });
  };

  // Effect to sync URL language with stored language
  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage');
    if (!storedLang) return; // Don't do anything if no language is stored

    const pathLang = location.pathname.split('/')[1];
    const displayLang = storedLang === 'kk' ? 'kz' : storedLang;
    
    // Only update if there's a mismatch or no language in URL
    if (!['en', 'kz', 'ru'].includes(pathLang)) {
      navigate(`/${displayLang}${location.pathname}`, { replace: true });
    } else if (pathLang !== displayLang) {
      const newPath = location.pathname.replace(`/${pathLang}`, `/${displayLang}`);
      navigate(newPath, { replace: true });
    }
  }, [location.pathname]);

  // Effect to sync i18n with current language
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  const value = {
    currentLanguage,
    changeLanguage,
    displayLanguage: currentLanguage === 'kk' ? 'kz' : currentLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};