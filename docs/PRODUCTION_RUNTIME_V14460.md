# LINGXIFIELD production runtime

## PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=live
PAYPAL_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://lingxifield.com

Webhook:
https://lingxifield.com/api/pay/webhook

Recommended events:
CHECKOUT.ORDER.APPROVED
PAYMENT.CAPTURE.PENDING
PAYMENT.CAPTURE.COMPLETED
PAYMENT.CAPTURE.DENIED

Do not set PAYPAL_ENABLED=true until the Live app and merchant capability are approved.

## Food calorie vision
DASHSCOPE_API_KEY=
TOOL_VISION_MODEL=qwen3-vl-flash
# Optional workspace-specific endpoint:
DASHSCOPE_COMPATIBLE_BASE_URL=https://<WorkspaceId>.cn-beijing.maas.aliyuncs.com/compatible-mode/v1

## SASI BYOK reasoning
SASI_BYOK_ENCRYPTION_KEY=
SASI_BYOK_TEXT_MODEL=doubao-seed-evolving
SASI_BYOK_REASONING_ENABLED=true

BYOK supplier charges are paid by the user's own provider account.
Hosted SASI balance remains separately gated by production readiness.

## Refund reality
The site has a refund-request ledger and internal balance reversal controls.
It does NOT yet automatically call WeChat/Alipay/PayPal refund APIs.
It is NOT a bank-withdrawal system.
