# Physical-device testing

ShopMate Offline uses the EAS `preview` profile to produce an installable Android APK. The profile is configured with `distribution: internal` and `android.buildType: apk`, so the managed build service can create a signed test artifact without adding an internet dependency to the app.

From the project management interface, start the Android build with the `preview` profile. When the build completes, download the APK, install it on an Android device, and test the following flows with Wi-Fi and mobile data disabled: first-run PIN setup, cashier shift start, barcode permission and scanning, scan-to-cart, checkout, report presets, local backup/restore, receipt PDF/print preview, camera/gallery receipt capture, and app relocking after backgrounding.

Barcode scanning supports EAN-13, EAN-8, Code 128, and QR formats. Scanned values are matched locally against a product barcode or SKU. Unknown values are returned to the local product editor for registration; no barcode data is uploaded.

The Reports tab now provides Today, Last 7 days, This month, Current shift, and All time presets, plus cashier/date filters, top-product revenue summaries, and local CSV export.

Production distribution should use the `production` EAS profile with the repository’s protected Android signing credentials. Do not place keystore passwords or signing files in the repository.
