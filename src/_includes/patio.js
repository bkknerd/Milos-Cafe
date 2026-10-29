(()=>{
const $=s=>document.querySelector(s),svg=$('#ps-svg');if(!svg)return;const sc=svg.closest('.scene'),svgs=[...sc.querySelectorAll('svg.ps-l')];
const S={h:12,sr:7.5,ss:18.5,cover:30,rain:false,wind:5,feel:70,temp:null,ov:null,live:true};
const hrs=SITE.hours,V=SITE.verdicts,PL=SITE.patio;
const ny=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return{d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),h:(+p.hour)+(+p.minute)/60}};
const f=h=>{const m=Math.round(h*60)%1440,hh=Math.floor(m/60),mm=m%60;return(hh%12||12)+':'+String(mm).padStart(2,'0')+' '+(hh>=12?'PM':'AM')};
const mix=(a,b,t)=>a.map((x,i)=>Math.round(x+(b[i]-x)*t));
const K=[[0,[5,11,31],[15,30,69]],[5,[10,20,51],[42,47,94]],[6.5,[59,79,148],[240,160,122]],[8.5,[79,134,224],[188,217,245]],[12,[63,127,224],[156,203,242]],[16,[74,132,221],[180,214,242]],[18,[91,111,196],[243,178,122]],[19.5,[42,47,106],[217,119,90]],[21,[12,23,56],[36,58,115]],[24,[5,11,31],[15,30,69]]];
const sky=v=>{let i=K.findIndex(k=>k[0]>v)-1;if(i<0)i=K.length-2;const a=K[i],b=K[i+1],t=(v-a[0])/(b[0]-a[0]);return[mix(a[1],b[1],t),mix(a[2],b[2],t)]};
const vh=(h,sr,ss)=>{const v=h>=sr&&h<=ss?6.5+(h-sr)/(ss-sr)*13:h<sr?6.5-(sr-h):19.5+(h-ss);return((v%24)+24)%24};
const dk=v=>v<5?1:v<6.5?1-(v-5)/1.5:v<19?0:v<21?(v-19)/2:1;
const ph=v=>v<5?'Night':v<6.5?'Before dawn':v<8.5?'Sunrise':v<11?'Morning':v<15?'Midday':v<17.5?'Afternoon':v<19.5?'Golden hour':v<21?'Dusk':'Night';
const vd=(e,w,r)=>r?V.rain:e<50?V.cold:e>94?V.too_hot:w>22?V.windy:e<62?V.cool:e>88?V.hot:V.perfect;
const set=(id,k,v)=>$(id).setAttribute(k,v);
/* stars, bulbs, rain */
let s='';for(let i=0;i<46;i++){const a=Math.abs(Math.sin(i*12.9898)*43758.5453)%1,b=Math.abs(Math.sin(i*78.233)*12345.678)%1,c=Math.abs(Math.sin(i*39.346)*9876.54)%1;s+='<circle cx="'+(a*1440).toFixed(0)+'" cy="'+(80+b*300).toFixed(0)+'" r="'+(.7+c*1.3).toFixed(1)+'"/>'}$('#pst').innerHTML=s;
const L=$('#psl'),n=$('#psB'),len=L.getTotalLength();s='';for(let i=1;i<22;i++){const p=L.getPointAtLength(len*i/22);s+='<circle cx="'+p.x.toFixed(1)+'" cy="'+(p.y+6).toFixed(1)+'" r="14" fill="#ffc35a" opacity=".28"/><circle cx="'+p.x.toFixed(1)+'" cy="'+(p.y+6).toFixed(1)+'" r="4.5" fill="#fff1c1"/>'}n.innerHTML=s;
s='';for(let k=-1;k<9;k++)for(let i=0;i<22;i++){const x=Math.abs(Math.sin((i+1)*91.7+k)*1e4)%1*1560-60,y=k*80+(i*37%80);s+='<line x1="'+x.toFixed(0)+'" y1="'+y+'" x2="'+(x-5).toFixed(0)+'" y2="'+(y+22)+'"/>'}$('#psR').innerHTML=s;
/* render */
function draw(){
const v=vh(S.h,S.sr,S.ss),d=dk(v),[t1,t2]=sky(v);
const cover=S.ov==='clear'?5:S.ov==='cloud'?85:S.ov==='rain'?95:S.cover,rain=S.ov?S.ov==='rain':S.rain,g=cover/100*(rain?.7:.45);
sc.style.setProperty('--s1','rgb('+mix(t1,mix([110,120,140],[20,26,45],d),g)+')');
sc.style.setProperty('--s2','rgb('+mix(t2,mix([150,158,172],[30,40,70],d),g)+')');
const p=(S.h-S.sr)/(S.ss-S.sr),clr=1-cover/100*.85;
if(p>=0&&p<=1){const x=140+p*1160,y=400-Math.sin(Math.PI*p)*280,o=Math.min(1,Math.sin(Math.PI*p)*4);['#psS','#psH'].forEach(i=>{set(i,'cx',x);set(i,'cy',y)});set('#psS','opacity',o*clr);set('#psH','opacity',o*clr*.9)}else{set('#psS','opacity',0);set('#psH','opacity',0)}
const q=((S.h-S.ss+24)%24)/(24-(S.ss-S.sr));
if(q<=1){set('#psM','cx',140+q*1160);set('#psM','cy',400-Math.sin(Math.PI*q)*260);set('#psM','opacity',Math.min(1,Math.sin(Math.PI*q)*4)*(1-cover/100*.8))}else set('#psM','opacity',0);
set('#pst','opacity',d*(1-cover/100*.85));
sc.querySelectorAll('.psN').forEach(n=>n.setAttribute('opacity',d*.5+(rain?.12:0)));
const lit=Math.min(1,d*1.3+(cover>80?.15:0));set('#psW','opacity',lit);set('#psB','opacity',lit);
set('#pscl','opacity',Math.min(1,cover<10?.18:cover/100*1.05+.05));
$('#pscl').style.fill='rgb('+mix(mix([244,237,224],[60,70,110],d),[96,110,140],rain?.6:cover>70?.3:0)+')';
set('#psR','opacity',rain?1:0);$('#ps-rain').classList.toggle('on',!!rain);
sc.style.setProperty('--o',d>.85||S.wind>25?.16:1);
sc.style.setProperty('--st',S.feel<72&&d<.95?.9:0);
sc.style.setProperty('--sw',Math.max(1.8,7-S.wind/4)+'s');
/* text */
const dd=ny().d,hd=hrs[dd],[o,c]=hd||[0,0],w=rain?'Rain':cover>70?'Overcast':cover>30?'Partly cloudy':'Clear';
const st=!hd?V.closed_today:S.h<o?V.opens_at+' '+f(o):S.h>=c?V.closed_for_day:vd(S.feel,S.wind,rain);
$('#ps-k').textContent=(S.live&&!S.ov?PL.card_live:PL.card_preview)+' · '+PL.card_place;
$('#ps-m').textContent=ph(v);
$('#ps-s').textContent=[f(S.h),S.temp!=null?Math.round(S.temp)+'°F':'',w,st].filter(Boolean).join(' · ');
$('#ps-r').value=Math.round(S.h*60);$('#ps-now').hidden=S.live;
}
/* controls */
$('#ps-r').oninput=e=>{S.live=false;S.h=e.target.value/60;draw()};
$('#ps-now').onclick=()=>{S.live=true;S.h=ny().h;draw()};
document.querySelectorAll('#ps-ch .chip').forEach(b=>b.onclick=()=>{S.ov=b.dataset.ov||null;document.querySelectorAll('#ps-ch .chip').forEach(x=>x.setAttribute('aria-pressed',x===b));draw()});
setInterval(()=>{if(S.live){S.h=ny().h;draw()}},30000);
S.h=ny().h;draw();
/* framing: show the storefront on narrow screens */
const fr=()=>svgs.forEach(v=>v.setAttribute('preserveAspectRatio',(innerWidth<760?'xMaxYMax':'xMidYMax')+' slice'));fr();addEventListener('resize',fr,{passive:true});
/* depth: far pines and clouds drift slower than the page */
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){const far=$('#psFar'),cl=$('#pscl'),box=sc;
const par=()=>{const r=box.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const y=Math.max(0,-r.top);far.style.transform='translateY('+(y*.06)+'px)';cl.style.transform='translateY('+(y*.12)+'px)'};
addEventListener('scroll',par,{passive:true});par()}
/* live weather */
fetch('https://api.open-meteo.com/v1/forecast?latitude='+SITE.lat+'&longitude='+SITE.lng+'&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,cloud_cover&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=1')
.then(r=>r.json()).then(j=>{const k=j.current,hh=x=>{const t=x.split('T')[1].split(':');return(+t[0])+(+t[1])/60};
S.temp=k.temperature_2m;S.feel=k.apparent_temperature;S.wind=k.wind_speed_10m;S.cover=k.cloud_cover;S.rain=k.precipitation>0||k.weather_code>=51;
if(j.daily){S.sr=hh(j.daily.sunrise[0]);S.ss=hh(j.daily.sunset[0])}
draw()}).catch(()=>{$('#ps-m').textContent=ph(vh(S.h,S.sr,S.ss))});
})();
