(()=>{
const el=document.querySelector('.tb');if(!el)return;
const hrs=SITE.hours,V=SITE.verdicts;
const f=h=>{const m=Math.round((h%1)*60),hh=Math.floor(h);return(hh%12||12)+(m?':'+String(m).padStart(2,'0'):'')+' '+(hh>=12?'PM':'AM')};
const day=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short'}).format(new Date());
const h=hrs[['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(day)];
el.querySelector('.hr').textContent=SITE.today+' ('+day+') '+(h?f(h[0])+'–'+f(h[1]):V.closed_today);
/* patio verdict from feels-like temp (°F), wind (mph), precipitation */
const verdict=(feel,wind,rain)=>rain?V.rain:feel<50?V.cold:feel>94?V.too_hot:wind>22?V.windy:feel<62?V.cool:feel>88?V.hot:V.perfect;
fetch('https://api.open-meteo.com/v1/forecast?latitude='+SITE.lat+'&longitude='+SITE.lng+'&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York')
.then(r=>r.json()).then(j=>{const k=j.current;if(!k)throw 0;
const rain=k.precipitation>0||k.weather_code>=51;
el.querySelector('.t').textContent=Math.round(k.temperature_2m)+'°F';
el.querySelector('.pt').textContent=verdict(k.apparent_temperature,k.wind_speed_10m,rain);
el.dataset.w=1}).catch(()=>{el.dataset.w=0});
})();
