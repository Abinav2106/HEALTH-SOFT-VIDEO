// Tilo rig specification: one source of truth for the After Effects builder (make_jsx.mjs) and the
// preview renderer (preview.mjs). Geometry comes from build/rig_parts.json (parts.py).
// Every expression string below is exactly what the JSX writes into After Effects.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BUILD = path.resolve(HERE, '../build');

const f = (n) => Number(n.toFixed(3));
const P = (p) => `[${f(p[0])},${f(p[1])}]`;

// Stacking order, front -> back. Kept identical to tools/stack.py.
export const ORDER = [
  'CTRL_Tilo', 'Tilo_Root', 'Flight', 'Dog_Root', 'Dog_Chest',
  'Propeller', 'Propeller_Blur',
  'Paw_Near', 'Arm_Near_Fore', 'Arm_Near_Upper',
  'Goggles', 'Eyelid_Upper', 'Eyelid_Lower', 'Pupil', 'Eye_White', 'Face', 'Ear_Near', 'Head', 'Ear_Far',
  'Wing', 'Stabilizer', 'Plane_Body',
  'Dog_Body', 'Tail',
  'Paw_Far', 'Arm_Far_Fore', 'Arm_Far_Upper',
  'Cockpit',
  'Airflow_01', 'Airflow_02', 'Airflow_03', 'Airflow_04', 'Airflow_05', 'Airflow_06', 'Airflow_07',
];

// ---------------------------------------------------------------------------------------------
// Controls (all on the CTRL_Tilo null). Defaults reproduce the logo pose exactly.
// ---------------------------------------------------------------------------------------------
export const CONTROLS = [
  {name: 'Blink', type: 'slider', def: 0, min: 0, max: 100, help: '0 open, 100 closed. Keyframe for blinks.'},
  {name: 'Auto Blink', type: 'checkbox', def: 0, help: 'Adds a blink every "Blink Interval" seconds.'},
  {name: 'Blink Interval', type: 'slider', def: 3.2, min: 0.8, max: 10, help: 'Seconds between automatic blinks.'},
  {name: 'Upper Lid Rest', type: 'slider', def: 0, min: 0, max: 70, help: 'Resting droop of the upper lid (sleepy / sceptical).'},
  {name: 'Pupil X', type: 'slider', def: 0, min: -100, max: 100, help: '-100 looks back, +100 looks forward. Clamped inside the lens.'},
  {name: 'Pupil Y', type: 'slider', def: 0, min: -100, max: 100, help: '-100 up, +100 down. Clamped inside the lens.'},
  {name: 'Head Tilt', type: 'angle', def: 0, help: 'Degrees. Neck bends to follow; ears overlap.'},
  {name: 'Head Counter', type: 'slider', def: 60, min: 0, max: 100, help: '% of body lean the head cancels (keeps eyes level).'},
  {name: 'Ear Follow Through', type: 'slider', def: 100, min: 0, max: 200, help: 'How much the ears drag behind head and body motion.'},
  {name: 'Ear Lag', type: 'slider', def: 3, min: 0, max: 12, help: 'Frames the ears trail the head.'},
  {name: 'Ear Lift', type: 'angle', def: 0, help: 'Manual ear angle (+ lifts the tips).'},
  {name: 'Ear Flutter', type: 'slider', def: 0, min: 0, max: 100, help: 'Wind flutter; scales with Flight Speed.'},
  {name: 'Point', type: 'slider', def: 0, min: 0, max: 100, help: 'Far foreleg: 0 resting on the nose, 100 pointing ahead.'},
  {name: 'Point Angle', type: 'angle', def: 0, help: 'Aim of the point, degrees above the default 25.'},
  {name: 'Near Paw Lift', type: 'slider', def: 0, min: 0, max: 100, help: 'Near foreleg lifts its paw off the rim (tap, wave).'},
  {name: 'Far Paw Curl', type: 'angle', def: 0, help: 'Bends the far paw at the wrist.'},
  {name: 'Tail Wag', type: 'slider', def: 0, min: 0, max: 45, help: 'Wag amplitude in degrees (wave runs root to tip).'},
  {name: 'Tail Wag Speed', type: 'slider', def: 2.2, min: 0, max: 6, help: 'Wags per second.'},
  {name: 'Tail Curl', type: 'angle', def: 0, help: 'Static curl of the whole tail.'},
  {name: 'Body Balance', type: 'angle', def: 0, help: 'Dog leans about its seat. Head counters by "Head Counter".'},
  {name: 'Flight Bank', type: 'angle', def: 0, help: 'Roll: plane tilts, near wing and tailplane foreshorten, dog leans in with lag.'},
  {name: 'Flight Speed', type: 'slider', def: 50, min: 0, max: 100, help: 'Airflow length, spacing and opacity; drives flutter and bob strength. 50 = logo.'},
  {name: 'Propeller Speed', type: 'slider', def: 0, min: 0, max: 100, help: 'Blade compression cycle, motion blur and blur disc. 0 = logo.'},
  {name: 'Bob Amount', type: 'slider', def: 0, min: 0, max: 100, help: 'Flight bob (vertical float and pitch).'},
  {name: 'Airflow Travel', type: 'checkbox', def: 0, help: 'Airflow strokes stream backwards instead of holding position.'},
];

// Shared expression prelude: control access by display name, first property by index (locale-safe).
const PRE = `var C=thisComp.layer("CTRL_Tilo");function k(n){return C.effect(n)(1).value;}function kt(n,t){return C.effect(n)(1).valueAtTime(t);}`;

export function loadParts() {
  return JSON.parse(fs.readFileSync(path.join(BUILD, 'rig_parts.json'), 'utf8'));
}

// FK bend deformer for a path: joints J (rest), per-joint bend angles from expression code `angles`
// (must define array A, degrees, A[0] = root). Vertices project onto the rest skeleton and ride the
// bent one; rotation blends across each joint so the outline never cracks.
function bendExpr(J, angles) {
  return `${PRE}
var J=${JSON.stringify(J.map((p) => [f(p[0]), f(p[1])]))};
${angles}
function rot(v,a){var c=Math.cos(a),s=Math.sin(a);return [v[0]*c-v[1]*s,v[0]*s+v[1]*c];}
var n=J.length,cum=[],Jd=[J[0]],acc=0,i;
for(i=0;i<n-1;i++){acc+=A[i]*Math.PI/180;cum.push(acc);var r=rot([J[i+1][0]-J[i][0],J[i+1][1]-J[i][1]],acc);Jd.push([Jd[i][0]+r[0],Jd[i][1]+r[1]]);}
function deform(p){
var best=1e12,bi=0,bt=0,j;
for(j=0;j<n-1;j++){var ax=J[j][0],ay=J[j][1],dx=J[j+1][0]-ax,dy=J[j+1][1]-ay,L2=dx*dx+dy*dy;var t=((p[0]-ax)*dx+(p[1]-ay)*dy)/L2;var tc=Math.max(0,Math.min(1,t));var qx=ax+tc*dx-p[0],qy=ay+tc*dy-p[1];var d=qx*qx+qy*qy;if(d<best){best=d;bi=j;bt=t;}}
var t=bt;if(bi>0&&t<0)t=0;if(bi<n-2&&t>1)t=1;
var ax=J[bi][0],ay=J[bi][1],dx=J[bi+1][0]-ax,dy=J[bi+1][1]-ay;
var o=[p[0]-(ax+t*dx),p[1]-(ay+t*dy)];
var ang=cum[bi],B=0.35,u;
if(t<B&&bi>0){u=0.5+0.5*Math.max(t,0)/B;ang=cum[bi-1]*(1-u)+cum[bi]*u;}
else if(t>1-B&&bi<n-2){u=0.5*(Math.min(t,1)-(1-B))/B;ang=cum[bi]*(1-u)+cum[bi+1]*u;}
var sd=rot([t*dx,t*dy],cum[bi]),ro=rot(o,ang);
return [Jd[bi][0]+sd[0]+ro[0],Jd[bi][1]+sd[1]+ro[1]];}
var pts=thisProperty.points(),out=[];
for(i=0;i<pts.length;i++)out.push(deform(pts[i]));
createPath(out,thisProperty.inTangents(),thisProperty.outTangents(),thisProperty.isClosed());`;
}

// Skinned joint blend for cutout limb pieces. Each limb segment is its own layer in an FK chain;
// near a joint, the parent's distal vertices turn forward by half the child's rotation and the
// child's proximal vertices turn back by half, so both meet on the bisector: the elbow bends with
// continuous outlines and no gap, while each piece stays a separate, editable layer.
function skinExpr({distal, proximal, d}) {
  const parts = [`var pts=thisProperty.points(),out=[],i;function sm(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}function rot(p,c,a){var cs=Math.cos(a),sn=Math.sin(a),x=p[0]-c[0],y=p[1]-c[1];return [c[0]+x*cs-y*sn,c[1]+x*sn+y*cs];}`];
  if (distal) parts.push(`var Jd=${P(distal.joint)},ud=${P(distal.normal)},aD=thisComp.layer("${distal.child}").transform.rotation.value*Math.PI/180;`);
  if (proximal) parts.push(`var Jp=${P(proximal.joint)},up=${P(proximal.normal)},aP=thisComp.layer("${proximal.self}").transform.rotation.value*Math.PI/180;`);
  parts.push(`var D=${f(d)};for(i=0;i<pts.length;i++){var q=pts[i];`);
  if (distal) parts.push(`var sd=(q[0]-Jd[0])*ud[0]+(q[1]-Jd[1])*ud[1];var wd=sm((sd+D)/D);if(wd>0)q=rot(q,Jd,wd*aD/2);`);
  if (proximal) parts.push(`var sp=(pts[i][0]-Jp[0])*up[0]+(pts[i][1]-Jp[1])*up[1];var wp=1-sm(sp/D);if(wp>0)q=rot(q,Jp,-wp*aP/2);`);
  parts.push(`out.push(q);}createPath(out,thisProperty.inTangents(),thisProperty.outTangents(),thisProperty.isClosed());`);
  return parts.join('');
}
const unit = (a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
};

