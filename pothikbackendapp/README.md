# Pothik-Backend
This is the backend of Pothik built using expressjs

## SSLCommerz Payment Setup

Add these environment variables:

```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

SSLCOMMERZ_SUCCESS_URL=https://your-domain.com/api/payments/success
SSLCOMMERZ_FAIL_URL=https://your-domain.com/api/payments/fail
SSLCOMMERZ_CANCEL_URL=https://your-domain.com/api/payments/cancel
SSLCOMMERZ_IPN_URL=https://your-domain.com/api/payments/ipn
```

Run migration for new payment columns:

```bash
node src/migrations/add-sslcommerz-columns-to-payments.js
```

Main endpoints:

- `POST /api/payments/init`
- `POST|GET /api/payments/success`
- `POST|GET /api/payments/fail`
- `POST|GET /api/payments/cancel`
- `POST /api/payments/ipn`
- `GET /api/payments/validate/:tran_id`

Minimal init payload example:

```json
{
	"booking_id": 101,
	"amount": 2500,
	"currency": "BDT",
	"customer_name": "Test User",
	"customer_email": "test@example.com",
	"customer_phone": "01700000000",
	"customer_address": "Dhaka"
}
```
