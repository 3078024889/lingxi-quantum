import{test,expect}from'./export-test';

test('time summaries preserve ISO, RFC and all four exact integer timestamps',async({page})=>{
 await page.goto('/tools/timestamp-converter?lang=en');const area=page.locator('[data-tool-workbench]');
 for(const[unit,input]of[['s','1'],['ms','1000'],['us','1000000'],['ns','1000000000']]){
  await area.getByRole('combobox').first().selectOption(unit);await area.locator('input').first().fill(input);
  await expect(area).toContainText('1970-01-01T00:00:01.000Z');
  await expect(area).toContainText('Thu, 01 Jan 1970 00:00:01 GMT');
  for(const label of ['Unix time (seconds)','Unix time (milliseconds)','Unix time (microseconds)','Unix time (nanoseconds)'])await expect(area).toContainText(label);
 }
});

test('Excel date serials match Microsoft examples across both date systems',async({page})=>{
 await page.goto('/tools/timestamp-converter?lang=en');await page.getByRole('button',{name:'Excel / Sheets',exact:true}).click();
 const area=page.locator('[data-tool-workbench]'),input=area.locator('input').first();
 for(const[serial,iso]of[['1','1900-01-01T00:00:00.000Z'],['59','1900-02-28T00:00:00.000Z'],['61','1900-03-01T00:00:00.000Z'],['25569','1970-01-01T00:00:00.000Z'],['40729','2011-07-05T00:00:00.000Z'],['40729.5','2011-07-05T12:00:00.000Z']]){
  await input.fill(serial);await expect(area).toContainText(iso);
 }
 await area.getByRole('checkbox').check();
 for(const[serial,iso]of[['0','1904-01-01T00:00:00.000Z'],['39267','2011-07-05T00:00:00.000Z']]){
  await input.fill(serial);await expect(area).toContainText(iso);
 }
 await area.getByRole('checkbox').uncheck();
 for(const invalid of['','60','60.5']){await input.fill(invalid);await expect(area).toContainText('Invalid Excel date serial.');await expect(area.locator('dl')).toHaveCount(0)}
});
