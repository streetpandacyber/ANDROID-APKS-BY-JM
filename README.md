# ShopMate Offline

ShopMate Offline is a standalone Android business-management app for small shops and cashiers. It brings together **POS**, **Notebook**, **Calculator**, and **Receipt Book** tools in a single-device, local-first application.

> **Offline-first promise:** ShopMate Offline stores business records on the device and does not require a cloud account, API connection, or internet access for daily operation.

## Product overview

| Module | Purpose |
| --- | --- |
| **POS** | Cashier shifts, products, cart checkout, stock, sales, reports, refunds, voids, audit history, and local receipt output. |
| **NOTEBOOK** | Independent POS Notes and My Notebook workspaces with search, folders, tags, page styles, formatting, pinning, archive, and trash. |
| **CALCULATOR** | Standard and scientific calculations with local history, memory keys, validation hints, auto-balancing parentheses, keyboard input, and clipboard copy. |
| **RECEIPT BOOK** | Independent manual and image-based receipts with line items, customer details, thumbnails, editable previews, local PDF/print output, and filters. |

The app uses KSH currency formatting and East Africa Time (EAT, UTC+3) for business timestamps. Developer credit is **JM Majiwa**. Support is available through **streetpandacyber@gmail.com** and **+254 745 198 099**.

## Offline and privacy behavior

All structured records are persisted locally with AsyncStorage-compatible device storage. Receipt and logo images remain device-local URI references. Backup and restore use a local JSON file, and report, receipt, print, PDF, and share actions are initiated on-device.

The Android configuration explicitly blocks `android.permission.INTERNET` and `android.permission.ACCESS_NETWORK_STATE`. Camera and gallery features request only the permissions required by the operating system when the user chooses those actions. No login, cloud sync, remote database, analytics service, or external API is required for normal use.

Because data is local to one device, users should export a backup regularly and keep the backup file in a safe location. Restoring a backup replaces the current local records with the records contained in the selected file.

## Requirements

For local development, install Node.js 22 or a compatible current LTS release, pnpm 9, Git, and the Expo command-line tooling. Android development additionally requires Android Studio, an Android SDK with API 35 or newer, platform tools, and either an emulator or a USB-debuggable Android device.

The project is configured for Expo SDK 54, React Native 0.81, React 19, and TypeScript. The Android application identifier is `com.app.shopmateoffline`.

## Local development

Clone the repository and install dependencies:

```bash
git clone https://github.com/streetpandacyber/ANDROID-APKS-BY-JM.git
cd ANDROID-APKS-BY-JM
pnpm install
```

Run the deterministic checks before making changes:

```bash
pnpm check
pnpm test
pnpm lint
```

Start the development environment:

```bash
pnpm dev
```

For an Android device or emulator with the local Android toolchain configured:

```bash
pnpm android
```

The web preview is useful for layout inspection, but native behavior such as camera access, clipboard behavior, local file sharing, and Android permissions should be checked on a physical Android device or emulator.

## Building an installable APK

The repository includes a GitHub Actions workflow that runs checks for every push and pull request. Pushing a version tag such as `v1.0.0` also starts the Android build job. The tag workflow creates a debug-signed, installable APK for the initial GitHub release and attaches it to the release page.

To create the first automated release after the workflow has been pushed:

```bash
git tag -a v1.0.0 -m "ShopMate Offline 1.0.0"
git push origin v1.0.0
```

The workflow output is available under the repository’s **Actions** tab. The generated APK is also uploaded as an Actions artifact. The release artifact is intended for device installation and testing; a production Play Store release should use a protected signing keystore and a separate signed-release workflow.

For the managed Manus project, the recommended APK path is to create a project checkpoint and use the **Publish** action in the project interface. Do not run a resource-heavy Android build in the sandbox when the managed publishing flow is available.

## Installing the APK on a device

After downloading the APK from the GitHub release, allow installation from the download source when Android prompts for that permission, then open the APK. Alternatively, with Android platform tools installed:

```bash
adb install -r shopmate-offline-debug.apk
```

On first launch, create a local app PIN. The PIN, business records, calculator history, notes, receipts, and settings remain on that device unless the user exports and moves a backup manually.

## Backup and restore

Open Settings from the app and use **Export all data** to create a versioned local JSON backup. Use **Import / restore** to select a previously exported backup. The backup includes settings, cashier records, shifts, products, stock movements, sales, audit history, notes, receipts, receipt thumbnails, and calculator history.

Backups are not uploaded automatically. Keep at least one copy outside the device before resetting or uninstalling the app.

## Release and workflow maintenance

The workflow is intentionally split into test and Android-build jobs. The test job runs TypeScript checking, nine deterministic domain tests, and lint. The Android job installs dependencies, generates the native Android project through Expo prebuild, builds the debug APK, uploads the APK artifact, and on version tags publishes the APK to the corresponding GitHub release.

For a signed production build, add repository or environment secrets for the Android keystore and change the workflow to use a protected signing configuration. Never commit keystores, passwords, API keys, `.env` files, or personal credentials to this repository.

## Support and attribution

ShopMate Offline is developed by **JM Majiwa**. For support, copy **streetpandacyber@gmail.com** or **+254 745 198 099** from the in-app About section.

## License

No license has been declared yet. Until a license is added, all rights remain with the repository owner.
