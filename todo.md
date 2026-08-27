# Project TODO

- [x] Confirm ShopMate Offline app identity and default currency assumption (₦)
- [x] Write mobile interface design plan for portrait one-handed use
- [x] Configure navy-orange theme tokens and dark/light mode
- [x] Generate and install unique ShopMate Offline app icon and branding configuration
- [x] Define local-only data model for settings, app lock, cashiers, shifts, products, stock adjustments, carts, sales, notebooks, receipts, and backup metadata
- [x] Implement local persistence with no cloud dependency
- [x] Implement app-open PIN/password lock
- [x] Implement optional protection PIN for editing/deleting sales, stock, and reports
- [x] Implement Home module hub for POS, Notebook, Calculator, and Receipt Book
- [x] Implement POS cashier shift start with name, optional cashier PIN, and automatic timestamp
- [x] Implement POS shift end logging and active shift badge
- [x] Implement vertical product list with search by name/SKU/category
- [x] Implement product category filter chips
- [x] Implement product creation and editing with image, SKU, price, category, quantity type, stock, tax/VAT, and low-stock threshold
- [x] Implement POS cart with quantity controls and notepad-style handwritten presentation
- [x] Implement live amount-given, total, discount, and balance/change calculation
- [x] Implement cart voids, refunds, and optional PIN confirmation
- [x] Implement dedicated POS calculator with Send to Cart
- [x] Implement stock totals: overall received, sold, and balance
- [x] Implement low-stock highlighting and manual restock history
- [x] Keep Receipt Book entries independent from POS stock
- [x] Implement local sales transaction storage tagged to cashier and shift
- [x] Implement sales history and transaction detail views
- [x] Implement cashier/date-range report filtering
- [x] Implement end-of-day summary and end-shift summary
- [x] Implement local report export to file/PDF-compatible output
- [x] Implement POS Notebook and General Notebook as independent notebooks
- [x] Implement standalone Calculator module
- [x] Implement independent Receipt Book manual receipt flow
- [x] Implement camera-based receipt capture flow
- [x] Implement settings for currency symbol and number format
- [x] Implement dark/light theme toggle with dark navy default
- [x] Implement full local backup export to a single versioned file
- [x] Implement validated local backup import/restore
- [x] Add deterministic unit tests for totals, stock movements, PIN protection, and backup validation
- [x] Verify all user flows and remove dead-end actions
- [x] Save final checkpoint and provide the project version for Android build/publish via the UI

- [x] Add POS Notebook with sale/customer/shift context links, cashier tags, and timestamps
- [x] Add General Notebook fully independent from POS data and workflows
- [x] Add shared notebook create, edit, delete, pin, search, and autosave behavior
- [x] Add notebook folders/categories, color tags, and created/modified sorting
- [x] Add lightweight rich-text controls for bold, italic, bullets, and checklists

- [x] Add standalone Calculator standard mode with memory keys, percentage, history, and clipboard copy
- [x] Add Calculator scientific mode with trigonometry, square root, exponents, and logarithm
- [x] Persist calculator history locally and support clearing it
- [x] Add independent Receipt Book manual entry and formatted digital receipt generation
- [x] Add Receipt Book camera/gallery attachment flow with local image compression and optional crop/rotate
- [x] Add searchable/filterable receipt history by date and customer
- [x] Add receipt view, edit, delete, local export/share, and future printer-ready action point
- [x] Ensure calculator history and cashier records are included in the single backup file
- [x] Verify camera/gallery permissions require no internet permission
- [x] Validate persistence across app restarts and offline APK operation

- [x] Refine top-level Calculator as a basic-only standalone flow separate from both POS calculators
- [x] Add receipt title, receipt notes, automatic date/time, and multiple manual line items
- [x] Add receipt detail view with items, totals, and attached-image gallery
- [x] Add receipt image records with local URI, receipt link, and created timestamp
- [x] Align local domain model with CashierShift, Product, StockMovement, Sale, SaleItem, Note, Receipt, ReceiptItem, and ReceiptImage entities
- [x] Derive stock balances and reports from local records rather than remote data

- [x] Change default currency display from ₦ to KSH
- [x] Add visible back navigation from module views to the Home module hub
- [x] Add nested POS back navigation from POS subviews to the POS Sell screen
- [x] Ensure back controls are usable on portrait Android screens

