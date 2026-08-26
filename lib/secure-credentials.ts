import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { AppState } from "@/lib/types";

const PREFIX = "shopmate-offline-credential-";

function key(name: string) {
  return `${PREFIX}${name}`;
}

async function getValue(name: string): Promise<string | undefined> {
  if (Platform.OS === "web") return window.localStorage.getItem(key(name)) || undefined;
  return (await SecureStore.getItemAsync(key(name))) || undefined;
}

async function setValue(name: string, value: string | undefined) {
  if (!value) return;
  if (Platform.OS === "web") window.localStorage.setItem(key(name), value);
  else await SecureStore.setItemAsync(key(name), value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}

export async function loadCredentials(state: AppState) {
  const values: Record<string, string | undefined> = {};
  values.appPin = await getValue("app-pin");
  values.editPin = await getValue("edit-pin");
  values.ownerPin = await getValue("owner-pin");
  for (const cashier of state.cashiers) {
    values[`cashier-${cashier.id}-pin`] = await getValue(`cashier-${cashier.id}-pin`);
    values[`cashier-${cashier.id}-edit-pin`] = await getValue(`cashier-${cashier.id}-edit-pin`);
  }
  return values;
}

export async function migrateAndStoreLegacyCredentials(state: AppState) {
  await setValue("app-pin", state.settings.appPin);
  await setValue("edit-pin", state.settings.editPin);
  await setValue("owner-pin", state.settings.ownerPin);
  for (const cashier of state.cashiers) {
    await setValue(`cashier-${cashier.id}-pin`, cashier.pin);
    await setValue(`cashier-${cashier.id}-edit-pin`, cashier.editPin);
  }
}

export async function saveCredential(name: string, value: string | undefined) {
  await setValue(name, value);
}

export function applyCredentials(state: AppState, values: Record<string, string | undefined>): AppState {
  return {
    ...state,
    settings: {
      ...state.settings,
      appPin: values.appPin,
      editPin: values.editPin,
      ownerPin: values.ownerPin,
    },
    cashiers: state.cashiers.map((cashier) => ({
      ...cashier,
      pin: values[`cashier-${cashier.id}-pin`],
      editPin: values[`cashier-${cashier.id}-edit-pin`],
    })),
  };
}

export function withoutCredentials(state: AppState): AppState {
  return {
    ...state,
    settings: { ...state.settings, appPin: undefined, editPin: undefined, ownerPin: undefined },
    cashiers: state.cashiers.map((cashier) => ({ ...cashier, pin: undefined, editPin: undefined })),
  };
}
