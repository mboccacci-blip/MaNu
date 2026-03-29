import { createContext, useContext, useState, useCallback } from 'react';
import en from './en.js';
import es from './es.js';

const I18nContext = createContext();

const dictionaries = { en, es };

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('es');

  const t = useCallback(function(key, params) {
    var keys = key.split('.');
    var val = dictionaries[lang];
    for (var i = 0; i < keys.length; i++) {
      val = val && val[keys[i]];
    }
    if (val === undefined) {
      // Fallback to English
      val = dictionaries.en;
      for (var j = 0; j < keys.length; j++) {
        val = val && val[keys[j]];
      }
    }
    if (val === undefined) return key; // Last resort: show key
    // Simple template interpolation: {name} → params.name
    if (params && typeof val === 'string') {
      Object.keys(params).forEach(function(k) {
        val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return val;
  }, [lang]);

  const toggleLang = useCallback(function() {
    setLang(function(l) { return l === 'en' ? 'es' : 'en'; });
  }, []);

  return (
    <I18nContext.Provider value={{ t: t, lang: lang, setLang: setLang, toggleLang: toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
