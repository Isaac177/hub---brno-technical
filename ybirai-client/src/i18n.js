import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'ru',
        supportedLngs: ['en', 'kk', 'ru'],
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            allowMultiLoading: false,
            crossDomain: false,
            requestOptions: {
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'default',
            },
        },
        detection: {
            order: ['path', 'localStorage', 'navigator'],
            lookupFromPathIndex: 0,
            caches: ['localStorage'],
            cookieMinutes: 160,
            lookupLocalStorage: 'i18nextLng'
        },
        ns: ['translation'],
        defaultNS: 'translation',
        fallbackNS: false,
        //debug: true,
        react: {
            useSuspense: false,
            bindI18n: 'languageChanged loaded',
            bindI18nStore: 'added removed',
            transEmptyNodeValue: '',
            transSupportBasicHtmlNodes: true,
            transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
            skipTransRender: false
        },
        load: 'all',
        preload: ['ru', 'en', 'kk']
    });

i18n.on('loaded', function (loaded) {
    console.log('i18next loaded:', loaded);
});

i18n.on('initialized', function (options) {
    console.log('i18next initialized:', options);
});

i18n.on('failedLoading', function (lng, ns, msg) {
    console.error('i18next failed loading:', { lng, ns, msg });
});

export default i18n;