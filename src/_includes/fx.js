(()=>{
const D=document,H=D.documentElement,Q=(s,r=D)=>[...r.querySelectorAll(s)];
H.dataset.ok=1;
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches,FP=matchMedia('(hover:hover) and (pointer:fine)').matches;
/* split headlines into masked words */
const sp=el=>{let i=0;const lab=el.innerText.replace(/\s+/g,' ').trim();
(function w(n){[...n.childNodes].forEach(c=>{
if(c.nodeType===3){const f=D.createDocumentFragment();
c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.append(' ');return}
const m=D.createElement('span'),s=D.createElement('span');m.className='wm';m.setAttribute('aria-hidden','true');s.className='wi';s.style.setProperty('--i',i++);s.textContent=t;m.append(s);f.append(m)});
c.replaceWith(f)}else if(c.nodeType===1&&c.tagName!=='BR')w(c)})})(el);
el.setAttribute('aria-label',lab)};
Q('h1,h2,.cta h3').forEach(sp);
/* scroll reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
Q('h2,.cta h3').forEach(e=>io.observe(e));
Q('.three>div,.facts>div,.ig li,.strip figure,.q p,.visit>div,details,.award,.pair,.cta,.rev>div,.head,section>p,.ctl,footer .logo,footer .k,.fbot').forEach((e,i)=>{e.classList.add('rv');e.style.setProperty('--d',(i%4)*.09+'s');io.observe(e)});
/* clipped elements report 0% visibility, so watch their container and reveal the child */
const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target._cl.classList.add('in');io2.unobserve(e.target)}}),{threshold:.08});
Q('.three .pic,.ig img,.strip img').forEach((e,i)=>{e.classList.add('cl');e.style.setProperty('--d',(i%3)*.1+'s');const w=e.parentElement;w._cl=e;io2.observe(w)});
/* count-up rating */
const cb=Q('.facts b')[0];
if(cb&&!RM){const to=parseFloat(cb.textContent);if(to){cb.textContent='0.0';
new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();const s=performance.now();
(function t(n){const k=Math.min((n-s)/1600,1);cb.textContent=(to*(1-Math.pow(1-k,3))).toFixed(1);if(k<1)requestAnimationFrame(t)})(s)}}).observe(cb)}}
/* marquee */
const mt=Q('.mq-t')[0];
if(mt){const W=SITE.marquee||[];mt.innerHTML=[...W,...W,...W,...W].map(w=>'<span>'+w+'</span>').join('')}
/* magnetic buttons */
if(FP&&!RM){
Q('.btn').forEach(b=>{
b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.22+'px,'+(e.clientY-r.top-r.height/2)*.35+'px)'});
b.addEventListener('pointerleave',()=>{b.style.transform=''})})}
/* frame loop: progress, header, marquee velocity */
const pg=D.createElement('div');pg.className='pg';D.body.append(pg);
const hd=Q('header')[0];let ly=scrollY,v=0,pos=0;
(function tick(){
const y=scrollY,d=y-ly;ly=y;v+=(d-v)*.12;
pg.style.transform='scaleX('+y/Math.max(1,H.scrollHeight-innerHeight)+')';
if(d>4&&y>320&&!hd.contains(D.activeElement))hd.classList.add('hide');else if(d<-4||y<320)hd.classList.remove('hide');
if(mt&&!RM){pos+=-1-v*.5;const h=mt.scrollWidth/2;if(pos<-h)pos+=h;if(pos>0)pos-=h;mt.style.transform='translate3d('+pos+'px,0,0)'}
requestAnimationFrame(tick)})();
/* intro */
let done=0;
const go=()=>{if(done++)return;H.classList.add('ready');setTimeout(()=>Q('.pre').forEach(p=>p.remove()),2200)};
if(RM)go();else{Promise.all([D.fonts?D.fonts.ready:0,new Promise(r=>setTimeout(r,1500))]).then(go);setTimeout(go,4000)}
})();
