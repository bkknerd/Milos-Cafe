/* Analytics. Every click, plus the menu, pairing, patio and FAQ interactions, is pushed to the
   Google Tag Manager dataLayer. GTM decides where it goes (GA4 etc). No cookies are set here. */
(()=>{
const dl=window.dataLayer=window.dataLayer||[];
const push=(event,p)=>{try{dl.push(Object.assign({event},p||{}))}catch(e){}};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const later=f=>setTimeout(f,0); // read state after the site's own handler has run
const clean=s=>String(s||"").replace(/\s+/g," ").trim().slice(0,100);
const label=el=>clean(el.getAttribute("aria-label")||el.innerText||el.value||el.getAttribute("alt")||el.getAttribute("title")||"");

const PAGE=(dl.find&&(dl.find(x=>x&&x.page_type)||{}).page_type)||"other";
const sectionOf=el=>{
  const s=el.closest("header,footer,section,nav.bar");
  if(!s)return"";
  if(s.id)return s.id;
  if(s.matches("header"))return"header";
  if(s.matches("nav.bar"))return"mobile_bar";
  if(s.matches(".pairw"))return"pairing";
  if(s.matches(".hero"))return"hero";
  return(s.className||"").split(" ").filter(c=>c!=="w")[0]||"";
};

const linkKind=a=>{
  const h=a.getAttribute("href")||"";let u;
  try{u=new URL(a.href,location.href)}catch(e){return{kind:"other"}}
  if(/^tel:/i.test(h))return{kind:"phone"};
  if(/^mailto:/i.test(h))return{kind:"email"};
  if(/spoton\.com$/i.test(u.hostname)||(u.host===location.host&&u.pathname==="/order"))return{kind:"order"};
  if(/google\.[a-z.]+$/i.test(u.hostname)&&u.pathname.startsWith("/maps/dir"))return{kind:"directions",provider:"google"};
  if(/maps\.apple\.com$/i.test(u.hostname))return{kind:"directions",provider:"apple"};
  if(/waze\.com$/i.test(u.hostname))return{kind:"directions",provider:"waze"};
  if(/google\.[a-z.]+$/i.test(u.hostname)&&u.pathname.startsWith("/maps"))return{kind:"review_site",provider:"google"};
  if(/yelp\.com$/i.test(u.hostname))return{kind:"review_site",provider:"yelp"};
  if(/instagram\.com$/i.test(u.hostname))return{kind:"social",provider:"instagram"};
  if(u.host===location.host&&u.pathname===location.pathname&&(u.hash||h==="#"))return{kind:"section_nav",target:u.hash.slice(1)||"top"};
  if(u.host===location.host&&u.hash)return{kind:"section_nav",target:u.hash.slice(1)}; // e.g. /#menu from the press page
  if(u.host!==location.host)return{kind:"outbound",domain:u.hostname};
  return{kind:"internal",target:u.pathname.replace(/^\/|\/$/g,"")||"home"}; // e.g. /press/
};
const KIND_EVENT={phone:"phone_click",email:"email_click",order:"order_click",directions:"directions_click",review_site:"review_site_click",social:"social_click",section_nav:"nav_click",outbound:"outbound_click",internal:"internal_link_click"};

const itemInfo=it=>{
  if(!it)return{};
  const g=it.closest(".g"),tab=$(".tab[aria-selected=true]");
  return{item_name:clean(($(".n",it)||it).childNodes[0]?.textContent||label(it)),item_category:g?clean(($("h3",g)||{}).textContent):"",item_price:clean(($(".p",it)||{}).textContent),menu_tab:tab?tab.dataset.t:""};
};

const pressInfo=el=>({press_outlet:clean(el.dataset.pressOutlet),press_kind:clean(el.dataset.pressKind),press_title:clean(el.dataset.pressTitle),press_position:+el.dataset.pressPosition||0,press_featured:el.dataset.pressFeatured==="true"});

/* ---- Every click ---- */
let last={el:null,n:0,t:0};
document.addEventListener("click",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  const el=t.closest("a,button,summary,label,select,input,textarea,[role=button],[role=tab]")||t;
  const a=el.closest("a[href]");
  const type=a?"link":el.matches("button,[role=button]")?"button":el.matches("[role=tab]")?"tab":el.matches("summary")?"faq_question":el.matches("input,select,textarea,label")?"form_field":"non_interactive";
  const lk=a?linkKind(a):null;
  const base={page_type:PAGE,click_text:label(el),click_url:a?a.href:"",click_type:type,link_type:lk?lk.kind:"",click_section:sectionOf(el),click_element:el.tagName.toLowerCase(),click_id:el.id||"",click_classes:clean(typeof el.className==="string"?el.className:"")};
  push("site_click",base);

  // Rage clicks: 3+ on the same element within a second
  const now=Date.now();
  if(last.el===el&&now-last.t<1000){if(++last.n===3)push("rage_click",base)}else last={el,n:1,t:now};
  last.t=now;

  if(lk&&KIND_EVENT[lk.kind]){
    push(KIND_EVENT[lk.kind],Object.assign({},base,{link_provider:lk.provider||"",link_domain:lk.domain||"",nav_target:lk.target||"",outbound:lk.kind==="outbound"||!!lk.provider||lk.kind==="order"}));
  }

  // Menu
  if(el.matches(".tab"))push("menu_tab",{menu_tab:el.dataset.t});
  if(el.matches("#mf"))later(()=>push("menu_meat_free",{enabled:el.getAttribute("aria-pressed")==="true"}));
  if(el.matches(".cup")){const it=el.closest(".it");later(()=>push(it&&it.classList.contains("open")?"menu_item_open":"menu_item_close",itemInfo(it)))}
  if(a&&a.closest(".favs"))push("menu_favorite_click",{item_name:clean(a.dataset.item),click_text:label(a)});
  // Pairing ("Can't decide?")
  if(el.matches("#spin"))later(()=>push("pairing_spin",{food_mood:($("#s1")||{}).value||"",drink_mood:($("#s2")||{}).value||"",pairing_result:$$("#res .pr-n").map(n=>clean(n.textContent)).join(" + ")}));
  if(a&&a.matches(".pr-i"))push("pairing_result_click",{item_name:clean(($(".pr-n",a)||a).textContent),menu_tab:a.dataset.tab||""});
  // Patio scene
  if(el.matches("#ps-ch .chip"))push("patio_sky",{sky:el.dataset.ov||"live"});
  // Press page: which story, and how people get in touch
  const ps=a&&a.closest("[data-press-title]");
  if(ps)push("press_article_click",Object.assign(pressInfo(ps),{click_url:a.href,link_domain:lk&&lk.domain||"",page_type:PAGE}));
  const pc=a&&a.closest("[data-contact]");
  if(pc)push("press_contact_click",{contact_method:pc.dataset.contact,click_url:a.href,click_section:sectionOf(pc),page_type:PAGE});
  // Visit
  if(el.matches("#cp"))push("copy_address",{click_section:"visit",page_type:PAGE});
},true);

/* ---- Menu hover (desktop): the cup pours on hover, so count a hover held for 0.7s, once per item ---- */
const hovered=new Set();let hoverT;
document.addEventListener("pointerover",e=>{
  if(e.pointerType!=="mouse")return;
  const it=e.target instanceof Element&&e.target.closest(".it.has-cup");
  if(!it||it.contains(e.relatedTarget))return;
  clearTimeout(hoverT);
  hoverT=setTimeout(()=>{const k=it.id||it.textContent;if(it.matches(":hover")&&!hovered.has(k)){hovered.add(k);push("menu_item_hover",itemInfo(it))}},700);
});

/* ---- Search, selects, slider ---- */
let qT,lastQ="";
document.addEventListener("input",e=>{
  if(e.target.id!=="q")return;
  clearTimeout(qT);
  qT=setTimeout(()=>{const v=clean(e.target.value).toLowerCase();if(!v||v===lastQ)return;lastQ=v;push("menu_search",{search_term:v,results_count:$$("#mn .it").filter(x=>x.offsetParent!==null).length})},1200);
},true);
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.id==="s1"||t.id==="s2")push("pairing_select",{pair_field:t.id==="s1"?"food":"drink",pair_mood:t.value||"(cleared)"});
  if(t.id==="ps-r"){const m=+t.value;push("patio_time",{time:String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")})}
},true);

/* ---- FAQ ---- */
document.addEventListener("toggle",e=>{
  const d=e.target;if(!(d instanceof HTMLDetailsElement))return;
  push(d.open?"faq_open":"faq_close",{faq_question:clean(($("summary",d)||{}).textContent)});
},true);

/* ---- Copying text from the page (addresses, phone, menu items) ---- */
document.addEventListener("copy",()=>{const s=clean(String(getSelection()||""));if(s)push("content_copy",{copied_text:s})});

/* ---- Scroll depth ---- */
const marks=[25,50,75,90,100],hit=new Set();let sT;
const depth=()=>{const h=document.documentElement,max=h.scrollHeight-innerHeight;const p=max<=0?100:Math.round(scrollY/max*100);marks.forEach(m=>{if(p>=m&&!hit.has(m)){hit.add(m);push("scroll_depth",{percent_scrolled:m,page_type:PAGE})}})};
addEventListener("scroll",()=>{clearTimeout(sT);sT=setTimeout(depth,150)},{passive:true});

/* ---- Sections seen (40% on screen), once each ---- */
if("IntersectionObserver" in window){
  const seen=new Set();
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const n=sectionOf(en.target);if(n&&!seen.has(n)){seen.add(n);push("section_view",{section_name:n,page_type:PAGE})}io.unobserve(en.target)}),{threshold:.4});
  $$("main section, footer").forEach(s=>io.observe(s));
  // Press stories seen (60% on screen), once each, with their place in the list
  const pio=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;push("press_item_view",Object.assign(pressInfo(en.target),{page_type:PAGE}));pio.unobserve(en.target)}),{threshold:.6});
  $$("[data-press-title]").forEach(el=>pio.observe(el));
}

/* ---- Script errors (first 5) ---- */
let errs=0;
addEventListener("error",e=>{if(errs++<5&&e.message)push("js_error",{error_message:clean(e.message),error_source:clean((e.filename||"").split("/").pop()+":"+(e.lineno||""))})});
})();