- [x] Redesign primary navigation to exactly four sections: POS, NOTEBOOK, CALCULATOR, and RECEIPT BOOK
- [x] Remove Home, More, and other items from the primary bottom navigation
- [x] Add module icons, descriptions, and color indicators for the four sections
- [x] Add active orange navigation pills and muted navy inactive states
- [x] Add smooth module transition animation without introducing cross-module feature mixing

- [x] Build the complete independent NOTEBOOK workspace with POS Notes and My Notebook labels
- [x] Add notebook card previews, pinned section, category tags, search, and four sort modes
- [x] Expand note editor toolbar with formatting, headings, lists, checkboxes, dividers, alignment, and text styling controls
- [x] Add lined, grid, plain, and dotted note-page styles
- [x] Add notebook image/date/divider/table insertion actions
- [x] Add custom folders, archive, trash with recovery metadata, and local note locking
- [x] Add note word/character counts, created/edited timestamps, and quick-note floating action
- [x] Expand POS internal tabs to Dashboard, Cashier, Products, Sales, Stock, and Reports
- [x] Add cashier shift name, shift label, lined-paper start form, recent items, end-shift confirmation, and shift summary
- [x] Add product cost/barcode/image/notes fields plus list sorting and stock filters
- [x] Add POS cart internal calculator with payment states, quick cash, hold sale, print receipt, and clear confirmation
- [x] Add sale detail expansion, date/cashier filters, stock dashboard totals, progress bars, alerts, and movement history
- [x] Add daily, cashier, stock, product, and shift report types with generated metadata

- [x] Audit and remove any runtime API/cloud dependency from the app flows
- [x] Add explicit OFFLINE MODE status badge with positive green styling
- [x] Add on-device storage notice to Settings
- [x] Persist and restore the last active top-level section locally
- [x] Persist and restore an active cashier shift across app restarts
- [x] Ensure structured data, calculator history, and receipt/note records remain locally serializable
- [x] Keep camera/gallery image references device-local and avoid network access
- [x] Ensure backup export/import is local-only and clearly documented as on-device
- [x] Review Android permissions and remove unnecessary internet-related requirements

- [x] Fix compact portrait POS header overlap and clipped back control
- [x] Move OFFLINE MODE badge into safe, non-overlapping header space
- [x] Make POS header controls responsive on narrow Android widths
- [x] Verify mobile header and category controls at compact viewport sizes

- [x] Remove the top-left Home arrow from POS headers
- [x] Apply the compact responsive header layout consistently across nested POS tabs
- [x] Replace bottom-navigation text symbols with proper vector icon components
- [x] Expand POS cart into a detailed checkout view with payment state feedback
- [x] Add quick cash buttons, clear-cart confirmation, hold sale, and receipt action points
- [x] Verify cart totals, balance/change, and checkout actions remain offline and mobile-friendly

- [x] Add product create/edit form with name, SKU, category, price, cost, quantity type, stock, low-stock threshold, image, and notes
- [x] Add cashier management list with per-cashier PIN setup and update
- [x] Require cashier PIN authorization for refund and void actions
- [x] Track refund/void metadata without changing unrelated receipt-book inventory
- [x] Add cashier and date-range filters to sales reports
- [x] Add local print-ready output for completed sales and receipts
- [x] Add local share/export actions for completed sales and receipts
- [x] Add deterministic tests for authorization, report filters, and product totals

- [x] Add business name, address, phone, tax ID, logo URI, footer, and receipt-template settings
- [x] Add customizable PDF receipt template controls and thermal printer width presets
- [x] Add local receipt PDF generation with selected template and business branding
- [x] Add stock movement history screen with adjustment, sale, refund, and void entries
- [x] Add refund and void audit history with cashier, authorizer, timestamp, and reason
- [x] Add owner-only role and owner PIN authorization for sensitive actions
- [x] Add edit-PIN configuration interface for cashiers
- [x] Add deterministic tests for receipt template data, owner authorization, and audit records

- [x] Remove “← Home” controls from Notebook, Calculator, and Receipt Book headers
- [x] Add developer credit: JM Majiwa
- [x] Add East African Time (EAT, UTC+3) formatting helper for app timestamps
- [x] Add localized East African calendar/date display for shifts, sales, notes, receipts, and audits
- [x] Verify compact secondary-module headers remain unclipped after removing Home controls

- [x] Verify POS, NOTEBOOK, CALCULATOR, and RECEIPT BOOK bottom navigation destinations
- [x] Verify POS Sell, Cart, Stock, Sales, Reports, and Audit sub-tabs
- [x] Verify POS settings access and nested module transitions
- [x] Verify removal of secondary Home controls and consistent compact headers
- [x] Verify EAT timestamps, JM Majiwa credit, KSH formatting, and offline badge
- [x] Verify local persistence, active shift restoration, backup/restore, and calculator history
- [x] Verify local print/PDF/share actions, camera/gallery permissions, and owner authorization flows
- [x] Verify responsive layout at compact portrait and desktop preview sizes

