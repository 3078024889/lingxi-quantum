import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Test-only compatibility adapter. Native media processing, auth, billing,
// oversized assets and cron remain STOP-SHIP until real workerd acceptance.
export default defineCloudflareConfig();
