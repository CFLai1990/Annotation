/*
 *
 * LanguageProvider actions
 *
 */

import { CHANGE_LOCALE } from './constants'
import { DEFAULT_LOCALE } from './constants'

function changeLocale (languageLocale = DEFAULT_LOCALE) {
  return {
    type: CHANGE_LOCALE,
    locale: languageLocale
  }
}

export default {
  changeLocale
}
