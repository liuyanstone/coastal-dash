export const HZ=120,DT=1/HZ,DURATION=90,MAX_TICKS=DURATION*HZ;
export const LEVELS=[{key:'race',start:220,max:360,accel:70,lead:1.2,gap:2.15}];
export const TYPES=['gravel','cones','weed','traffic'];
export function localDay(date=new Date()){return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function hash(t){let h=2166136261;for(const c of t){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function makeCourse(day,level,run=1){
 const c=LEVELS[level];if(!c)throw Error('Invalid difficulty');
 const random=rng(hash(day+':'+level+':'+run)),events=[],order=[...TYPES];
 let previousSafe=1,distance=c.max/3.6*(c.lead+.8);
 for(let id=0;id<48;id++){
  if(id%4===0)for(let j=3;j>0;j--){const k=Math.floor(random()*(j+1));[order[j],order[k]]=[order[k],order[j]];}
  const type=order[id%4],moving=['weed','traffic'].includes(type)&&random()<.8;
  const safeOptions=(moving?[0,2]:[0,1,2]).filter(l=>l!==previousSafe),safe=safeOptions[Math.floor(random()*safeOptions.length)];previousSafe=safe;
  const choices=[0,1,2].filter(l=>l!==safe),blocked=moving||id%7!==6?choices:[choices[Math.floor(random()*2)]];
  const movement=moving?(random()<.5?{from:choices[0],to:choices[1]}:{from:choices[1],to:choices[0]}):null;
  const warnDistance=c.max/3.6*(c.lead-Math.min(.45,id*.02));
  events.push({id,distance,warnDistance,safe,blocked,type,movement,hit:false,passed:false});
  distance+=c.max/3.6*(c.gap+random()*.25);
 }
 return events;
}
// Share exact positions between drawing and collision detection. The warning marks
// the entire swept pair; the third lane remains clear throughout the maneuver.
export function movementProgress(e,distance){return Math.max(0,Math.min(1,((distance-e.distance+e.warnDistance)/e.warnDistance-.12)/.78));}
export function hazardLanes(e,distance){if(!e.movement)return e.blocked;const {from,to}=e.movement,p=movementProgress(e,distance),smooth=p*p*(3-2*p);return[from+(to-from)*smooth];}
export function newRace(day,level,run=1){const c=LEVELS[level];if(!c)throw Error('Invalid difficulty');return{mode:3,day,level,run,phase:'ready',ticks:0,carry:0,distance:0,speed:c.start,lane:1,target:1,hold:0,recovery:0,collisions:0,avoided:0,lastHit:null,events:makeCourse(day,level,run)};}
export function start(s){return s.phase==='ready'?{...s,phase:'playing'}:s;}
export function pause(s){return s.phase==='playing'?{...s,phase:'paused'}:s;}
export function resume(s){return s.phase==='paused'?{...s,phase:'playing'}:s;}
export function steer(s,direction){if(s.phase!=='playing'||![1,-1].includes(direction))return s;const target=Math.max(0,Math.min(2,s.target+direction));return target===s.target?s:{...s,target};}
export function elapsed(s){return s.ticks/HZ;}
export function average(s){return s.ticks>0?s.distance*3.6/elapsed(s):0;}
export function score(s){return Math.round(average(s)*100)*10;}
export function warning(s){return s.events.find(e=>!e.passed&&s.distance>=e.distance-e.warnDistance&&s.distance<e.distance)||null;}
export function eta(s,event){return event&&s.speed>1?Math.max(0,(event.distance-s.distance)/(s.speed/3.6)):null;}
export function impact(speed,type){if(type==='gravel')return{speed:Math.min(55,speed),hold:0};if(type==='cones')return{speed:speed*.6,hold:0};if(type==='weed')return{speed:0,hold:.8};if(type==='traffic')return{speed:0,hold:1.6};throw Error('Invalid obstacle');}
function intersects(s,e){return hazardLanes(e,s.distance).some(l=>Math.abs(s.lane-l)<.63);}
export function advance(s,ms){if(s.phase!=='playing'||!Number.isFinite(ms)||ms<0)return s;const next={...s,events:s.events.map(e=>({...e})),carry:s.carry+ms};let steps=Math.min(MAX_TICKS-s.ticks,Math.floor((next.carry+1e-7)/(1000/HZ)));next.carry-=steps*1000/HZ;const c=LEVELS[next.level];while(steps-->0){next.lane+=Math.sign(next.target-next.lane)*Math.min(Math.abs(next.target-next.lane),5.5*DT);next.hold=Math.max(0,next.hold-DT);next.recovery=Math.max(0,next.recovery-DT);const onGravel=next.events.some(e=>e.type==='gravel'&&next.distance>=e.distance&&next.distance<=e.distance+24&&intersects(next,e));const prior=next.speed;next.speed=next.hold>0?0:Math.min(c.max,next.speed+c.accel*(next.recovery>0?.65:1)*DT);if(onGravel)next.speed=Math.min(55,next.speed);const previousDistance=next.distance;next.distance+=(prior+next.speed)/2/3.6*DT;next.ticks++;
for(const e of next.events){if(e.passed)continue;const end=e.distance+(e.type==='gravel'?24:4);if(!e.hit&&next.distance>=e.distance&&previousDistance<=end&&intersects(next,e)){const hit=impact(next.speed,e.type);next.speed=hit.speed;next.hold=hit.hold;next.recovery=3;next.collisions++;next.lastHit={type:e.type,tick:next.ticks,id:e.id};e.hit=true;}if(next.distance>end){e.passed=true;if(!e.hit)next.avoided++;}}
if(next.ticks===MAX_TICKS){next.phase='finished';next.carry=0;break;}}
return next;}
export function restoreRace(raw,day){if(!raw||raw.mode!==3||raw.day!==day||!Number.isInteger(raw.level)||!LEVELS[raw.level]||!Number.isSafeInteger(raw.run)||raw.run<1)return null;const fresh=newRace(day,raw.level,raw.run),c=LEVELS[raw.level];if(!['ready','playing','paused','finished'].includes(raw.phase)||!Number.isInteger(raw.ticks)||raw.ticks<0||raw.ticks>MAX_TICKS||![raw.distance,raw.speed,raw.lane,raw.hold,raw.recovery].every(Number.isFinite)||raw.distance<0||raw.distance>c.max/3.6*raw.ticks/HZ+.01||raw.speed<0||raw.speed>c.max||raw.lane<0||raw.lane>2||!Number.isInteger(raw.target)||raw.target<0||raw.target>2||(raw.phase==='finished')!==(raw.ticks===MAX_TICKS)||(raw.phase==='ready'&&raw.ticks!==0))return null;
const saved=Array.isArray(raw.events)?raw.events:[],events=fresh.events.map(e=>({...e,hit:!!saved.find(v=>v.id===e.id)?.hit,passed:raw.distance>e.distance+(e.type==='gravel'?24:4)}));const collisions=events.filter(e=>e.hit).length,avoided=events.filter(e=>e.passed&&!e.hit).length;return{...fresh,phase:raw.phase,ticks:raw.ticks,carry:Number.isFinite(raw.carry)?Math.max(0,Math.min(1000/HZ,raw.carry)):0,distance:raw.distance,speed:raw.speed,lane:raw.lane,target:raw.target,hold:Math.max(0,Math.min(1.6,raw.hold)),recovery:Math.max(0,Math.min(3,raw.recovery)),collisions,avoided,lastHit:raw.lastHit&&TYPES.includes(raw.lastHit.type)&&Number.isInteger(raw.lastHit.tick)&&raw.lastHit.tick<=raw.ticks?raw.lastHit:null,events};}
