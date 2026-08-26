# Contributing to ShopMate Offline

Thank you for helping improve ShopMate Offline. Contributions should preserve the app’s purpose: a dependable, single-device business tool that works without an internet connection.

## Before you start

Please review the README and search existing issues before opening a change. For feature work, describe the user problem, the affected module, the offline data behavior, and how the change will be tested. Keep changes focused and avoid mixing unrelated refactors into a feature or fix.

## Development setup

Install Node.js 22, pnpm 9, Git, and the Android development tools when native testing is required. From the repository root, install dependencies with:

```bash
pnpm install
```

Run the project checks before submitting a change:

```bash
pnpm check
pnpm test
pnpm lint
```

The test suite should remain deterministic and must not require a network, cloud account, camera, filesystem outside the app sandbox, or a real payment provider.

## Product and architecture expectations

All user records must remain local. Do not add runtime API calls, remote databases, cloud synchronization, analytics, or network permissions without an explicit product decision and review. Preserve the four primary modules: POS, NOTEBOOK, CALCULATOR, and RECEIPT BOOK.

Use KSH and East Africa Time conventions consistently with the existing app. Maintain the navy-orange design system, compact portrait layout, accessible contrast, safe-area behavior, and one-handed interaction patterns. Native features should be guarded where platform behavior differs and should degrade gracefully on web preview.

When changing persisted data, update normalization and backup/restore handling so older local state remains readable. Add or update pure domain tests for calculations, filtering, validation, authorization, and other business rules. Never insert test data into a user’s local records.

## Pull requests

A pull request should explain what changed, why it changed, and how it was verified. Include the relevant module and user flow in the description. For UI work, include a compact portrait screenshot or a short description of the device size tested. For native features, identify the Android version or emulator used.

Before requesting review, confirm that TypeScript checks pass, deterministic tests pass, lint has no new errors or warnings, and the working tree contains no secrets or generated signing material.

## Secrets and signing material

Never commit `.env` files, API keys, passwords, keystores, certificates, or private keys. Production Android signing is configured through protected GitHub Actions secrets only. Keep the following values in the repository’s protected Actions secret store:

| Secret | Purpose |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded production keystore. |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password. |
| `ANDROID_KEY_ALIAS` | Alias of the production signing key. |
| `ANDROID_KEY_PASSWORD` | Password for the signing key. |

Only trusted maintainers should be allowed to run or approve production release workflows. Rotate signing credentials according to the organization’s security policy and immediately revoke compromised credentials.

## Commit and release conventions

Use short, descriptive commit messages such as `fix: prevent duplicate cart lines` or `docs: update Android build guide`. Version tags should use semantic versioning, for example `v1.1.0` for a feature release and `v1.0.1` for a backwards-compatible fix.

Normal pushes build a debug APK for validation. Version tags invoke the protected release build and publish the signed APK only when all required signing secrets are present. Use the repository Actions tab to inspect logs and artifacts.

## Reporting security issues

Do not disclose signing keys, credentials, or exploitable security details in a public issue. Contact the maintainer privately through **streetpandacyber@gmail.com** and include a concise description, affected version, reproduction steps, and mitigation suggestions.
