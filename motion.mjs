// Optical flow only. These distances never enter race physics, warnings or scoring.
const NS='http://www.w3.org/2000/svg';
export const FLOW={road:4,roadside:6,waves:4.5};
export function projectFlow(gap){return 88+622*Math.exp(-gap/90);}
export function widthAt(y){return 158+(y-86)/594*458;}
export function flowSlots(distance,multiplier,spacing,count,offset=0){const travel=distance*multiplier+offset,base=Math.floor(travel/spacing);return Array.from({length:count},(_,i)=>{const id=base+i,gap=id*spacing-travel,y=projectFlow(gap);return{id,gap,y,scale:Math.max(.12,(y-70)/455),visible:y>=100&&y<=785};});}
function element(tag,attrs={},parent){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));parent?.append(e);return e;}
const shapes=[
 '<ellipse cy="11" rx="30" ry="9" fill="#526f5630"/><path d="M0 11Q13-19 7-58" stroke="#9a8157" stroke-width="9" fill="none"/><path d="M7-54Q-35-82-45-43Q-15-53 7-54Q35-94 57-55Q30-65 7-54Q-5-101-31-82Q-14-67 7-54Q39-45 44-19Q22-36 7-54" fill="#628b6d"/><path d="M8-54Q0-86 18-100Q29-72 8-54" fill="#83a57d"/>',
 '<ellipse cy="9" rx="29" ry="9" fill="#707d5426"/><path d="M-28 8Q-29-13-15-23Q-8-38 4-24Q24-30 29-10L25 10Z" fill="#a2a88a"/><path d="M-16-20L-7 5 24 1M4-23L13-7" fill="none" stroke="#7e8d73" stroke-width="3"/>',
 '<ellipse cy="10" rx="34" ry="9" fill="#526f5624"/><path d="M-32 5Q-42-19-19-25Q-9-42 7-30Q31-36 35-12Q47 12 14 15L-20 14Z" fill="#82a17a"/><path d="M-13 7Q-24-11-12-23M8 8Q21-8 11-25" stroke="#6d906d" stroke-width="3" fill="none"/>',
 '<ellipse cy="10" rx="22" ry="7" fill="#526f5624"/><path d="M-7 9V-58H7V9Z" fill="#c6c5a0" stroke="#9ba688" stroke-width="2"/><path d="M-6-48H6V-28H-6Z" fill="#efe2ad"/><path d="M-6-25H6V-13H-6Z" fill="#5b826e"/>',
 '<ellipse cy="10" rx="36" ry="9" fill="#526f5624"/><path d="M-26 9L-19-29H19L26 9Z" fill="#b99567"/><path d="M-38-27L0-57 38-27Z" fill="#9a805b"/><path d="M-10 9V-14H10V9" fill="#567b6c"/><path d="M-25-25H25" stroke="#e2cf9b" stroke-width="4"/>'
];
export function createMotion(roadLayer,sceneryLayer,streakLayer){
 roadLayer.textContent='';sceneryLayer.textContent='';streakLayer.textContent='';
 const marks=Array.from({length:17},()=>[-1,1].map(()=>element('path',{fill:'#eeeccf','fill-opacity':'.9'},roadLayer)));
 const waves=Array.from({length:9},()=>element('path',{d:'M-52 0Q-22-11 5-2T61 1',fill:'none',stroke:'#d5e8ce','stroke-width':3,'stroke-opacity':'.3'},sceneryLayer));
 const landmarks=Array.from({length:12},()=>{const trail=element('path',{fill:'none',stroke:'#709270','stroke-linecap':'round'},sceneryLayer),g=element('g',{},sceneryLayer);return{trail,g,id:-1};});
 const posts=Array.from({length:11},()=>[-1,1].map(()=>element('path',{fill:'#d9d8b2',stroke:'#8f9f80','stroke-width':1},sceneryLayer)));
 const streaks=Array.from({length:16},()=>element('path',{fill:'none',stroke:'#f6ecc9','stroke-linecap':'round'},streakLayer));
 function draw(distance,speed){
  const road=flowSlots(distance,FLOW.road,38,marks.length);
  road.forEach((p,i)=>{const far=projectFlow(p.gap+14),width=Math.max(1.2,(p.y-70)/100);for(let j=0;j<2;j++){const e=marks[i][j],side=j?1:-1;e.style.display=p.visible?'':'none';if(!p.visible)continue;const x1=360+side*widthAt(p.y)/6,x2=360+side*widthAt(far)/6;e.setAttribute('d',`M${x1-width} ${p.y}H${x1+width}L${x2+width*.6} ${far}H${x2-width*.6}Z`);e.setAttribute('opacity',Math.min(1,(p.y-95)/65));}});
  flowSlots(distance,FLOW.waves,78,waves.length,26).forEach((p,i)=>{const e=waves[i];e.style.display=p.visible?'':'none';if(!p.visible)return;const x=360-widthAt(p.y)/2-65*p.scale-15;e.setAttribute('transform',`translate(${x} ${p.y}) scale(${p.scale*1.15}) rotate(-14)`);});
  flowSlots(distance,FLOW.roadside,68,landmarks.length).forEach((p,i)=>{const e=landmarks[i];e.g.style.display=e.trail.style.display=p.visible?'':'none';if(!p.visible)return;const side=p.id%3===0?-1:1,kind=((p.id%5)+5)%5,scale=p.scale*1.3,x=360+side*(widthAt(p.y)/2+30*scale);if(e.id!==p.id){e.id=p.id;e.g.innerHTML=shapes[kind];}e.g.setAttribute('transform',`translate(${x.toFixed(2)} ${p.y.toFixed(2)}) scale(${scale.toFixed(3)})`);const length=(20+scale*75)*Math.min(1,speed/220),dx=x-360,dy=p.y-88,norm=Math.hypot(dx,dy)||1;e.trail.setAttribute('d',`M${x-dx/norm*length} ${p.y-dy/norm*length}L${x} ${p.y}`);e.trail.setAttribute('stroke-width',Math.max(2,scale*10));e.trail.setAttribute('opacity',speed>0?Math.min(.18,(p.y-100)/1000):0);});
  flowSlots(distance,FLOW.roadside,56,posts.length,22).forEach((p,i)=>{for(let j=0;j<2;j++){const e=posts[i][j];e.style.display=p.visible?'':'none';if(!p.visible)continue;const side=j?1:-1,x=360+side*(widthAt(p.y)/2+6*p.scale),w=4*p.scale,h=21*p.scale;e.setAttribute('d',`M${x-w} ${p.y}v${-h}h${w*2}v${h}Z`);e.setAttribute('opacity',Math.min(.85,(p.y-95)/120));}});
  const strength=Math.min(.38,Math.max(0,speed/900));flowSlots(distance,FLOW.roadside,45,streaks.length,12).forEach((p,i)=>{const e=streaks[i];e.style.display=p.visible&&speed>0?'':'none';if(!p.visible||speed<=0)return;const side=i%2?1:-1,x=360+side*(widthAt(p.y)/2+12),dx=x-360,dy=p.y-88,norm=Math.hypot(dx,dy)||1,length=35+p.scale*90;e.setAttribute('d',`M${x-dx/norm*length} ${p.y-dy/norm*length}L${x} ${p.y}`);e.setAttribute('stroke-width',Math.max(1.2,p.scale*2));e.setAttribute('opacity',strength*Math.min(1,(p.y-110)/150));});
 }
 return{draw};
}