- [x] Add dedicated POS Dashboard sub-tab with sales, stock, shift, and action summaries
- [x] Add dedicated POS Cashier sub-tab with active shift details and cashier management access
- [x] Add receipt preview before print/PDF with editable receipt details and line items
- [x] Add receipt preview confirmation before generating local print/PDF output
- [x] Add Stock quick search and status/category filters
- [x] Add Sales quick search and status/cashier/date filters
- [x] Add deterministic tests for dashboard metrics and stock/sales filtering

- [x] Add native date-picker controls for Sales date range filters
- [x] Add native date-picker controls for Stock movement/date filtering
- [x] Add receipt preview tax and discount draft fields
- [x] Include tax and discount in receipt preview totals and exported output
- [x] Add new line-item entry controls inside receipt preview
- [x] Validate receipt total calculations after line, tax, and discount edits

- [x] Add exact print-layout receipt preview modal before print/PDF confirmation
- [x] Add fixed amount versus percentage mode selectors for receipt discount and tax
- [x] Recalculate receipt totals correctly for both tax and discount modes
- [x] Add native EAT date-picker controls to Audit filters
- [x] Add native EAT date-picker controls to Reports filters
- [x] Validate print-preview fidelity, percentage calculations, and all POS date filters

- [x] Generate a compact local receipt-preview thumbnail for saved Receipt Book records
- [x] Persist thumbnail references with receipt records and backup data
- [x] Display receipt thumbnails in newest-first Receipt Book history with a safe fallback
- [x] Keep thumbnail generation and loading fully offline

- [x] Improve Receipt Book history thumbnail readability with clearer receipt hierarchy, spacing, and fallback details

- [x] Add larger tappable Receipt Book detail preview modal from history thumbnails
- [x] Add local Receipt Book sorting and filtering by customer, date, and amount
- [x] Add dedicated POS calculator sub-tab with Send to Cart action

- [x] Fix compact movement-date filter label clipping and adjacent action overlap

- [x] Complete dedicated POS calculator UI and Send to Cart workflow
- [x] Apply compact action-row layout to remaining crowded controls across the app

- [x] Add persisted optional POS-calculator auto-balance-parentheses setting
- [x] Add divide-by-zero and other invalid-state hints with visual keypad feedback
- [x] Auto-close unmatched parentheses on equals when auto-balance is enabled

- [x] Add automatic correction for repeated POS-calculator operators
- [x] Add calculator Settings help panel for auto-balance and validation rules
- [x] Add physical keyboard input support for the POS calculator

- [x] Fix narrow POS Sell layout: remove empty gap, prevent clipped sub-tabs, and eliminate nested scrollbars

- [x] Move POS cashier shift start into a dedicated screen
- [x] Add a subtle horizontal-scroll shadow indicator to POS sub-tabs
- [x] Keep POS Sell search and category controls sticky above the product list

- [x] Move the remaining cashier name/PIN/start-shift controls completely out of the POS Sell header

- [x] Add JM Majiwa developer credit to app information
- [x] Add Street Panda Cyber support email and WhatsApp contact

- [x] Add dashboard support card linking to the About section
- [x] Display current app version and release date below the developer credit
- [x] Add tap-to-copy email and WhatsApp actions with success toast

- [x] Analyze selected GitHub repository state, remote, and recent history
- [x] Push the current validated ShopMate Offline project changes to GitHub

- [x] Add comprehensive README with Android build and offline-use instructions to GitHub
- [x] Configure and verify GitHub Actions testing and APK build workflow
- [x] Create and publish the initial tagged GitHub release with APK artifact when available

- [x] Add protected production keystore signing configuration for GitHub release builds
- [x] Add an open-source license to the repository
- [x] Add contribution guidelines to the repository

- [x] Add About-section debug/release build indicator
- [ ] Add GitHub release update notification without violating the offline requirement
- [x] Add dashboard feedback form with an offline-safe submission path or approved online submission

- [x] Remove remaining unused Receipt Book filter-state warnings
- [x] Resolve the ESLint module-type warning without breaking Expo configuration

