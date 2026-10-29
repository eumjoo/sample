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
 await page.getByRole('button',{name:'3D 모델',exact:true}).click();
 await expect(page.locator('#nephron')).toBeVisible();
 await page.getByRole('button',{name:'자동 회전',exact:true}).click();
 await page.getByRole('button',{name:'네프론 그림',exact:true}).click();
 await expect(page.locator('#diagram svg')).toBeVisible();
 await page.getByRole('button',{name:'모든 설정 초기화',exact:true}).click();
 await expect(page.locator('#scenario')).toHaveValue('normal');
 await expect(page.locator('[data-substance=all]')).toHaveClass('active');
 expect(errors).toEqual([]);
 await page.screenshot({path:'/tmp/nephron-desktop.png',fullPage:true});
});
test('diagram and moving particles work without WebGL', async ({page}) => {
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){
   return type.includes('webgl')?null:getContext.call(this,type,...args);
  };
 });
 await page.goto('/');
 await expect(page.locator('#diagram svg')).toBeVisible();
 const particle=page.locator('#diagram-particles circle[data-species=water]').first();
 const before=await particle.getAttribute('cx');
 await expect.poll(()=>particle.getAttribute('cx')).not.toBe(before);
 await page.getByRole('button',{name:'3D 모델',exact:true}).click();
 await expect(page.locator('#fallback')).toContainText('네프론 그림');
 await expect(page.locator('#diagram svg')).toBeVisible();
 await page.selectOption('#scenario','dehydrated');
 await page.locator('[data-substance=water]').click();
 const wetParticles=page.locator('#diagram-particles circle[data-species=water]');
 expect(await wetParticles.count()).toBeGreaterThan(0);
 await page.getByRole('button',{name:'일시정지',exact:true}).click();
 await page.waitForTimeout(80);
 const stopped=await particle.getAttribute('cx');
 await page.waitForTimeout(120);
 expect(await particle.getAttribute('cx')).toBe(stopped);
 expect(errors).toEqual([]);
 await page.screenshot({path:'/tmp/nephron-no-webgl.png',fullPage:true});
});
test('WebGL context loss returns to the working diagram',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.getByRole('button',{name:'3D 모델',exact:true}).click();
 await expect(page.locator('#nephron')).toBeVisible();
 await page.locator('#nephron').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await expect(page.locator('#diagram svg')).toBeVisible();
 await expect(page.locator('#nephron')).toBeHidden();
 await page.locator('[data-substance=glucose]').click();
 await expect(page.locator('#substance-note')).toContainText('포도당');
 expect(errors).toEqual([]);
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
