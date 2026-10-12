# Mini-program 5.2 review recovery — 2026-10-12

## Verified rejection

Verified in the existing signed-in Google Chrome session. Version 5.2 was rejected for login-restricted access to the withdrawal flow. The reviewer requested valid login credentials or complete screenshots/recording. Published version remains 5.1.4; 5.2 is not published.

## Actual defect and correction

Withdrawal GET correctly requires the website user's verified session. The client previously rendered its 401 message in a loading card with no login action. The balance summary also mislabeled 401 as temporary balance failure. This made a fresh reviewer session a dead end.

- Provide a login action on the withdrawal card and balance dashboard.
- Preserve selected currency, language, and withdrawal/history hash in the existing safe local `next` redirect.
- Stop the loading style on a confirmed unauthenticated response.
- Clear previous financial data when a refresh fails authorization; never show another session's cached balance as current.
- Successful reload clears the previous error and unauthenticated state.

Authorization remains required for private balances and refund submission. No guest withdrawal, default-account binding, synthetic paid order, or production-user data alteration is introduced.

## Release requirements

Do not resubmit the unchanged rejected artifact. Deploy and validate the corrected website used by the mini WebView, then verify login → return to withdrawal → original-channel instructions/refundable orders and account isolation on actual iOS/Android. Fill the review form with a valid dedicated account or genuine complete recording as requested. Do not provide a real customer's password, fake a refundable balance, or label mocked Playwright evidence as a live refund recording.

## Evidence

- Google Chrome WeChat review detail confirms login restriction.
- Existing production `/account` and `/sasi/pricing?mini=1` respond 200; unauthenticated financial APIs respond 401, rather than a missing route.
- Vercel CLI authorized through the existing Chrome login; the explicit production project and environment metadata are accessible. Latest observed deployment `dpl_BdFwGnxGLqnAWPV1fT2AVxsarjtt` is Ready and aliases both public domains and the mini API domain. This is the preceding deployment, not these unpublished changes.
- Type check, source gate, Playwright dependency contract pass for the correction. Initial and final production builds pass. The initial wider refund run was 11 pass / 1 fail on each: successful refresh cleared the cancellation-race notice. The correction retains operation notices and clears only login/read errors. Rebuilt final browser acceptance is **12 desktop pass / 12 mobile pass**, including the login-return regression and existing currency/refund cancellation/history checks. These browser financial responses are controlled fixtures, not real refunds. Original failure logs are retained, not relabeled as a pass.
- Shared automatic refresh, withdrawal recovery and money-progress API source tests pass. They do not exercise live provider refunds.
- Prior targeted real-output/short-drama fixture tests: 19 desktop and 19 mobile pass. Supplier-generated video and all 121 tool outputs remain separate uncompleted acceptance work.
