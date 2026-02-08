'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh-CN' ? 'zh-TW' : 'zh-CN');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      title={t('切换语言')}
    >
      <Globe size={18} className="text-gray-600" />
      <span className="text-sm text-gray-700">
        {language === 'zh-CN' ? '简体' : '繁體'}
      </span>
    </button>
  );
}
