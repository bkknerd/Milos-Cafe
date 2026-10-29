(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const M=SITE.menu,TH=SITE.thumbs||{};let cur="food";
/* drink layers: colour + plain-English name, bottom to top */
const LY={espresso:["#4a2b1c","espresso"],milk:["#e4d3b8","steamed milk"],foam:["#f6efe1","milk foam"],water:["#d6e4f0","hot water"],ice:["#e6eff7","ice"],
coldbrew:["#3a2316","cold brew"],coffee:["#3d2417","drip coffee"],cream:["#f3e3c3","sweet cream"],tonic:["#e9f3f3","tonic"],gelato:["#f4ead3","gelato"],
chocolate:["#5a3423","chocolate"],syrup:["#d9a24a","house syrup"],matcha:["#7fa65a","matcha"],strawberry:["#e0707f","strawberry"],chai:["#b8865a","chai"],tea:["#9b6b3d","earl grey"],cider:["#c98a3a","apple cider"]};
const frac=n=>{const w=Math.floor(n),r=Math.round((n-w)*10)/10,f={.3:"⅓",.5:"½",.7:"⅔"}[r]||"";return (w?w:"")+f||String(n)};
const slug=s=>"c-"+String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-");
let cid=0;
function cup(layers){const id="cg"+(cid++),tot=layers.reduce((a,l)=>a+(+l.parts||0),0)||1,top=7,bot=26,H=bot-top;let y=bot,r="";
layers.forEach((l,k)=>{const c=(LY[l.layer]||["#ccc"])[0],h=H*(+l.parts||0)/tot;y-=h;r+=`<rect class="ly" style="--k:${k}" x="0" y="${y.toFixed(2)}" width="24" height="${(h+.4).toFixed(2)}" fill="${c}"/>`});
const hot=!layers.some(l=>/ice|coldbrew|tonic/.test(l.layer));
return `<svg viewBox="0 0 24 30" aria-hidden="true">${hot?'<g class="st"><path d="M9.5 3c-1.3-1.4 1.3-2.4 0-4"/><path d="M14.5 3c-1.3-1.4 1.3-2.4 0-4"/></g>':''}<defs><clipPath id="${id}"><path d="M3.6 4.5h16.8l-1.9 21.5H5.5z"/></clipPath></defs><g clip-path="url(#${id})">${r}</g><path class="gl" d="M3.6 4.5h16.8l-1.9 21.5H5.5z"/><path class="sc" d="M1.5 28.4h21"/></svg>`}
const mix=layers=>layers.map(l=>{const p=+l.parts||0,n=(LY[l.layer]||[0,l.layer])[1];return frac(p)+" part"+(p>1?"s":"")+" "+n}).join(" · ");
const price=p=>typeof p==="number"&&p>0?"$"+p.toFixed(2):"";
function item(i){const ly=(i.layers||[]).filter(l=>l&&l.layer),has=ly.length>0;
return `<li class="it${has?" has-cup":""}"><div class="row"><span class="n">${esc(i.name)}${i.favorite?'<span class="fav" title="Guest favorite"> ★</span>':""}</span><span class="dots" aria-hidden="true"></span>${has?`<button class="cup" type="button" aria-expanded="false" aria-label="What’s in the ${esc(i.name)}">${cup(ly)}</button>`:""}<span class="p">${price(i.price)}</span></div>${i.description?`<p class="d">${esc(i.description)}</p>`:""}${has?`<p class="mix">${esc(mix(ly))}</p>`:""}</li>`}
function draw(t){if(t)cur=t;const q=$("#q").value.trim().toLowerCase(),mf=$("#mf").getAttribute("aria-pressed")==="true"&&cur==="food";
const cats=(M[cur]||[]).map(c=>({c,k:(c.items||[]).filter(i=>(!q||(i.name+" "+(i.description||"")).toLowerCase().includes(q))&&!(mf&&i.contains_meat))})).filter(x=>x.k.length);
$("#mn").innerHTML=cats.map(({c,k})=>{const th=c.image&&(TH[c.image]||c.image);
return `<div class="g" id="${slug(c.category)}"><h3>${th?`<img src="${esc(th)}" alt="" width="56" height="56" loading="lazy"/>`:""}${esc(c.category)}</h3><ul>${k.map(item).join("")}</ul></div>`}).join("")||`<p class="empty">${esc(M.empty)}</p>`;
$("#jump").innerHTML=cats.map(({c})=>`<a href="#${slug(c.category)}">${esc(c.category)}</a>`).join("")}
if($("#mn")){
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.setAttribute("aria-selected",x===b));draw(b.dataset.t)});
$("#q").oninput=()=>draw();
$("#mf").onclick=e=>{const b=e.currentTarget;b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true");$$(".tab").forEach(x=>x.setAttribute("aria-selected",x.dataset.t==="food"));draw("food")};
$("#mn").addEventListener("click",e=>{const b=e.target.closest(".cup");if(!b)return;const it=b.closest(".it"),o=!it.classList.contains("open");
$$(".it.open").forEach(x=>{x.classList.remove("open");x.querySelector(".cup").setAttribute("aria-expanded","false")});
if(o){it.classList.add("open");b.setAttribute("aria-expanded","true")}});
draw("food")}
/* mood pairing */
const bite=Object.fromEntries((SITE.bite||[]).map(m=>[m.mood,m.items||[]])),sip=Object.fromEntries((SITE.sip||[]).map(m=>[m.mood,m.items||[]]));
const pk=a=>a[Math.floor(Math.random()*a.length)];
function go(){const b=$("#s1").value||pk(Object.keys(bite)),s=$("#s2").value||pk(Object.keys(sip));if(!bite[b]||!sip[s])return;$("#res").textContent=pk(bite[b])+SITE.joiner+pk(sip[s])+"."}
if($("#spin")){$("#spin").onclick=go;$("#s1").onchange=go;$("#s2").onchange=go}
const cp=$("#cp");if(cp)cp.onclick=e=>{try{navigator.clipboard.writeText(SITE.address);e.currentTarget.textContent=SITE.copied}catch(x){}};
})();
