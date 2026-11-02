import {defineConfig,devices} from "playwright/test";
const baseURL=process.env.LINGXIFIELD_E2E_BASE_URL||"http://127.0.0.1:3000";
export default defineConfig({
 testDir:"./tests/catalog-sweep",timeout:60000,retries:0,workers:3,
 use:{baseURL,channel:"chrome",trace:"retain-on-failure"},
 projects:[
  {name:"desktop-chromium",use:{...devices["Desktop Chrome"]}},
  {name:"mobile-chromium",use:{...devices["Pixel 7"]}}
 ],
 webServer:process.env.LINGXIFIELD_E2E_REMOTE?undefined:{command:"pnpm start",url:baseURL,reuseExistingServer:true,timeout:120000}
});
