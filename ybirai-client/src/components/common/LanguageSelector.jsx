import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '@nextui-org/react';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'kk', label: 'ҚАЗ' },
    { code: 'en', label: 'ENG' },
    { code: 'ru', label: 'РУС' },
  ];

  // Effect to ensure the buttons reflect the persisted language
  useEffect(() => {
    const persistedLang = localStorage.getItem('userLanguage');
    if (persistedLang && persistedLang !== currentLanguage) {
      changeLanguage(persistedLang);
    }
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  return (
    <div className="flex gap-2 text-white">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          size="sm"
          variant={currentLanguage === lang.code ? "solid" : "light"}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1 ${
            currentLanguage === lang.code
              ? "bg-primary-500 text-white"
              : "text-white/90 hover:bg-primary-500"
          }`}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSelector;