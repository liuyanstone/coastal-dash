import assert from 'node:assert/strict';
import {flowSlots,projectFlow,FLOW} from './motion.mjs';
// At the existing 360 km/h, a landmark now crosses the visible view in under 0.4s.
const startGap=90*Math.log(622/(100-88)),exitGap=90*Math.log(622/(680-88));
assert((startGap-exitGap)/(100*FLOW.roadside)<.4);
assert((startGap-exitGap)/(100*FLOW.road)<.65);
assert(projectFlow(50)>projectFlow(150),'Approaching scenery grows toward the bottom edge');
const a=flowSlots(0,FLOW.roadside,68,12),b=flowSlots(8,FLOW.roadside,68,12);let tracked=0,growing=0;
for(const previous of a){const current=b.find(v=>v.id===previous.id);if(current&&previous.visible&&current.visible){assert(current.y>previous.y);assert(current.scale>=previous.scale);if(current.scale>previous.scale)growing++;tracked++;}}
assert(tracked>1&&growing>0);assert.deepEqual(flowSlots(123,FLOW.roadside,68,12),flowSlots(123,FLOW.roadside,68,12),'Same distance produces a frozen view when paused or stopped');
for(let distance=0;distance<2000;distance+=13.7)for(const [factor,spacing,count]of [[FLOW.road,38,17],[FLOW.roadside,68,12],[FLOW.waves,78,9]]){const slots=flowSlots(distance,factor,spacing,count);assert.equal(new Set(slots.map(v=>v.id)).size,count);assert(slots.every(v=>Number.isFinite(v.y)&&Number.isFinite(v.scale)));assert(slots.some(v=>v.visible));}
console.log('PASS: roadside crosses the visible scene in <0.4s; road markings in <0.65s; continuous world positions; growing foreground perspective; stopped/paused frames stay frozen; stable finite scene pools.');
