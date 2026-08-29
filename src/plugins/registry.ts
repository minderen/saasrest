import type { ComponentType } from "react";

/**
 * Plugin core — kept fully separate from themes and app code.
 * A tenant enables a plugin in the database (`plugins` / tenant plugin rows);
 * the key is resolved here. Adding a plugin = one entry, no core changes.
 */
export type PluginSlot = "menu-footer" | "site-footer" | "panel-widget";

export type PluginDefinition = {
  key: string;
  name: string;
  slot: PluginSlot;
  /** Optional UI. Data-only plugins may omit this. */
  component?: ComponentType<{ tenantId: string; config: Record<string, unknown> }>;
};

const registry = new Map<string, PluginDefinition>();

export function registerPlugin(definition: PluginDefinition) {
  registry.set(definition.key, definition);
  return definition;
}

export function getPlugin(key: string) {
  return registry.get(key) ?? null;
}

export function pluginsForSlot(slot: PluginSlot, enabledKeys: string[]) {
  return enabledKeys
    .map((key) => registry.get(key))
    .filter((plugin): plugin is PluginDefinition => Boolean(plugin) && plugin!.slot === slot);
}

export function listPlugins() {
  return [...registry.values()];
}
