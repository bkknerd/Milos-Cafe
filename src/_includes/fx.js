(()=>{
/* Header: today's hours as plain text (no live open/closed status) */
const el=document.querySelector('.today');if(!el||!SITE.hours)return;
const f=h=>{const m=Math.round((h%1)*60),hh=Math.floor(h);return(hh%12||12)+(m?':'+String(m).padStart(2,'0'):'')+' '+(hh>=12?'PM':'AM')};
const day=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short'}).format(new Date());
const h=SITE.hours[['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(day)];
el.textContent=(el.dataset.label||'Today')+' '+(h?f(h[0])+'–'+f(h[1]):(SITE.verdicts&&SITE.verdicts.closed_today)||'Closed');
})();
