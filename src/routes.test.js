import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJourney } from './routes.js';

const ids=['inlet','retainedBlood','bloodToSecretion','filter','earlyTubule','reabsorb','venousReturn','secrete','lateTubule','urine'];
const paths=Object.fromEntries(ids.map((id,index)=>[id,{length:10+index,at:t=>({id,t})}]));
function trace(species){
 const journey=createJourney(species,paths);
 const samples=Array.from({length:Math.ceil(journey.length*2)},(_,i)=>journey.sample(i/2));
 for(const s of samples)assert.ok(s.point.t>=0&&s.point.t<1);
 return [...new Set(samples.map(s=>s.region))];
}
test('all urea exits through secretion and urine, with no route to the renal vein',()=>{
 assert.deepEqual(trace('urea'),['inlet','bloodToSecretion','secrete','lateTubule','urine']);
});
test('every glucose and amino acid route must filter and reabsorb before venous return',()=>{
 for(const species of ['glucose','amino'])assert.deepEqual(trace(species),['inlet','filter','earlyTubule','reabsorb','venousReturn']);
});
test('blood cells and protein never enter filtration or urine',()=>{
 for(const species of ['blood','protein'])assert.deepEqual(trace(species),['inlet','retainedBlood']);
});
test('a complete cycle restarts at the artery without a phantom terminal segment',()=>{
 const journey=createJourney('urea',paths);
 assert.equal(journey.sample(journey.length).region,'inlet');
 assert.equal(journey.sample(-.1).region,'urine');
});
