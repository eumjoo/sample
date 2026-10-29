import { test, expect } from '@playwright/test';
test('scenarios, substances, stages and playback work in 3D', async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('#fallback')).toBeHidden();
 await expect(page.locator('#scenario option')).toHaveCount(3);
 const normal=Number(await page.locator('#urine').textContent());
 await page.selectOption('#scenario','dehydrated');
 const dry=Number(await page.locator('#urine').textContent());
 await page.selectOption('#scenario','hydrated');
 const wet=Number(await page.locator('#urine').textContent());
 expect(dry).toBeLessThan(normal);expect(wet).toBeGreaterThan(normal);
 for(const substance of ['blood','protein','urea','water','glucose','amino']){
  await page.locator(`[data-substance="${substance}"]`).click();
  await expect(page.locator(`[data-substance="${substance}"]`)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#substance-note')).not.toBeEmpty();
 }
 await page.locator('[data-stage="2"]').click();
 await expect(page.locator('#detail-text')).toContainText('재순환');
 await page.getByRole('button',{name:'일시정지',exact:true}).click();
 await expect(page.locator('#play-status')).toContainText('일시정지');
 await page.locator('#speed').click();await expect(page.locator('#speed')).toHaveText('2×');
 await page.getByRole('button',{name:'자동 회전',exact:true}).click();
 await page.getByRole('button',{name:'정면 보기',exact:true}).click();
 await page.getByRole('button',{name:'모든 설정 초기화',exact:true}).click();
 await expect(page.locator('#scenario')).toHaveValue('normal');
 await expect(page.locator('[data-substance=all]')).toHaveClass('active');
 expect(errors).toEqual([]);
 await page.screenshot({path:'/tmp/nephron-desktop.png',fullPage:true});
});
test('mobile layout stays within the viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('#fallback')).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.selectOption('#scenario','hydrated');
 await page.locator('[data-substance=water]').click();
 await expect(page.locator('#substance-note')).toContainText('물');
 await page.screenshot({path:'/tmp/nephron-mobile.png',fullPage:true});
});
