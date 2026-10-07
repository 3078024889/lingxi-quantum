import {test,expect} from 'playwright/test';

test('user-funded resource can continue chat when the shared experience pool is unavailable',async({page})=>{
 await page.addInitScript(()=>{
  let signedIn=false;
  Object.defineProperty(globalThis,'puter',{configurable:true,value:{
   auth:{isSignedIn:()=>signedIn,signIn:async()=>{signedIn=true},signOut:()=>{signedIn=false}},
   ai:{chat:async(input:string)=>({message:{content:'Personal resource reply: '+input}})}
  }});
 });
 await page.route('**/api/sasi/experience/text',route=>route.fulfill({json:{state:'needs-connection',experienceExhausted:true}}));
 await page.goto('/sasi?mode=chat&lang=en');
 await page.locator('button[aria-controls],button[aria-expanded]').filter({hasText:'＋'}).click();
 await page.getByRole('button',{name:'Connect and enable',exact:true}).click();
 await expect(page.getByText('Connected',{exact:true})).toBeVisible();
 await page.locator('textarea').fill('Continue this conversation');
 await page.locator('textarea').press('Enter');
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText('Personal resource reply:');
});
