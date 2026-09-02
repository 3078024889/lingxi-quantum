import { createSign, createVerify, generateKeyPairSync } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

process.env.ALIPAY_APP_ID = "2021000000000000";
process.env.ALIPAY_PRIVATE_KEY = privateKey;
process.env.ALIPAY_PUBLIC_KEY = publicKey;

const { createAlipayPaymentUrl, verifyAlipayNotification } = await import("../lib/alipay.ts");

const sortAscii = ([a], [b]) => a < b ? -1 : a > b ? 1 : 0;
const canonical = (params, excludeSignType = false) => Object.entries(params)
  .filter(([key, value]) => key !== "sign" && (!excludeSignType || key !== "sign_type") && value !== "")
  .sort(sortAscii)
  .map(([key, value]) => `${key}=${value}`)
  .join("&");

const paymentUrl = new URL(createAlipayPaymentUrl({
  outTradeNo: "LX0123456789abcdef",
  amountRmb: 68.8,
  subject: "灵犀场测试订单",
  returnUrl: "https://lingxifield.cn/api/pay/alipay/return",
  notifyUrl: "https://lingxifield.cn/api/pay/alipay/notify",
  mobile: true,
}));
const requestParams = Object.fromEntries(paymentUrl.searchParams.entries());
const requestVerifier = createVerify("RSA-SHA256");
requestVerifier.update(canonical(requestParams), "utf8");
requestVerifier.end();
if (!requestVerifier.verify(publicKey, requestParams.sign, "base64")) {
  throw new Error("Alipay request signature could not be verified");
}

const notification = {
  app_id: process.env.ALIPAY_APP_ID,
  out_trade_no: "LX0123456789abcdef",
  total_amount: "68.80",
  trade_status: "TRADE_SUCCESS",
  sign_type: "RSA2",
};
const signer = createSign("RSA-SHA256");
signer.update(canonical(notification, true), "utf8");
signer.end();
notification.sign = signer.sign(privateKey, "base64");
if (!verifyAlipayNotification(notification)) {
  throw new Error("Valid Alipay notification signature was rejected");
}
notification.total_amount = "0.01";
if (verifyAlipayNotification(notification)) {
  throw new Error("Tampered Alipay notification signature was accepted");
}

console.log("PASS Alipay RSA2 request and notification signatures");
