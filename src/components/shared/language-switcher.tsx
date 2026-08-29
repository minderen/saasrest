import { Globe } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ showLabel = false }: { showLabel?: boolean }) {
  const { locale, setLocale, languages } = useI18n();
  const current = languages.find((language) => language.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Globe className="size-4" aria-hidden />
          <span className="sr-only">Dil seçimi</span>
          {showLabel ? <span>{current?.native_name ?? locale.toUpperCase()}</span> : <span>{locale.toUpperCase()}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem key={language.code} onSelect={() => setLocale(language.code)}>
            <span className="mr-2">{language.flag}</span>
            {language.native_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
