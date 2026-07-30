import { createI18n } from 'vue-i18n'

export default createI18n({
    locale: 'en',
    legacy: false,
    datetimeFormats: {
        'en': {
            long: {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: '2-digit'
            }
        },
        'ru': {
            long: {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: '2-digit'
            }
        },
    },
})
