import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import type { PlanFeatureRecord } from "@/types/billing";

export const TENANT_FEATURE_KEYS = ["orders", "custom_themes", "plugins", "multi_language", "campaigns"] as const;
export const AGENT_FEATURE_KEYS = ["white_label", "custom_themes", "plugins", "reseller_billing"] as const;

type Props = {
  features: PlanFeatureRecord[];
  suggestions: readonly string[];
  onSave: (input: { key: string; label: string; isIncluded: boolean }) => void;
  onDelete: (id: string) => void;
};

/** Feature flag'ler: is_included=false olan özellik plan kapsamında kapalıdır. */
export function PlanFeaturesEditor({ features, suggestions, onSave, onDelete }: Props) {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {features.length === 0 && <li className="text-sm text-muted-foreground">Özellik tanımlı değil.</li>}
        {features.map((feature) => (
          <li key={feature.id} className="flex items-center gap-2 text-sm">
            <Switch
              checked={feature.is_included}
              aria-label={`${feature.key} özelliği`}
              onCheckedChange={(value) => onSave({ key: feature.key, label: feature.label, isIncluded: value })}
            />
            <span className="flex-1">
              {feature.label} <span className="text-muted-foreground">({feature.key})</span>
            </span>
            <Button size="icon" variant="ghost" aria-label={`${feature.key} özelliğini sil`} onClick={() => onDelete(feature.id)}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end gap-2">
        <Input
          className="h-8 w-44"
          list="feature-keys"
          placeholder="özellik anahtarı"
          value={key}
          onChange={(event) => setKey(event.target.value)}
        />
        <datalist id="feature-keys">
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <Input
          className="h-8 w-52"
          placeholder="görünen ad"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={key.trim().length < 2}
          onClick={() => {
            onSave({ key: key.trim(), label: label.trim() || key.trim(), isIncluded: true });
            setKey("");
            setLabel("");
          }}
        >
          Özellik ekle
        </Button>
      </div>
    </div>
  );
}
