(()=>{
/* Header: today's hours as plain text (no live open/closed status) */
const els=document.querySelectorAll('.today');if(!els.length||!SITE.hours)return;
const f=h=>{const m=Math.round((h%1)*60),hh=Math.floor(h);return(hh%12||12)+(m?':'+String(m).padStart(2,'0'):'')+' '+(hh>=12?'PM':'AM')};
const day=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short'}).format(new Date());
const h=SITE.hours[['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(day)];
const txt=h?f(h[0])+'–'+f(h[1]):(SITE.verdicts&&SITE.verdicts.closed_today)||'Closed';els.forEach(el=>el.textContent=(el.dataset.label||'Today')+' '+txt);
})();

(()=>{const els=document.querySelectorAll('.ink');if(!els.length)return;
if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){els.forEach(e=>e.classList.add('in'));return}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px',threshold:1});
els.forEach(e=>io.observe(e))})();
