#!/usr/bin/env bash
set -euo pipefail

: "${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS is required}"
: "${ANDROID_KEYSTORE_PASSWORD:?ANDROID_KEYSTORE_PASSWORD is required}"
: "${ANDROID_KEY_PASSWORD:?ANDROID_KEY_PASSWORD is required}"

cat >> android/gradle.properties <<EOF
RELEASE_STORE_FILE=release.keystore
RELEASE_KEY_ALIAS=${ANDROID_KEY_ALIAS}
RELEASE_STORE_PASSWORD=${ANDROID_KEYSTORE_PASSWORD}
RELEASE_KEY_PASSWORD=${ANDROID_KEY_PASSWORD}
EOF

perl -0pi -e 's/signingConfigs\s*\{\n/signingConfigs {\n        release {\n            storeFile file(RELEASE_STORE_FILE)\n            storePassword RELEASE_STORE_PASSWORD\n            keyAlias RELEASE_KEY_ALIAS\n            keyPassword RELEASE_KEY_PASSWORD\n        }\n/' android/app/build.gradle

perl -0pi -e 's/(buildTypes\s*\{[\s\S]*?\n\s*release\s*\{)/$1\n            signingConfig signingConfigs.release/' android/app/build.gradle
