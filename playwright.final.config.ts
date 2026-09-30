import { defineConfig, devices } from "playwright/test";
const baseURL=process.env.LINGXIFIELD_E2E_BASE_URL||"http://127.0.0.1:3000";
export default defineConfig({testIgnore:["**/food-results.spec.ts"],
  testDir:"./tests/final-closure",timeout:30000,retries:0,use:{baseURL,trace:"retain-on-failure"},projects:[
{name:"desktop-chromium",use:{...devices["Desktop Chrome"]}},
{name:"mobile-chromium",use:{...devices["Pixel 7"]}}
],webServer:process.env.LINGXIFIELD_E2E_REMOTE?undefined:{command:"pnpm start",url:baseURL,reuseExistingServer:true,timeout:120000}});
