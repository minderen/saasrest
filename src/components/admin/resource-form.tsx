import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AdminField, AdminFieldOption } from "@/types/admin";

function defaultText(field: AdminField, row?: Record<string, unknown> | null) {
  const value = row?.[field.name];
  if (value === null || value === undefined) return "";
  if (field.type === "json") return JSON.stringify(value, null, 2);
  if (field.type === "date" && typeof value === "string") return value.slice(0, 10);
  return String(value);
}

/** Renders one declarative field. Kept dumb so resources stay data-driven. */
export function ResourceField({
  field,
  row,
  options,
}: {
  field: AdminField;
  row?: Record<string, unknown> | null;
  options: AdminFieldOption[];
}) {
  const id = `field-${field.name}`;
  const value = defaultText(field, row);

  return (
    <div className={`grid gap-2 ${field.full ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={id}>
        {field.label}
        {field.required ? <span className="text-primary"> *</span> : null}
      </Label>

      {field.type === "boolean" ? (
        <Switch id={id} name={field.name} defaultChecked={Boolean(row?.[field.name])} />
      ) : field.type === "select" ? (
        <select
          id={id}
          name={field.name}
          defaultValue={value}
          required={field.required}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">Seçin</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" || field.type === "json" ? (
        <Textarea
          id={id}
          name={field.name}
          defaultValue={value}
          rows={field.type === "json" ? 5 : 4}
          {...(field.placeholder ? { placeholder: field.placeholder } : {})}
        />
      ) : (
        <Input
          id={id}
          name={field.name}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          step={field.type === "number" ? "any" : undefined}
          defaultValue={value}
          {...(field.placeholder ? { placeholder: field.placeholder } : {})}
        />
      )}

      {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
    </div>
  );
}

export function ResourceFields({
  fields,
  row,
  optionMap,
}: {
  fields: AdminField[];
  row?: Record<string, unknown> | null;
  optionMap: Record<string, AdminFieldOption[]>;
}) {
  return (
    <>
      {fields.map((field) => (
        <ResourceField
          key={field.name}
          field={field}
          row={row}
          options={field.optionsFrom ? (optionMap[field.optionsFrom] ?? []) : (field.options ?? [])}
        />
      ))}
    </>
  );
}
