import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { languagesRepository, translationsRepository } from "@/repositories/i18n";

type Dictionary = Record<string, string>;

type I18nValue = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string) => string;
  languages: Array<{ code: string; native_name: string; flag: string | null }>;
  isReady: boolean;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  children,
  defaultLocale = "tr",
}: {
  children: ReactNode;
  defaultLocale?: string;
}) {
  const [locale, setLocale] = useState(defaultLocale);

  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: languagesRepository.listActive,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dictionary, isFetched } = useQuery({
    queryKey: ["translations", locale],
    queryFn: () => translationsRepository.byLocale(locale),
    staleTime: 5 * 60 * 1000,
  });

  const t = useCallback(
    (key: string, fallback?: string) => (dictionary as Dictionary | undefined)?.[key] ?? fallback ?? key,
    [dictionary],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t, languages, isReady: isFetched }),
    [locale, t, languages, isFetched],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
