import { Language } from "../types/Language";

const languages: Language[] = [
  {
    name: 'Abkhazian',
    iso639_1: 'ab',
    iso639_2B: 'abk'
  },
  {
    name: 'English',
    iso639_1: 'en',
    iso639_2B: 'eng'
  },
  {
    name: 'Spanish',
    iso639_1: 'es',
    iso639_2B: 'spa'
  },
  {
    name: 'French',
    iso639_1: 'fr',
    iso639_2B: 'fre'
  },
  {
    name: 'German',
    iso639_1: 'de',
    iso639_2B: 'deu'
  },
  {
    name: 'Italian',
    iso639_1: 'it',
    iso639_2B: 'ita'
  },
  {
    name: 'Portuguese',
    iso639_1: 'pt',
    iso639_2B: 'por'
  },
  {
    name: 'Russian',
    iso639_1: 'ru',
    iso639_2B: 'rus'
  },
  {
    name: 'Japanese',
    iso639_1: 'ja',
    iso639_2B: 'jpn'
  },
  {
    name: 'Chinese',
    iso639_1: 'zh',
    iso639_2B: 'zho'
  },
  {
    name: 'Arabic',
    iso639_1: 'ar',
    iso639_2B: 'ara'
  },
  {
    name: 'Swedish',
    iso639_1: 'sv',
    iso639_2B: 'swe'
  }
];

const getLanguageNameFromIso639_1 = (iso639_1: string): string | undefined => {
  return languages.find(language => language.iso639_1 === iso639_1)?.name;
}

const getLanguageNameFromIso639_2B = (iso639_2B: string): string | undefined => {
  return languages.find(language => language.iso639_2B === iso639_2B)?.name;
}

export const getLanguageNameFromCode = (str: string): string => {
  return getLanguageNameFromIso639_1(str) || getLanguageNameFromIso639_2B(str) || 'Unknown';
}

export const getLanguageNameFromString = (str: string): string => {
  return languages.find(
    language => str.includes(language.name) ||
      str.includes(language.iso639_1) ||
      str.includes(language.iso639_2B)
  )?.name || 'Unknown';
}