- [ ] Push clean-build changes to GitHub
- [ ] Trigger and verify a new GitHub Actions Android APK build
- [ ] Provide a direct debug APK download link after the GitHub Actions artifact is available
- [x] Connect the project to Expo build services using the supplied credential
- [x] Verify Expo project configuration and APK build readiness
- [x] Audit remaining security, feature, display, accessibility, and release-readiness improvements

- [x] Harden PIN storage, retry throttling, background relock, and owner authorization
- [x] Harden backup schema validation, size limits, and recovery copy (encrypted export remains future hardening)
- [x] Escape user-entered receipt HTML and validate receipt data before rendering
- [x] Improve persistence reliability with debounced atomic saves and failure recovery
- [x] Remove unused native audio/video plugins and verify offline Android permissions
- [x] Add barcode scanning, product sorting, stock movement details, and sale-detail expansion
- [x] Add offline barcode scanning and barcode product lookup
- [x] Add richer report presets and local report exports
- [x] Prepare signed APK build configuration for physical-device testing
- [x] Add report presets and explicit date-boundary handling
- [x] Add receipt deletion safeguards and native-flow validation
- [x] Add accessibility labels, roles, focus states, and touch-target polish
- [ ] Split the monolithic screen into maintainable module components
- [x] Run full validation and save the upgraded project checkpoint
- [ ] Check current EAS preview build status and APK availability
- [ ] Set up Expo Observe for the linked Expo app
- [ ] Validate Expo Observe configuration and save a checkpoint
- [x] Push the current project state to GitHub after the Expo Observe decision
- [ ] Verify Expo and GitHub build-path connection and document required setup
- [x] Update GitHub Actions to submit automatic EAS preview APK builds with EXPO_TOKEN
- [x] Validate and push the Expo build workflow update
- [x] Push a small commit to trigger the EAS GitHub Actions workflow
- [x] Verify the triggered workflow and EAS build status
- [x] Check EAS build status, APK availability, and GitHub Actions logs for errors
- [x] Diagnose and resolve the reported GitHub Actions EAS workflow failure
- [x] Inspect the newest workflow logs after the dependency-installation fix
- [x] Remove GitHub Actions Node.js 20 deprecation warnings
- [x] Add EAS cli.appVersionSource configuration and push the fixes
- [x] Check the newest GitHub Actions workflow and EAS APK artifact availability
- [ ] Rate current app and document Google Play submission and monetization guidance
- [ ] Audit the requested scope for skipped or incomplete app upgrades
- [x] Complete sensitive-action authorization for sales edits/deletions, stock adjustments, and report changes
- [x] Add deterministic tests for the complete sensitive-action authorization matrix

- [x] Critical upgrade: extend sensitive-action authorization coverage for stock adjustments and sale deletion, with action-aware policy tests
- [ ] Critical upgrade: protect any future report mutations with the action-aware authorization policy
- [x] Next upgrade: complete Receipt Book detail preview, customer/date/amount filtering and sorting, deletion confirmation, and recovery protection
- [x] Add deterministic Receipt Book safeguard tests and validate native-independent local flows
- [x] Next upgrade: add cashier shift labels, recent activity, end-shift confirmation, and complete local shift summaries
- [x] Add deterministic shift summary tests and validate local cashier flows
- [x] Expanded Reports into daily, cashier, product, stock, and shift views with metadata, comparison totals, and inclusive EAT date boundaries
- [x] Added deterministic report snapshot tests and validated local CSV export behavior
- [x] Next upgrade: add product sorting, duplicate barcode detection, stock-movement detail, and expanded sale details
- [x] Add deterministic tests for product sorting and duplicate barcode safeguards
- [x] Next upgrade: add password-protected local backup export and a visible backup-before-restore safeguard
- [x] Add deterministic backup encryption, password validation, and restore-guard tests
- [x] Assess optional M-Pesa STK Push and transaction reconciliation as an online add-on without weakening offline operation
- [ ] If approved, design a secure backend-mediated M-Pesa integration with pending payments, callbacks, idempotency, and reconciliation
- [x] Implement Option A: strict offline manual M-Pesa recording with payment and reconciliation fields
- [x] Update the local sales schema and compatibility normalization for manual M-Pesa records
- [x] Add deterministic tests for manual M-Pesa status and reconciliation rules
- [x] Extract the monolithic checkout screen into smaller maintainable modules
- [x] Add an unreconciled M-Pesa badge or indicator to the POS dashboard
- [x] Add a dedicated unreconciled M-Pesa report and filter
- [x] Add deterministic tests for unreconciled M-Pesa counts, filters, and report totals
