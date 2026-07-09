import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type Settings } from '@/types/settings'
import i18n from '@/i18n'

export const useSettingsStore = defineStore('settings', () => {
  const initial: Settings = { locale: 'en' }
  const settings = ref(initial)

  function save() {
    localStorage.setItem('settings', JSON.stringify(settings.value))
  }

  async function load() {
    const s = localStorage.getItem('settings')
    if (s !== null) {
      settings.value = JSON.parse(s)
    }

    await refresh()
  }

  async function setLocale() {
    try {
      const messages = await import(`@/locales/${settings.value.locale}.json`)
      i18n.global.locale.value = settings.value.locale
      i18n.global.setLocaleMessage(settings.value.locale, messages)

      document.querySelector('html')?.setAttribute('lang', settings.value.locale)
    } catch {
      console.error(`Failed to load locale ${settings.value.locale}`)
    }
  }

  async function refresh() {
    await setLocale()
    save()
  }

  async function setLanguage(locale: string) {
    settings.value.locale = locale
    await refresh()
  }

  return {
    settings,
    load,
    setLanguage,
  }
})