export function buildSpec(parts = loadParts()) {
  const L = parts.layers;
  const pv = (n) => L[n].pivot;
  const J = parts.joints;
  const eyeC = pv('Eye_White');
  const [ex0, ey0, ex1, ey1] = parts.eye_bounds;
  const eyeR = [(ex1 - ex0) / 2, (ey1 - ey0) / 2];
  // pupil rest centre / radius from its geometry
  const pr = L.Pupil.groups[0].rings[0];
  const pxs = pr.map((p) => p[0]), pys = pr.map((p) => p[1]);
  const pupilC = [(Math.min(...pxs) + Math.max(...pxs)) / 2, (Math.min(...pys) + Math.max(...pys)) / 2];
  const pupilR = (Math.max(...pxs) - Math.min(...pxs)) / 2;
  const travel = [eyeR[0] - pupilR - 3, eyeR[1] - pupilR - 3];

  const deg = (a) => (a * 180) / Math.PI;
  const ang = (a, b) => deg(Math.atan2(b[1] - a[1], b[0] - a[0]));
  const shoulder = pv('Arm_Far_Upper'), elbow = J.far_elbow.center, wrist = J.far_wrist.center, toe = [568, 346.5];
  void 0;
  const restUpper = ang(shoulder, elbow), restFore = ang(elbow, wrist), restPaw = ang(wrist, toe);

  const layers = [];
  const add = (o) => layers.push({parent: null, type: 'shape', expr: {}, ...o});

  // --- nulls ---
  add({name: 'CTRL_Tilo', type: 'null', controls: true, anchor: [0, 0], position: [120, 90], comment: 'All Tilo controls live here.'});
  add({name: 'Tilo_Root', type: 'null', anchor: [320, 330], position: [960, 540], scale: [160, 160], comment: 'Move / scale the whole character here.'});
  add({
    name: 'Flight', type: 'null', parent: 'Tilo_Root', anchor: pv('Plane_Body'), position: pv('Plane_Body'),
    comment: 'Bank and bob. Plane, dog and airflow ride on this.',
    expr: {
      rotation: `${PRE}var s=k("Flight Speed")/100,b=k("Bob Amount")/100;k("Flight Bank")*0.3+b*(1+1.5*s)*Math.sin(time*Math.PI*2*0.7+1.1);`,
      position: `${PRE}var s=k("Flight Speed")/100,b=k("Bob Amount")/100;[value[0],value[1]+b*(4+8*s)*Math.sin(time*Math.PI*2*0.9)+Math.abs(k("Flight Bank"))*0.25];`,
    },
  });

  // --- plane ---
  add({name: 'Plane_Body', parent: 'Flight', pivot: 'Plane_Body', geo: 'Plane_Body'});
  add({
    name: 'Wing', parent: 'Plane_Body', pivot: 'Wing', geo: 'Wing',
    comment: 'Banking foreshortens the near wing about its root.',
    expr: {scale: `${PRE}var b=k("Flight Bank");[100,100+b*1.1];`},
  });
  add({
    name: 'Stabilizer', parent: 'Plane_Body', pivot: 'Stabilizer', geo: 'Stabilizer',
    expr: {scale: `${PRE}var b=k("Flight Bank");[100,100+b*0.8];`},
  });
  add({name: 'Cockpit', parent: 'Plane_Body', pivot: 'Cockpit', geo: 'Cockpit'});
  // Propeller: a side-on blade never spins like a card; its visible height follows |cos(angle)|.
  const propAngle = `${PRE}var fd=thisComp.frameDuration,n=Math.floor(time/fd),a=0,i;for(i=0;i<n;i++){a+=kt("Propeller Speed",i*fd)/100*22*fd;}a+=k("Propeller Speed")/100*22*(time-n*fd);var th=a*Math.PI*2;`;
  add({
    name: 'Propeller', parent: 'Plane_Body', pivot: 'Propeller', geo: 'Propeller', motionBlur: true,
    comment: 'Compression + motion blur + directional blur; never rotated in 2D.',
    expr: {
      scale: `${propAngle}var c=Math.abs(Math.cos(th)),sn=Math.abs(Math.sin(th));[100*(1-0.14*sn),100*Math.max(0.07,c)];`,
      opacity: `${PRE}var s=k("Propeller Speed");100-82*Math.max(0,Math.min(1,(s-30)/45));`,
    },
    effects: [{type: 'directionalBlur', direction: 0, lengthExpr: `${PRE}k("Propeller Speed")/100*38;`}],
  });
  add({
    name: 'Propeller_Blur', parent: 'Plane_Body', pivot: 'Propeller_Blur', geo: 'Propeller_Blur',
    comment: 'Blur disc of the spinning blade; fades in with speed.',
    expr: {
      opacity: `${PRE}var s=k("Propeller Speed");62*Math.max(0,Math.min(1,(s-18)/50));`,
      scale: `${propAngle}[100,100*(0.94+0.06*Math.sin(th*2))];`,
    },
    effects: [{type: 'directionalBlur', direction: 0, lengthExpr: `${PRE}6+k("Propeller Speed")/100*24;`}],
  });

  // --- dog ---
  add({name: 'Dog_Root', type: 'null', parent: 'Plane_Body', anchor: pv('Dog_Body'), position: pv('Dog_Body'), comment: 'Seat. The dog sits here; tail and torso base stay put.'});
  const waist = parts.layers.Dog_Body ? [378, 392] : [378, 392];
  add({
    name: 'Dog_Chest', type: 'null', parent: 'Dog_Root', anchor: waist, position: waist,
    comment: 'Upper-body lean (Body Balance + bank lean with a lag). Head and forelegs ride on it; the torso path bends to follow.',
    expr: {rotation: `${PRE}var lag=4*thisComp.frameDuration;k("Body Balance")-0.4*kt("Flight Bank",time-lag);`},
  });
  // Neck: body vertices near the head ride the head's rotation with a smooth falloff, so the head
  // never separates from the neck.
  const hp = pv('Head');
  add({
    name: 'Dog_Body', parent: 'Dog_Root', pivot: 'Dog_Body', geo: 'Dog_Body',
    comment: 'Torso. Path expressions bend it at the waist (Dog_Chest) and at the neck (Head).',
    pathExpr: `var lean=thisComp.layer("Dog_Chest").transform.rotation.value*Math.PI/180,a=thisComp.layer("Head").transform.rotation.value*Math.PI/180;var W=${P(waist)},H=${P(hp)},y0=198,y1=272,b0=396,b1=318;function rot(p,c,t){var cs=Math.cos(t),sn=Math.sin(t),x=p[0]-c[0],y=p[1]-c[1];return [c[0]+x*cs-y*sn,c[1]+x*sn+y*cs];}function sm(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}var H2=rot(H,W,lean);var pts=thisProperty.points(),out=[],i;for(i=0;i<pts.length;i++){var p=pts[i];var wl=sm((b0-p[1])/(b0-b1));var q=rot(p,W,lean*wl);var wn=sm((y1-p[1])/(y1-y0));q=rot(q,H2,a*wn);out.push(q);}createPath(out,thisProperty.inTangents(),thisProperty.outTangents(),thisProperty.isClosed());`,
  });
  add({
    name: 'Tail', parent: 'Dog_Root', pivot: 'Tail', geo: 'Tail',
    comment: 'Bend-deformed from the rump; wave travels to the tip.',
    pathExpr: bendExpr([[286, 410], [262, 402], [240, 390], [222, 370], [214, 338], [218, 305], [232, 278], [250, 256]],
      `var w=k("Tail Wag"),fq=k("Tail Wag Speed"),cu=k("Tail Curl"),D=[0,0.1,0.16,0.18,0.18,0.2,0.18],A=[],q;for(q=0;q<D.length;q++){A.push(D[q]*(cu+w*1.6*Math.sin(time*Math.PI*2*fq-q*0.75)));}`),
  });

  const earAngles = (extraLag, phase) =>
    `var ft=k("Ear Follow Through")/100,lg=(k("Ear Lag")+${extraLag})*thisComp.frameDuration;function hw(t){return thisComp.layer("Head").transform.rotation.valueAtTime(t)+thisComp.layer("Dog_Chest").transform.rotation.valueAtTime(t)+thisComp.layer("Flight").transform.rotation.valueAtTime(t);}var drag=ft*1.5*(hw(time-lg)-hw(time));var s=k("Flight Speed")/100;var wind=-(s-0.5)*10;var fl=k("Ear Flutter")/100*(3+7*s);var tot=k("Ear Lift")+drag+wind;var D=[0,0.3,0.35,0.35],A=[],q;for(q=0;q<D.length;q++){A.push(D[q]*tot+(q>0?fl*0.6*Math.sin(time*Math.PI*2*(5+4*s)-q*0.9+${phase}):0));}`;
  add({name: 'Ear_Far', parent: 'Head', pivot: 'Ear_Far', geo: 'Ear_Far', comment: 'Bend-deformed; follow-through on head motion.',
    pathExpr: bendExpr([[413, 112], [391, 107], [368, 102], [345, 99], [330, 99]], earAngles(1, 1.7))});
  add({name: 'Ear_Near', parent: 'Head', pivot: 'Ear_Near', geo: 'Ear_Near', comment: 'Bend-deformed; follow-through on head motion.',
    pathExpr: bendExpr([[422, 162], [398, 164], [372, 164], [346, 162], [324, 160]], earAngles(0, 0))});
  add({
    name: 'Head', parent: 'Dog_Chest', pivot: 'Head', geo: 'Head',
    expr: {rotation: `${PRE}k("Head Tilt")-k("Head Counter")/100*thisComp.layer("Dog_Chest").transform.rotation.value;`},
  });
  add({name: 'Face', parent: 'Head', pivot: 'Face', geo: 'Face'});
  add({name: 'Goggles', parent: 'Head', pivot: 'Goggles', geo: 'Goggles'});
  add({name: 'Eye_White', parent: 'Head', pivot: 'Eye_White', geo: 'Eye_White'});
  add({
    name: 'Pupil', parent: 'Head', pivot: 'Eye_White', geo: 'Pupil', mask: 'eye',
    comment: 'Moves inside its own group; masked by the eye white so it never leaves the lens.',
    groupExpr: {
      position: `${PRE}var E=${P(eyeC)},R=${P(travel.map((v, i) => v + Math.abs(pupilC[i] - eyeC[i])))},p0=${P(pupilC)};var x=p0[0]+k("Pupil X")/100*${f(travel[0])},y=p0[1]+k("Pupil Y")/100*${f(travel[1])};var dx=(x-E[0])/R[0],dy=(y-E[1])/R[1],d=Math.sqrt(dx*dx+dy*dy);if(d>1){x=E[0]+(x-E[0])/d;y=E[1]+(y-E[1])/d;}[x-p0[0],y-p0[1]];`,
    },
  });
  // Eyelids: new artwork in the dog's white, inked edge; masked to the eye white (inside goggles).
  const lidPts = (edgeVar, bulge, farY) =>
    `var L=${f(ex0 - 6)},R=${f(ex1 + 6)},m=(L+R)/2,h=(R-L)/2,N=12,pts=[[R,${farY}],[L,${farY}]],i;for(i=0;i<=N;i++){var x=L+(R-L)*i/N,u=(x-m)/h;pts.push([x,${edgeVar}+${bulge}*(1-u*u)]);}`;
  const blinkAmt = `${PRE}var bl=k("Blink")/100;if(k("Auto Blink")>0){var iv=Math.max(0.5,k("Blink Interval")),ph=(time%iv)/0.24;if(ph<1){bl=Math.max(bl,Math.sin(ph*Math.PI));}}`;
  const upperEdge = `var up=k("Upper Lid Rest")/100*(1-bl)+bl;var eU=${f(ey0 - 5)}+(${f(eyeC[1] + 3)}-${f(ey0 - 5)})*up;`;
  const lowerEdge = `var eL=${f(ey1 + 5)}+(${f(eyeC[1] + 3)}-${f(ey1 + 5)})*bl;`;
  const zeros = `var z=[],q;for(q=0;q<pts.length;q++)z.push([0,0]);`;
  add({
    name: 'Eyelid_Upper', parent: 'Head', pivot: 'Eye_White', mask: 'eye', lid: 'upper',
    lidFill: `${blinkAmt}${upperEdge}${lidPts('eU', 3.2, f(ey0 - 30))}${zeros}createPath(pts,z,z,true);`,
    lidEdge: `${blinkAmt}${upperEdge}${lidPts('eU', 3.2, f(ey0 - 30))}pts=pts.slice(2);${zeros}createPath(pts,z,z,false);`,
  });
  add({
    name: 'Eyelid_Lower', parent: 'Head', pivot: 'Eye_White', mask: 'eye', lid: 'lower',
    lidFill: `${blinkAmt}${lowerEdge}${lidPts('eL', -2.2, f(ey1 + 30))}${zeros}createPath(pts,z,z,true);`,
    lidEdge: `${blinkAmt}${lowerEdge}${lidPts('eL', -2.2, f(ey1 + 30))}pts=pts.slice(2);${zeros}createPath(pts,z,z,false);`,
  });

  // --- forelegs (overlapping cutouts with round joints) ---
  const lift = `${PRE}var l=k("Near Paw Lift")/100;l=l*l*(3-2*l);`;
  const nS = pv('Arm_Near_Upper'), nE = J.near_elbow.center, nW = J.near_wrist.center, nT = [526, 401];
  const fS = pv('Arm_Far_Upper'), fE = J.far_elbow.center, fW = J.far_wrist.center, fT = toe;
  add({name: 'Arm_Near_Upper', parent: 'Dog_Chest', pivot: 'Arm_Near_Upper', geo: 'Arm_Near_Upper', expr: {rotation: `${lift}-5*l;`},
    pathExpr: skinExpr({distal: {joint: nE, normal: J.near_elbow.normal, child: 'Arm_Near_Fore'}, d: 13})});
  add({name: 'Arm_Near_Fore', parent: 'Arm_Near_Upper', pivot: 'Arm_Near_Fore', geo: 'Arm_Near_Fore', expr: {rotation: `${lift}-24*l;`},
    pathExpr: skinExpr({proximal: {joint: nE, normal: J.near_elbow.normal, self: 'Arm_Near_Fore'}, distal: {joint: nW, normal: J.near_wrist.normal, child: 'Paw_Near'}, d: 13})});
  add({name: 'Paw_Near', parent: 'Arm_Near_Fore', pivot: 'Paw_Near', geo: 'Paw_Near', expr: {rotation: `${lift}34*l;`},
    pathExpr: skinExpr({proximal: {joint: nW, normal: J.near_wrist.normal, self: 'Paw_Near'}, d: 11})});
  const point = `${PRE}var p=k("Point")/100;p=p*p*(3-2*p);var tg=-(25+k("Point Angle"));var rU=${f(restUpper)},rF=${f(restFore)},rP=${f(restPaw)};var aU=p*(tg-rU),aF=p*(tg-rF)-aU;`;
  add({name: 'Arm_Far_Upper', parent: 'Dog_Chest', pivot: 'Arm_Far_Upper', geo: 'Arm_Far_Upper', expr: {rotation: `${point}aU;`},
    pathExpr: skinExpr({distal: {joint: fE, normal: J.far_elbow.normal, child: 'Arm_Far_Fore'}, d: 11})});
  add({name: 'Arm_Far_Fore', parent: 'Arm_Far_Upper', pivot: 'Arm_Far_Fore', geo: 'Arm_Far_Fore', expr: {rotation: `${point}aF;`},
    pathExpr: skinExpr({proximal: {joint: fE, normal: J.far_elbow.normal, self: 'Arm_Far_Fore'}, distal: {joint: fW, normal: J.far_wrist.normal, child: 'Paw_Far'}, d: 11})});
  add({name: 'Paw_Far', parent: 'Arm_Far_Fore', pivot: 'Paw_Far', geo: 'Paw_Far', expr: {rotation: `${point}p*(tg-6-rP)-aU-aF+k("Far Paw Curl");`},
    pathExpr: skinExpr({proximal: {joint: fW, normal: J.far_wrist.normal, self: 'Paw_Far'}, d: 11})});

  // --- airflow: original strokes; length (scale from the plane end), spacing and opacity follow speed ---
  for (let i = 1; i <= 7; i++) {
    const n = `Airflow_0${i}`;
    const piv = pv(n);
    add({
      name: n, parent: 'Flight', pivot: n, geo: n,
      expr: {
        scale: `${PRE}var s=k("Flight Speed")/100;[100*(0.35+1.3*s),100];`,
        position: `${PRE}var s=k("Flight Speed")/100,sp=0.55+0.9*s,x=value[0]+(value[0]-60)*(sp-1);if(k("Airflow Travel")>0){var per=260,v=120+520*s,ph=(time*v+${i * 97})%per;x=x-ph+per*0.5;}[x,value[1]];`,
        opacity: `${PRE}var s=k("Flight Speed")/100,o=100*Math.max(0,Math.min(1,s/0.25));if(k("Airflow Travel")>0){var per=260,v=120+520*s,ph=((time*v+${i * 97})%per)/per;o*=Math.sin(ph*Math.PI)*(0.85+0.15*Math.cos(time*${f(9 + i * 1.7)}+${i}));}o;`,
      },
      piv,
    });
  }

  // stacking: front -> back (After Effects layer 1 is the front)
  layers.sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
  for (const l of layers) if (!ORDER.includes(l.name)) throw new Error(`no stack slot for ${l.name}`);
  // geometry + pivots
  for (const l of layers) {
    if (l.geo) l.groups = L[l.geo].groups;
    if (l.pivot && typeof l.pivot === 'string') l.anchor = l.position = pv(l.pivot);
  }
  return {
    comp: {width: 1920, height: 1080, fps: 30, duration: 10},
    controls: CONTROLS,
    layers,
    eyeOutline: parts.eye_outline,
    meta: {restUpper, restFore, restPaw, travel, pupilC, pupilR, eyeC, eyeR},
  };
}
