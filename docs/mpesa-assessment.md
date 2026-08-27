# M-Pesa integration assessment

Safaricom's official Daraja Developer Portal states that Daraja 3.0 provides access to Safaricom and M-PESA APIs for payment integration with web and mobile apps. The official API catalog is available at https://developer.safaricom.co.ke/apis. The portal supports creating sandbox apps and simulating API calls. This confirms that live STK Push is an online API workflow, not an offline-only capability. Any STK request, callback/result notification, or transaction-status query would require connectivity and a backend or trusted payment gateway component. ShopMate Offline should therefore keep local cash/recording workflows usable offline and treat M-Pesa as an optional online payment mode with a pending state, idempotent transaction IDs, server-side credentials, callback verification, and reconciliation when connectivity returns. No M-Pesa connector is enabled in the current session config.

Sources:
- https://developer.safaricom.co.ke/
- https://developer.safaricom.co.ke/apis
