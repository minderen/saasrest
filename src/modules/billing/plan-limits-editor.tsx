import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import type { PlanLimitRecord } from "@/types/billing";

export const TENANT_LIMIT_KEYS = ["products", "menus", "branches", "users", "orders_per_month", "languages"] as const;
export const AGENT_LIMIT_KEYS = ["tenants", "products_per_tenant", "branches_per_tenant"] as const;

type Props = {
  limits: PlanLimitRecord[];
  suggestions: readonly string[];
  onSave: (input: { key: string; limitValue: number; unit: string | null }) => void;
  onDelete: (id: string) => void;
};

/** Plan limitleri: -1 sınırsız anlamına gelir, boş bırakılan anahtar limitsizdir. */
export function PlanLimitsEditor({ limits, suggestions, onSave, onDelete }: Props) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {limits.length === 0 && <li className="text-sm text-muted-foreground">Limit tanımlı değil.</li>}
        {limits.map((limit) => (
          <li key={limit.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1">{limit.key}</span>
            <Input
              className="h-8 w-24"
              type="number"
              min={-1}
              defaultValue={limit.limit_value ?? -1}
              onBlur={(event) => {
                const next = Number(event.target.value);
                if (next !== limit.limit_value) onSave({ key: limit.key, limitValue: next, unit: limit.unit });
              }}
            />
            <Button size="icon" variant="ghost" aria-label={`${limit.key} limitini sil`} onClick={() => onDelete(limit.id)}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end gap-2">
        <Input
          className="h-8 w-48"
          list="limit-keys"
          placeholder="limit anahtarı"
          value={key}
          onChange={(event) => setKey(event.target.value)}
        />
        <datalist id="limit-keys">
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <Input
          className="h-8 w-24"
          type="number"
          min={-1}
          placeholder="-1"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={key.trim().length < 2 || value === ""}
          onClick={() => {
            onSave({ key: key.trim(), limitValue: Number(value), unit: null });
            setKey("");
            setValue("");
          }}
        >
          Limit ekle
        </Button>
      </div>
    </div>
  );
}
