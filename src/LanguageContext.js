import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children, userEmail }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (userEmail) {
      const profile = JSON.parse(localStorage.getItem(`profile_${userEmail}`) || '{}');
      if (profile?.language) {
        setLang(profile.language);
      }
    }
  }, [userEmail]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  const changeLang = (newLang) => {
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}