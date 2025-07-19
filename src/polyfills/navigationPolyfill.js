// Navigation polyfill for useLocale
import * as Localization from 'expo-localization';

// Polyfill for React Navigation's useLocale hook
const useLocale = () => {
  const locale = Localization.locale || 'en-US';
  const isRTL = Localization.isRTL || false;
  
  return {
    locale,
    isRTL,
    currency: Localization.currency || null,
    region: Localization.region || null,
  };
};

// Export for React Navigation compatibility
export { useLocale };

// Make it available globally if needed
if (typeof global !== 'undefined') {
  global.useLocale = useLocale;
}