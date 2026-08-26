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

The repository includes a GitHub Actions workflow that runs checks for every push and pull request. Normal pushes build a debug APK for validation. Pushing a version tag such as `v1.1.0` starts the protected Android release job, which signs the APK with a keystore supplied through GitHub Actions Secrets and attaches the signed artifact to the release page.

To create the first automated release after the workflow has been pushed:

```bash
git tag -a v1.0.0 -m "ShopMate Offline 1.0.0"
git push origin v1.0.0
```

The workflow output is available under the repository’s **Actions** tab. The generated APK is also uploaded as an Actions artifact. The tagged release artifact is signed with the protected production keystore configured below. Keep the keystore and passwords outside Git; the workflow fails clearly when a tagged release is missing a required secret.

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

For signed production builds, add these protected GitHub Actions Secrets before pushing a version tag:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded production `.keystore` file. |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password. |
| `ANDROID_KEY_ALIAS` | Signing-key alias. |
| `ANDROID_KEY_PASSWORD` | Signing-key password. |

Never commit keystores, passwords, API keys, `.env` files, or personal credentials to this repository. The workflow creates the keystore temporarily on the hosted runner, configures the generated Gradle project, builds `assembleRelease`, and then uploads only the APK artifact.

## Support and attribution

ShopMate Offline is developed by **JM Majiwa**. For support, copy **streetpandacyber@gmail.com** or **+254 745 198 099** from the in-app About section.

## License and contributions

This repository is licensed under the [MIT License](LICENSE). Contribution standards, testing expectations, offline constraints, secret handling, and release conventions are documented in [CONTRIBUTING.md](CONTRIBUTING.md).

## Automatic Expo/EAS builds from GitHub Actions

The Android workflow runs the project checks first, then submits an EAS Android APK build for non-pull-request pushes. Pushes to `main` use the `preview` profile and version tags such as `v1.0.1` use the `production` profile. Both profiles produce APK output; signing is handled by EAS managed credentials.

To enable automatic submissions, add an Actions secret named `EXPO_TOKEN` in the GitHub repository at **Settings → Secrets and variables → Actions**. Create the token from the Expo account that owns `@lenajabas-team/shopmate-offline`, grant only the permissions needed to submit builds, and never commit the token or print it in workflow logs. The workflow verifies the Expo account and EAS project, then submits the build and prints the EAS build URL. Pull requests run validation only and do not submit builds.
