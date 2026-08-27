const fs = require("node:fs");
const path = "app/(tabs)/index.tsx";
let source = fs.readFileSync(path, "utf8");
const start = source.indexOf("  async function backup() {");
const end = source.indexOf("  async function compressReceiptImage", start);
if (start < 0 || end < 0) throw new Error("backup function boundaries not found");
const replacement = [
  "  async function backup() {",
  "    if (backupPassword.trim().length < 8) return Alert.alert(\"Password required\", \"Use at least 8 characters to protect this backup.\");",
  "    const payload = { version: 1, exportedAt: new Date().toISOString(), state: withoutCredentials(state) };",
  "    const encrypted = encryptBackupPayload(payload, backupPassword);",
  "    if (!isValidBackupSize(encrypted)) return Alert.alert(\"Backup too large\", \"Reduce stored images or history before exporting this backup.\");",
  "    try { await exportFile(\"shopmate-offline-backup.encrypted.json\", encrypted, \"application/json\"); Alert.alert(\"Encrypted backup saved\", \"Keep the password safe; it cannot be recovered from this device.\"); } catch { Alert.alert(\"Backup failed\", \"The local encrypted backup could not be written.\"); }",
  "  }",
  "  async function confirmRestore() {",
  "    if (Platform.OS === \"web\") return window.confirm(\"A protected copy of current data will be saved locally before restore. Continue?\");",
  "    return new Promise<boolean>(resolve => Alert.alert(\"Protect current data\", \"A pre-restore copy will be saved on this device before replacing current records. Continue?\", [{ text: \"Cancel\", style: \"cancel\", onPress: () => resolve(false) }, { text: \"Continue\", onPress: () => resolve(true) }]));",
  "  }",
  "  async function restore() {",
  "    if (!(await confirmRestore())) return;",
  "    const result = await DocumentPicker.getDocumentAsync({ type: \"application/json\", copyToCacheDirectory: true });",
  "    if (result.canceled) return;",
  "    try {",
  "      await AsyncStorage.setItem(KEY + \"-pre-restore\", JSON.stringify(withoutCredentials(state)));",
  "      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);",
  "      if (!isValidBackupSize(raw)) throw new Error(\"Backup too large\");",
  "      const parsed: unknown = isEncryptedBackup(raw) ? decryptBackupPayload<unknown>(raw, restorePassword) : JSON.parse(raw);",
  "      if (!validateBackupEnvelope(parsed)) throw new Error(\"Invalid backup\");",
  "      const backupState = parsed.state as Partial<AppState>;",
  "      const restored = { ...initialState, ...backupState, settings: { ...initialState.settings, ...(backupState.settings || {}) }, products: backupState.products || [], sales: backupState.sales || [], receipts: (backupState.receipts || []).map((receipt: any) => normalizeReceipt(receipt, backupState.settings?.currency || \"KSH\")), feedback: backupState.feedback || [] };",
  "      await AsyncStorage.setItem(KEY, JSON.stringify(withoutCredentials(restored)));",
  "      setState(applyCredentials(restored, await loadCredentials(restored)));",
  "      setRestorePassword(\"\");",
  "      Alert.alert(\"Restore complete\", \"All local records were restored. A pre-restore copy is available on this device.\");",
  "    } catch { Alert.alert(\"Restore failed\", \"That file is invalid, corrupted, or requires a different backup password.\"); }",
  "  }",
].join("\n");
source = source.slice(0, start) + replacement + "\n" + source.slice(end);
fs.writeFileSync(path, source);
console.log("patched backup security");
