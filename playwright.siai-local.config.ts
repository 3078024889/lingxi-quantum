import {defineConfig,devices} from 'playwright/test';

const baseURL=process.env.LINGXIFIELD_E2E_BASE_URL||'http://127.0.0.1:3000';

/**
 * Offline/local SIAI user journey gate. No Vercel preview, external merchant
 * authentication, payment submission, account creation or production mutation.
 */
export default defineConfig({
 testDir:'./tests/siai-local',
 testMatch:'**/*.spec.ts',
 timeout:45_000,
 expect:{timeout:12_000},
 retries:0,
 workers:1,
 reporter:[['list']],
 use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
  {name:'mobile-chromium',use:{...devices['Pixel 7']}}
 ],
 webServer:{
  command:'pnpm start',
  url:baseURL,
  timeout:180_000,
  reuseExistingServer:false
 }
});
