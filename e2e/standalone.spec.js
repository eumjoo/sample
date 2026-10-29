import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('single HTML runs offline without loading any other files', async ({page,context}) => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const errors=[], requests=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('request', r=>requests.push(r.url()));
  await context.setOffline(true);
  await page.setContent(html);
  await expect(page.locator('#diagram svg')).toBeVisible();
  await expect(page.locator('#boot-fallback')).toBeHidden();
  await expect(page.locator('#scenario option')).toHaveCount(3);
  const normal=Number(await page.locator('#urine').textContent());
  await page.selectOption('#scenario','dehydrated');
  expect(Number(await page.locator('#urine').textContent())).toBeLessThan(normal);
  await page.selectOption('#scenario','hydrated');
  expect(Number(await page.locator('#urine').textContent())).toBeGreaterThan(normal);
  await page.locator('[data-substance=glucose]').click();
  await expect(page.locator('#substance-note')).toContainText('포도당');
  const particle=page.locator('#diagram-particles circle[data-species=glucose]').first();
  const before=await particle.getAttribute('cx');
  await expect.poll(()=>particle.getAttribute('cx')).not.toBe(before);
  await page.getByRole('button',{name:'3D 모델',exact:true}).click();
  await expect(page.locator('#nephron')).toBeVisible();
  await page.getByRole('button',{name:'네프론 그림',exact:true}).click();
  await expect(page.locator('#diagram svg')).toBeVisible();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({path:'/tmp/nephron-standalone.png',fullPage:true});
});

test('picture and substance routes remain visible with JavaScript disabled', async ({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await context.setOffline(true);
  await page.setContent(await readFile(new URL('../index.html',import.meta.url),'utf8'));
  await expect(page.locator('#diagram svg')).toBeVisible();
  await expect(page.locator('#app')).toContainText('혈구·단백질은 혈관 안에');
  await expect(page.locator('#scenario')).toBeVisible();
  await expect(page.locator('#urine')).toHaveText('1.65');
  await expect(page.locator('#app')).toBeVisible();
  await context.close();
});

test('production build loads from a nested website path', async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/school/nephron/**',async route=>{
    const relative=new URL(route.request().url()).pathname.replace('/school/nephron/','')||'index.html';
    if(relative.includes('..'))return route.abort();
    const type=relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':'text/html';
    try{await route.fulfill({body:await readFile(new URL(`../dist/${relative}`,import.meta.url)),contentType:type});}catch{await route.fulfill({status:404,body:'Not found'});}
  });
  await page.goto('/school/nephron/');
  await expect(page.locator('#diagram svg')).toBeVisible();
  await page.selectOption('#scenario','hydrated');
  await expect(page.locator('#scenario-note')).toContainText('물을 충분히');
  expect(errors).toEqual([]);
});

test('startup error still leaves a readable nephron picture',async({page})=>{
  await page.evaluate(()=>{
    SVGPathElement.prototype.getTotalLength=function(){throw new Error('Simulated SVG initialization failure');};
  });
  await page.setContent(await readFile(new URL('../index.html',import.meta.url),'utf8'));
  await expect(page.locator('#boot-fallback')).toBeVisible();
  await expect(page.locator('#boot-fallback svg')).toBeVisible();
  await expect(page.locator('#startup-status')).toContainText('네프론 그림을 표시');
  await expect(page.locator('#boot-fallback table')).toContainText('포도당 · 아미노산');
});
