import{defineConfig,devices}from"playwright/test";
export default defineConfig({
 testDir:"./tests/final-closure",testMatch:"food-results.spec.ts",workers:1,retries:0,timeout:30000,
 use:{baseURL:"http://127.0.0.1:3217",trace:"retain-on-failure"},
 projects:[{name:"food-result",use:{...devices["Desktop Chrome"]}}],
 webServer:{command:"pnpm exec next start -p 3217",url:"http://127.0.0.1:3217",reuseExistingServer:false,timeout:120000,env:{...process.env,NODE_ENV:"production",LINGXIFIELD_GRADUATION:"1"}}
});