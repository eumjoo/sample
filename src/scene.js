import * as THREE from 'three';
import { createJourney, routes } from './routes.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(canvas, onError = () => {}) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor(0x000000,0);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(36,1,0.1,100);camera.position.set(0,0.8,15);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=9;controls.maxDistance=23;controls.target.set(0,-0.1,0);controls.enablePan=false;controls.autoRotateSpeed=1;
 scene.add(new THREE.AmbientLight(0xc7e2f2,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-3,6,8);scene.add(light);const rim=new THREE.PointLight(0x63d6c5,35);rim.position.set(3,0,3);scene.add(rim);
 const model=new THREE.Group();scene.add(model);model.rotation.y=-0.15;
 const path=(points)=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 const makeTube=(curve,radius,color,opacity=1)=>{const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,160,radius,12,false),new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity,roughness:.36,metalness:.15}));model.add(mesh);return mesh;};
 const tubule=path([[-2.55,1.5,0],[-2.15,1.6,.1],[-1.8,2.2,.1],[-1.2,2.35,0],[-.8,1.85,.3],[-1.25,1.5,.4],[-1.65,1.85,.2],[-1.1,2.65,-.1],[-.5,2.4,0],[-.25,1.7,0],[-.8,1.1,0],[-.9,-.3,0],[-.85,-2.2,0],[-.55,-2.85,0],[.05,-2.8,0],[.3,-2.25,0],[.3,-.7,0],[.3,.8,0],[.75,1.65,0],[1.35,2.1,0],[1.8,1.7,.1],[1.3,1.3,.3],[.9,1.8,.5],[1.45,2.55,.2],[2,2.15,0],[2.15,1.35,0],[2.65,1.1,0]]);
 makeTube(tubule,.16,0xe8bc76);makeTube(tubule,.21,0xe8bc76,.10);
 const duct=path([[2.65,2.7,0],[2.65,1.3,0],[2.65,-.3,0],[2.65,-2,0],[2.65,-3.1,0]]);makeTube(duct,.24,0xc8ae7e);makeTube(duct,.30,0xe8bc76,.1);
 const artery=path([[-4.1,2.7,0],[-3.55,2.7,0],[-3.1,2.2,.1],[-2.9,1.9,.1]]);makeTube(artery,.13,0xd97e88);
 const capillary=path([[-2.7,2.2,0],[-2.3,2.85,-.5],[-1.5,3,-.55],[-.5,2.9,-.55],[.6,2.85,-.6],[1.4,2.8,-.65],[2.3,2.4,-.6],[2.1,1,-.55],[1.25,.6,-.5],[.9,-.8,-.5],[.85,-2.6,-.5],[.3,-3.2,-.5],[-.5,-3.35,-.5],[-1.35,-2.7,-.5],[-1.4,-.8,-.5],[-1.7,.65,-.5],[-2.5,.8,-.5],[-3.5,1.3,-.4],[-4.1,1.3,-.4]]);makeTube(capillary,.065,0x7ca7b9,.7);
 const capsule=new THREE.Mesh(new THREE.SphereGeometry(.72,40,32),new THREE.MeshPhysicalMaterial({color:0x87dbd0,transparent:true,opacity:.12,roughness:.18,side:THREE.DoubleSide,depthWrite:false}));capsule.position.set(-2.8,1.65,0);model.add(capsule);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.68,.025,12,70),new THREE.MeshStandardMaterial({color:0x69d7c2,transparent:true,opacity:.65}));ring.position.copy(capsule.position);model.add(ring);
 for(let i=0;i<7;i++) {const pts=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;pts.push([-2.8+Math.cos(a)*(.34+Math.sin(i*2)*.07),1.65+Math.sin(a)*.38,Math.sin(a*2+i)*.2+(i-3)*.055]);}makeTube(path(pts),.065, i%2?0xe6979e:0xc97283);}
 // Directional paths: glomerulus → capsule, tubule → blood, blood → tubule.
 const flows=[
  path([[-2.9,1.8,.3],[-2.6,1.5,.65],[-2.1,1.55,.5],[-1.8,2.1,.25]]),
  path([[-1.2,1.7,.35],[-1.7,1.25,.55],[-2.2,.85,-.3]]),
  path([[.9,-.8,-.5],[.65,-.9,.3],[.3,-1,0]])
 ];
 const waterFlow=path([[2.65,-1,.2],[2.15,-1.1,.65],[1.4,-1.2,.2],[.9,-1.3,-.4]]);
 const colors=[0x64d9c0,0xf0bc72,0xb39aef];
 const particles=[];const geometry=new THREE.SphereGeometry(.055,10,8);
 const speciesColors={blood:0xf28d9d,protein:0xbb9aff,urea:0xf2c46e,water:0x6cdbf2,glucose:0x94e3a4,amino:0xf5ac78};
 function addParticles(curve,n,species,stage=-1,start=0,end=1){for(let i=0;i<n;i++){const m=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:speciesColors[species],depthTest:false}));m.renderOrder=3;model.add(m);particles.push({mesh:m,curve,t:(i/n+Object.keys(speciesColors).indexOf(species)*.071)%1,index:i,stage,species,start,end});}}
 const section=(curve,start,end,prefix=[],suffix=[])=>path([...prefix,...Array.from({length:65},(_,i)=>curve.getPoint(start+(end-start)*i/64).toArray()),...suffix]);
 const journeyCurves={
  inlet:artery,
  retainedBlood:section(capillary,0,1,[artery.getPoint(1).toArray()]),
  bloodToSecretion:section(capillary,0,.5,[artery.getPoint(1).toArray()],[flows[2].getPoint(0).toArray()]),
  filter:section(flows[0],0,1,[artery.getPoint(1).toArray()]),
  earlyTubule:section(tubule,0,.2,[flows[0].getPoint(1).toArray()],[flows[1].getPoint(0).toArray()]),
  reabsorb:flows[1],
  venousReturn:section(capillary,.85,1,[flows[1].getPoint(1).toArray()]),
  secrete:flows[2],
  lateTubule:section(tubule,.60,1,[flows[2].getPoint(1).toArray()]),
  urine:section(duct,.28,1,[tubule.getPoint(1).toArray()]),
 };
 const journeyPaths=Object.fromEntries(Object.entries(journeyCurves).map(([id,curve])=>[id,{length:curve.getLength(),at:t=>curve.getPointAt(t)}]));
 for(const species of Object.keys(routes)) {
  const journey=createJourney(species,journeyPaths);
  for(let i=0;i<14;i++) {
   const m=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:speciesColors[species],depthTest:false}));m.renderOrder=3;model.add(m);
   particles.push({mesh:m,journey,t:(i/14+Object.keys(speciesColors).indexOf(species)*.071)%1,stage:-1,species});
  }
 }
 addParticles(artery,4,'water');addParticles(capillary,9,'water');addParticles(flows[0],5,'water',0);
 addParticles(tubule,24,'water');addParticles(duct,10,'water');addParticles(flows[1],6,'water',1);addParticles(waterFlow,12,'water',3);
 const arrows=[];flows.forEach((c,i)=>{const pos=c.getPoint(.62),dir=c.getTangent(.62);const a=new THREE.ArrowHelper(dir,pos,.32,colors[i],.14,.12);model.add(a);arrows.push(a);});
 let state={stage:0,playing:true,speed:.5,adh:45,gfr:125,substance:'all'};
 const resize=()=>{const {width,height}=canvas.getBoundingClientRect();renderer.setSize(Math.max(width,1),Math.max(height,1),false);camera.aspect=Math.max(width,1)/Math.max(height,1);camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 let last=performance.now(), disposed=false;
 const fail=()=>{if(disposed)return;renderer.setAnimationLoop(null);queueMicrotask(onError);};
 const contextLost=event=>{event.preventDefault();fail();};
 canvas.addEventListener('webglcontextlost',contextLost);
 const dispose=()=>{if(disposed)return;disposed=true;renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();canvas.removeEventListener('webglcontextlost',contextLost);model.traverse(object=>{object.geometry?.dispose();if(object.material){for(const material of [object.material].flat())material.dispose();}});renderer.dispose();};

 renderer.setAnimationLoop((timestamp)=>{try {const now=Number.isFinite(timestamp)?timestamp:performance.now();const delta=Math.max(0,Math.min((now-last)/1000,.05));last=now;controls.update();for(const p of particles){p.mesh.visible=(state.substance==='all'||p.species===state.substance)&&(p.stage<0||p.stage===state.stage||(p.stage===3&&state.stage===1));if(p.species==='water'&&p.curve===duct)p.mesh.visible=p.mesh.visible&&p.index<Math.round(3+(100-state.adh)*.07);if(p.stage===3)p.mesh.visible=p.mesh.visible&&p.index<Math.round(3+state.adh*.09);if(state.playing)p.t=(p.t+delta*.3/(p.journey?.length??p.curve.getLength())*state.speed*(p.journey?1:p.stage===3?.3+state.adh/100:state.gfr/125))%1;const sample=p.journey?.sample(p.t*p.journey.length);p.mesh.position.copy(sample?sample.point:p.curve.getPoint(p.start+p.t*(p.end-p.start)));if(sample)p.mesh.userData.region=sample.region;p.mesh.scale.setScalar(p.species==='blood'?1.6:p.species==='protein'?1.3:p.stage>=0?1.2:.85); }arrows.forEach((a,i)=>a.visible=i===state.stage);renderer.render(scene,camera);}catch(error){fail();}});
 return {dispose,setState(v){state=v;},rotate(on){controls.autoRotate=on;},reset(){controls.autoRotate=false;camera.position.set(0,.8,15);controls.target.set(0,-.1,0);controls.update();},view(type){camera.position.set(type==='front'?0:5,type==='front'?.1:2,15);controls.update();}};
}
