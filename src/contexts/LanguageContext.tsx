'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as OpenCC from 'opencc-js';

type Language = 'zh-CN' | 'zh-TW';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'zh-TW',
  setLanguage: () => {},
  t: (text) => text,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh-TW');
  const [converter, setConverter] = useState<((text: string) => string) | null>(null);

  // 初始化：从 localStorage 读取语言偏好
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'zh-CN' || savedLanguage === 'zh-TW')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // 当语言改变时，更新转换器
  useEffect(() => {
    if (language === 'zh-TW') {
      const conv = OpenCC.Converter({ from: 'cn', to: 'tw' });
      setConverter(() => conv);
    } else {
      setConverter(null);
    }

    // 保存到 localStorage
    localStorage.setItem('language', language);
  }, [language]);

  // 翻译函数
  const t = (text: string): string => {
    if (language === 'zh-TW' && converter) {
      return converter(text);
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
