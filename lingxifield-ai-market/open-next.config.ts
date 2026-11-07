import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Standalone Cloudflare Workers migration. Do not import ECS-specific .env,
// payment credentials, or mainland-only infrastructure.
export default defineCloudflareConfig();
