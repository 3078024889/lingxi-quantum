import { defineConfig, devices } from "playwright/test";
const baseURL=process.env.LINGXIFIELD_E2E_BASE_URL||"http://127.0.0.1:3000";
export default defineConfig({testIgnore:["**/food-results.spec.ts","**/production.spec.ts"],
  testDir:"./tests/final-closure",timeout:30000,retries:0,use:{baseURL,channel:"chrome",trace:"retain-on-failure"},projects:[
{name:"desktop-chromium",use:{...devices["Desktop Chrome"]}},
{name:"mobile-chromium",use:{...devices["Pixel 7"]}}
],webServer:process.env.LINGXIFIELD_E2E_REMOTE?undefined:{command:"pnpm start",url:baseURL,reuseExistingServer:true,timeout:120000,env:{NEXT_PUBLIC_SITE_URL:process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com",NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://sxsgdpqojepgbbrxrzlq.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2dkcHFvamVwZ2JicnhyemxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTc0ODIsImV4cCI6MjA5Nzk5MzQ4Mn0.x4LNnsCvmHsCiRk2HFIsVjg-0ddbTQlkcKpKQFaAdXE"}}});
