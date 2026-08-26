# Upgrade audit notes

## Expo documentation consulted

- SecureStore documentation: https://docs.expo.dev/versions/latest/sdk/securestore/
  - `expo-secure-store` is for small sensitive key-value data and is not supported on web without a fallback.
  - Android values use Android Keystore-backed encrypted storage; values are deleted on uninstall.
  - Prefer async methods; large values should not be stored in SecureStore.
  - `WHEN_UNLOCKED_THIS_DEVICE_ONLY` is appropriate for credentials that should not migrate to another device.

- FileSystem documentation: https://docs.expo.dev/versions/latest/sdk/filesystem/
  - Use the app document directory for user-created backup files and the cache directory for disposable temporary files.
  - Internal file URIs should be shared through `expo-sharing` rather than assumed to be accessible by other apps.
  - Document picker imports should use `copyToCacheDirectory: true` before reading.

## Implementation direction

The app keeps ordinary business records in AsyncStorage for now, while app/owner/cashier/edit PIN values are moved to a platform-safe credential vault. Backups omit credentials, enforce a 10 MB size limit, and validate the versioned envelope before restore. Receipt HTML user values are escaped before interpolation. Unused audio/video native packages and plugins are being removed to reduce permissions and native surface area.
