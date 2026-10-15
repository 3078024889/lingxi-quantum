import {test as base} from 'playwright/test';
export * from 'playwright/test';
// Output regressions isolate metering, just as provider/paid regressions isolate
// payments. This never disables production enforcement or touches real quotas.
// daily-export-quota-v92.spec.ts uses the base fixture to exercise this UI gate.
export const test=base.extend({
 context:async({context},use)=>{
  await context.route('**/api/tools/free-export',route=>{
   const body=route.request().postDataJSON();
   return route.fulfill({json:{id:body.id,allowed:true,paidUnits:0,freeUnits:body.units,loginRequired:false}});
  });
  await use(context);
 },
});
