export type LocaleCode = string;

export type LanguageOption = {
  code: LocaleCode;
  native_name: string;
  flag: string | null;
};

export type Dictionary = Record<string, string>;
