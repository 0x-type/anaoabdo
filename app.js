
/* ── CONFIG ── */
const OPENAI_API_KEY = '';
const OPENAI_MODEL   = 'gpt-4o-mini';

/* ── KNOWLEDGE BASE ── */
const CONCOURS_KNOWLEDGE = `
=== CONCOURS MAROC — BASE DE CONNAISSANCES ===
Utilise TOUJOURS la notation LaTeX pour les formules mathématiques.
Pour les formules inline utilise \\( ... \\) et pour les blocs \\[ ... \\].

ENSA/ENSAM MATHÉMATIQUES :
Suites arithmétiques: \\( u_n = u_0 + n \\cdot r \\). Somme \\( S = \\frac{n(u_0+u_n)}{2} \\).
Suites géométriques: \\( u_n = u_0 \\cdot q^n \\). Somme \\( S = \\frac{u_0(1-q^n)}{1-q} \\).
Limites clés: \\( \\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\), \\( \\lim_{x \\to 0} \\frac{1-\\cos x}{x^2} = \\frac{1}{2} \\), \\( \\lim_{x \\to 0} \\frac{e^x-1}{x} = 1 \\).
DL: \\( \\sin x \\approx x - \\frac{x^3}{6} \\), \\( \\cos x \\approx 1 - \\frac{x^2}{2} \\), \\( e^x \\approx 1+x+\\frac{x^2}{2} \\), \\( \\ln(1+x) \\approx x - \\frac{x^2}{2} \\).
Exemple ENSA 2022: \\[ \\lim_{x \\to 0} \\frac{\\sin x - x}{x^3} = -\\frac{1}{6} \\] (via DL de sin).
Intégrales: \\( \\int x^n \\, dx = \\frac{x^{n+1}}{n+1} \\), \\( \\int e^x \\, dx = e^x \\), \\( \\int \\frac{1}{x} \\, dx = \\ln|x| \\).
IPP: \\( \\int u \\cdot v' = [u \\cdot v] - \\int u' \\cdot v \\).
Exemple: \\[ \\int_0^1 x e^x \\, dx = [xe^x - e^x]_0^1 = 1 \\]

PHYSIQUE ENSA :
Projectile: \\( x = v_0 \\cos\\theta \\cdot t \\), \\( y = v_0 \\sin\\theta \\cdot t - \\frac{1}{2}gt^2 \\). Portée \\( R = \\frac{v_0^2 \\sin 2\\theta}{g} \\). \\( H = \\frac{v_0^2 \\sin^2\\theta}{2g} \\).
Circuit RC: \\( \\tau = RC \\), \\( u(t) = E(1-e^{-t/\\tau}) \\). Résonance RLC: \\( \\omega_0 = \\frac{1}{\\sqrt{LC}} \\).
Exemple: \\( R = 1\\,k\\Omega \\), \\( C = 1\\,\\mu F \\) donc \\( \\tau = 1\\,ms \\). À \\( t = 5\\tau \\): chargé à 99%.

MÉDECINE :
Mitose: \\( 2n \\to 2n \\) (2 cellules). Méiose: \\( 2n \\to n \\) (4 cellules haploïdes).
Photosynthèse: \\[ 6CO_2 + 6H_2O + \\text{lumière} \\to C_6H_{12}O_6 + 6O_2 \\]
Humain: \\( 2n = 46 \\) chromosomes. Gamètes: \\( n = 23 \\).

ENCG/ISCAE :
Probabilités: \\( C_n^p = \\frac{n!}{p!(n-p)!} \\). Bayes: \\( P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} \\).
Économie: \\( \\text{PIB} = C + I + G + (X - M) \\). Élasticité prix \\( E_d = \\frac{\\Delta Q / Q}{\\Delta P / P} \\).

IAV/ENAM :
Respiration cellulaire: Glycolyse (2 ATP) + Krebs (2 ATP) + Chaîne respiratoire (\\(\\approx\\) 34 ATP) \\( \\approx 36\\text{–}38 \\) ATP total.

STRATÉGIES PAR CONCOURS :
ENSA/ENSAM: Maths 50% → Physique 35% → Français 15%.
Médecine: SVT 40% → PhyChim 30% → Maths 20% → Français 10%.
ENCG: Maths/Logique 35% → Français 25% → Anglais 20% → Économie 20%.
ENA: Culture G. 40% → Français 30% → Maths/Logique 20% → Anglais 10%.
IAV/ENAM: SVT 40% → Maths 25% → PhyChim 25% → Français 10%.

PLAN 30 JOURS UNIVERSEL :
Semaine 1-2: cours fondamentaux + formules clés.
Semaine 3: annales 3 dernières années, chronométré.
Semaine 4: correction erreurs + QCM intensifs.
`;

/* ── STATE ── */
const KEY_USER='pl_user_v3', KEY_TC='pl_tc_v2', KEY_YT='pl_yt_v2';
let currentUser=null, authMode='login', currentSection='drives', currentModule=null;
let tcData=null, dashChart=null;
let concoursCurrent={filiere:null,type:null};
let concQCMState={questions:[],current:0,score:0,answers:[],_pending:null};
let advOpen=false, advFilter='all', advHistory=[], advLoading=false;

/* ── AUTH ── */
function getSession(){try{return JSON.parse(sessionStorage.getItem(KEY_USER)||localStorage.getItem(KEY_USER)||'null')}catch{return null}}
function setSession(u){const s=JSON.stringify(u);sessionStorage.setItem(KEY_USER,s);localStorage.setItem(KEY_USER,s)}
function clearSession(){sessionStorage.removeItem(KEY_USER);localStorage.removeItem(KEY_USER)}
function getUsers(){try{return JSON.parse(localStorage.getItem('pl_users')||'{}')}catch{return{}}}
function saveUsers(u){localStorage.setItem('pl_users',JSON.stringify(u))}
function initials(n){return(n||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?'}
function switchTab(tab){authMode=tab;document.getElementById('tab-login').classList.toggle('active',tab==='login');document.getElementById('tab-register').classList.toggle('active',tab==='register');document.getElementById('nameGroup').style.display=tab==='register'?'block':'none';document.getElementById('submitTxt').textContent=tab==='login'?'Se connecter →':'Créer mon compte →';document.getElementById('errBanner').classList.remove('show')}
function handleGoogle(){processLogin({name:'Youssef El Amrani',email:'youssef@gmail.com',initials:'YE',provider:'google'})}
function demoLogin(){processLogin({name:'Étudiant Démo',email:'demo@prepalab.ma',initials:'ED',provider:'demo'})}
function handleAuth(){
  const email=document.getElementById('emailInput').value.trim(),pw=document.getElementById('pwInput').value,name=document.getElementById('nameInput').value.trim();
  let ok=true;['emailErr','pwErr'].forEach(id=>document.getElementById(id).classList.remove('show'));document.getElementById('errBanner').classList.remove('show');
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){document.getElementById('emailErr').classList.add('show');ok=false}
  if(!pw||pw.length<6){document.getElementById('pwErr').classList.add('show');ok=false}
  if(!ok)return;
  const btn=document.getElementById('submitBtn');btn.classList.add('loading');
  setTimeout(()=>{
    const users=getUsers();
    if(authMode==='login'){const u=users[email];if(!u){btn.classList.remove('loading');showBannerErr('Aucun compte avec cet email.');return}if(u.password!==btoa(pw)){btn.classList.remove('loading');showBannerErr('Mot de passe incorrect.');return}btn.classList.remove('loading');processLogin({name:u.name,email,initials:initials(u.name),provider:'email'})}
    else{if(users[email]){btn.classList.remove('loading');showBannerErr('Compte existant.');return}const n=name||email.split('@')[0];users[email]={name:n,email,password:btoa(pw)};saveUsers(users);btn.classList.remove('loading');processLogin({name:n,email,initials:initials(n),provider:'email'})}
  },750)
}
function showBannerErr(msg){document.getElementById('errMsg').textContent=msg;document.getElementById('errBanner').classList.add('show')}
function togglePw(){const i=document.getElementById('pwInput'),b=document.getElementById('eyeBtn');i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'👁':'🙈'}
function forgotPw(){showToast(document.getElementById('emailInput').value.trim()?'📧 Email envoyé !':'✉️ Entre ton email d\'abord')}
function processLogin(user){currentUser=user;setSession(user);showPage('dashboard');initDashboard();showToast('🎉 Bienvenue, '+user.name.split(' ')[0]+' !')}
function logout(){clearSession();currentUser=null;showPage('login');showToast('👋 À bientôt !')}

/* ── ROUTING ── */
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById('page-'+id).classList.add('active');window.scrollTo(0,0);document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'))}
function goPacks(section){currentSection=section;showPage('packs');initPacks(section);['drives','videos','exams'].forEach(s=>{const el=document.getElementById('pk-'+s);if(el)el.classList.toggle('active',s===section)})}
function goStudyZone(){if(!currentModule){const m=modulesData[currentSection];currentModule=m?m[0]:null}showPage('study');initStudy()}
function openModule(section,idx){currentSection=section;currentModule=modulesData[section][idx];showPage('study');initStudy()}

/* ── ADVISOR — RENDU LATEX ── */
function renderAdvText(text){
  return text
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/`(.*?)`/g,'<code>$1</code>')
    .replace(/\n\n/g,'<br><br>')
    .replace(/\n/g,'<br>');
}

function addAdvMsg(role,text){
  const msgs=document.getElementById('advMessages');
  if(!msgs)return;
  const isUser=role==='user';
  const div=document.createElement('div');
  div.className='adv-msg '+(isUser?'user':'bot');
  const avatarContent=isUser?(currentUser?currentUser.initials||'?':'?'):'🎓';
  const bubbleContent=isUser
    ?text.replace(/</g,'&lt;')
    :renderAdvText(text);
  div.innerHTML=`<div class="adv-msg-avatar">${avatarContent}</div>
    <div>
      <div class="adv-msg-bubble">${bubbleContent}</div>
      <div class="adv-msg-time">${advNow()}</div>
    </div>`;
  msgs.appendChild(div);
  /* ── Rendu MathJax sur la bulle ── */
  if(!isUser && window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise([div]).catch(err=>console.error('MathJax error:',err));
  }
  advScrollBottom();
}

/* ── ADVISOR ACTIONS ── */
function openAdvisor(){
  advOpen=true;
  document.getElementById('advisorPanel').classList.add('open');
  document.getElementById('advisorOverlay').classList.add('open');
  document.getElementById('advisorFab').style.display='none';
  setTimeout(()=>document.getElementById('advInput').focus(),400);
}
function closeAdvisor(){advOpen=false;document.getElementById('advisorPanel').classList.remove('open');document.getElementById('advisorOverlay').classList.remove('open');document.getElementById('advisorFab').style.display='flex'}
function toggleAdvisor(){advOpen?closeAdvisor():openAdvisor()}
function openAdvisorWithContext(filiere){
  setAdvFilter(filiere,document.querySelector('.adv-chip.inst-'+filiere));
  openAdvisor();
  const labels={med:'Médecine & Pharmacie',ing:'ENSA / ENSAM / Ingénieur',adm:'ENA & Administration',encg:'ENCG / ISCAE',agro:'IAV / ENAM / ENCSK'};
  setTimeout(()=>{if(document.getElementById('advInput'))document.getElementById('advInput').value='Bonjour ! Je prépare le concours '+labels[filiere]+'. Par où commencer ?'},400)
}
function setAdvFilter(filter,btn){
  advFilter=filter;
  document.querySelectorAll('.adv-chip').forEach(c=>c.classList.remove('active'));
  if(btn)btn.classList.add('active');
}
function quickPrompt(btn){
  document.getElementById('advInput').value=btn.textContent;
  document.getElementById('advQuickPrompts').style.display='none';
  sendAdvMsg();
}
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px'}
function advKeyDown(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAdvMsg()}}
function advScrollBottom(){const m=document.getElementById('advMessages');if(m)m.scrollTop=m.scrollHeight}
function advNow(){return new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}

function getFiliereName(){
  const map={all:'Toutes filières marocaines',med:'Médecine & Pharmacie',ing:'ENSA/ENSAM/Ingénieur',adm:'ENA & Administration',encg:'ENCG & ISCAE',agro:'IAV / ENAM / ENCSK'};
  return map[advFilter]||'Toutes filières';
}

async function sendAdvMsg(){
  if(advLoading)return;
  const input=document.getElementById('advInput');
  const text=input.value.trim();
  if(!text){showToast('✏️ Écris ta question d\'abord');return}
  if(!OPENAI_API_KEY||OPENAI_API_KEY==='METS_TA_CLE_OPENAI_ICI'){
    addAdvMsg('bot','⚙️ **Configuration requise** — Le propriétaire de la plateforme doit configurer la clé API. Contacte l\'administrateur PrepaLab.');
    return;
  }
  input.value='';input.style.height='auto';
  document.getElementById('advQuickPrompts').style.display='none';
  advLoading=true;
  document.getElementById('advSend').disabled=true;
  document.getElementById('advLoadingOverlay').classList.add('show');
  addAdvMsg('user',text);
  advHistory.push({role:'user',content:text});

  const systemPrompt=`Tu es le Concours Advisor de PrepaLab, expert en concours post-bac marocains.

FILIÈRE ACTIVE : ${getFiliereName()}

BASE DE CONNAISSANCES :
${CONCOURS_KNOWLEDGE}

RÈGLES IMPÉRATIVES :
- Réponds en français (ou darija si l'étudiant l'utilise)
- TOUJOURS utiliser LaTeX pour les formules : \\( ... \\) pour inline, \\[ ... \\] pour les blocs display
- Exemple correct : "La formule est \\( u_n = u_0 + n \\cdot r \\) pour les suites arithmétiques."
- Exemple bloc : "\\[ S_n = \\frac{u_0(1-q^n)}{1-q} \\]"
- Utilise **gras** pour points importants
- Donne toujours un exemple numérique après chaque formule
- Termine par une "Prescription immédiate" : action concrète à faire maintenant
- Sois direct, max 300 mots, orienté résultats concours`;

  try{
    const response=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+OPENAI_API_KEY},
      body:JSON.stringify({model:OPENAI_MODEL,max_tokens:700,temperature:0.7,messages:[{role:'system',content:systemPrompt},...advHistory.slice(-10)]})
    });
    const data=await response.json();
    document.getElementById('advLoadingOverlay').classList.remove('show');
    if(data.choices&&data.choices[0]){
      const reply=data.choices[0].message.content;
      advHistory.push({role:'assistant',content:reply});
      addAdvMsg('bot',reply);
    }else if(data.error){
      let errMsg='⚠️ **Erreur API :** ';
      if(data.error.code==='invalid_api_key')errMsg+='Clé API invalide.';
      else if(data.error.code==='rate_limit_exceeded')errMsg+='Limite atteinte, réessaie dans 1 minute.';
      else if(data.error.code==='insufficient_quota')errMsg+='Quota épuisé.';
      else errMsg+=data.error.message;
      addAdvMsg('bot',errMsg);
    }else{
      addAdvMsg('bot','⚠️ Réponse inattendue. Réessaie dans quelques secondes.');
    }
  }catch(err){
    document.getElementById('advLoadingOverlay').classList.remove('show');
    addAdvMsg('bot',err.message&&err.message.includes('Failed to fetch')
      ?'⚠️ **Connexion impossible.** Vérifie ta connexion internet.'
      :'⚠️ **Erreur technique.** Réessaie dans quelques secondes.');
    console.error('Advisor error:',err);
  }finally{
    advLoading=false;
    document.getElementById('advSend').disabled=false;
  }
}

/* ── CONCOURS ── */
function initConcours(){
  document.getElementById('conc-bc').textContent='Prépa Concours';
  document.getElementById('conc-main-view').classList.remove('hidden');
  document.getElementById('conc-sub-page').classList.remove('active');
  ytLoad();ytRender('concours');
}
function filterConcours(cat,btn){
  document.querySelectorAll('.conc-tab').forEach(t=>t.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.querySelectorAll('.sector-card').forEach(card=>{card.style.display=(cat==='all'||card.dataset.cat===cat)?'flex':'none'});
}

const CONCOURS_DATA={
  med:{title:'Médecine & Pharmacie',badge:'🩺 Médecine',
    annales:{title:'📄 Annales Médecine',desc:'Annales officielles des concours d\'accès aux Facultés de Médecine.',stats:[{n:'60+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],
      files:[{name:'Sujet Concours Médecine Casa 2024',size:'1.2 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Correction SVT – Casa 2024',size:'0.9 MB',type:'PDF',icon:'📋',color:'di-green'},{name:'Sujet Médecine Rabat 2024',size:'1.1 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Sujet Médecine Fès 2024',size:'1.0 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Annales compilées 2019-2023',size:'5.4 MB',type:'PDF',icon:'📚',color:'di-purple'}]},
    qcm:{questions:[
      {q:"Quelle structure cellulaire produit la majorité de l'ATP ?",opts:["Le noyau","Les mitochondries","Le réticulum endoplasmique","Les ribosomes"],correct:1,expl:"Les mitochondries réalisent la chaîne de transport des électrons → ~34 ATP/glucose."},
      {q:"pH normal du sang humain :",opts:["6.8–7.0","7.0–7.2","7.35–7.45","7.5–7.8"],correct:2,expl:"pH sanguin = 7.35-7.45. En dessous : acidose. Au-dessus : alcalose."},
      {q:"Chromosomes d'une cellule somatique humaine :",opts:["23","44","46","48"],correct:2,expl:"2n=46 (23 paires). Gamètes : n=23."},
      {q:"L'insuline est sécrétée par :",opts:["Cellules alpha du pancréas","Cellules bêta du pancréas","Le foie","La glande surrénale"],correct:1,expl:"Cellules β des îlots de Langerhans sécrètent l'insuline (hypoglycémiante)."},
      {q:"La méiose produit :",opts:["2 cellules diploïdes","4 cellules diploïdes","2 cellules haploïdes","4 cellules haploïdes"],correct:3,expl:"Méiose = 4 cellules haploïdes (n chromosomes) pour la reproduction sexuée."}
    ]}},
  ing:{title:'Ingénieur (ENSA/ENSAM)',badge:'⚙️ Ingénieur',
    annales:{title:'📄 Annales Ingénieur',desc:'Annales ENSA, ENSAM, UM6P avec solutions.',stats:[{n:'50+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'3',l:'Matières'}],
      files:[{name:'Sujet ENSA – Maths 2024',size:'0.8 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Correction ENSA Maths 2024',size:'1.0 MB',type:'PDF',icon:'📋',color:'di-green'},{name:'Sujet ENSAM Casa 2024',size:'0.9 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Annales ENSA compilées 2019-2023',size:'4.8 MB',type:'PDF',icon:'📚',color:'di-purple'}]},
    qcm:{questions:[
      {q:"∫₀¹ x² dx = ?",opts:["1/2","1/3","1/4","2/3"],correct:1,expl:"[x³/3]₀¹ = 1/3."},
      {q:"Dérivée de f(x) = e^(2x) :",opts:["e^(2x)","2e^(2x)","e^x","2xe^(2x)"],correct:1,expl:"(e^(2x))' = 2·e^(2x) — règle de la chaîne."},
      {q:"lim_{x→0} (sin x)/x = ?",opts:["0","∞","1","Indéfinie"],correct:2,expl:"Limite fondamentale : 1. À mémoriser absolument !"},
      {q:"Rang d'une matrice 3×3 nulle :",opts:["3","1","0","Indéfini"],correct:2,expl:"Matrice nulle → aucun vecteur pivot → rang = 0."},
      {q:"Constante de temps τ d'un circuit RC :",opts:["R+C","R/C","RC","R·C²"],correct:2,expl:"τ = RC en secondes. À t=5τ : condensateur chargé à 99%."}
    ]}},
  adm:{title:'ENA & Administration',badge:'🏛️ ENA',
    annales:{title:'📄 Annales ENA',desc:'Annales ENA et concours d\'administration.',stats:[{n:'40+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],
      files:[{name:'Sujet ENA – Culture G. 2024',size:'0.7 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Correction ENA 2024',size:'0.8 MB',type:'PDF',icon:'📋',color:'di-green'},{name:'Annales ENA 2019-2023',size:'3.5 MB',type:'PDF',icon:'📚',color:'di-purple'}]},
    qcm:{questions:[
      {q:"Capitale administrative du Maroc :",opts:["Casablanca","Rabat","Fès","Marrakech"],correct:1,expl:"Rabat est la capitale administrative et royale du Maroc depuis le Protectorat."},
      {q:"Indépendance du Maroc :",opts:["1952","1954","1956","1960"],correct:2,expl:"2 mars 1956 — déclaration franco-marocaine."},
      {q:"Constitution de 2011 : nombre de langues officielles :",opts:["1","2","3","4"],correct:1,expl:"Art. 5 : arabe ET amazigh sont langues officielles."},
      {q:"Membres de l'ONU :",opts:["150","175","193","210"],correct:2,expl:"193 États membres (depuis l'adhésion du Soudan du Sud en 2011)."},
      {q:"Membres permanents du Conseil de Sécurité :",opts:["USA, UK, France, Allemagne, Chine","USA, Russie, Chine, France, UK","USA, Russie, UK, Inde, Chine","USA, France, Allemagne, Russie, Japon"],correct:1,expl:"Les P5 : États-Unis, Russie, Chine, France, Royaume-Uni."}
    ]}},
  encg:{title:'ENCG & ISCAE',badge:'📊 ENCG',
    annales:{title:'📄 Annales ENCG/ISCAE',desc:'Annales officielles ENCG et ISCAE.',stats:[{n:'45+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],
      files:[{name:'Sujet ENCG Casa – Maths 2024',size:'0.6 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Correction ENCG 2024',size:'0.7 MB',type:'PDF',icon:'📋',color:'di-green'},{name:'Annales ENCG 2019-2023',size:'3.8 MB',type:'PDF',icon:'📚',color:'di-purple'}]},
    qcm:{questions:[
      {q:"5 ouvriers en 8 jours → 10 ouvriers en :",opts:["4 jours","6 jours","10 jours","16 jours"],correct:0,expl:"Travail total=40 jours-ouvriers. 40÷10=4 jours. Règle de 3 inverse."},
      {q:"Lequel N'EST PAS un indicateur macroéconomique ?",opts:["PIB","Taux d'inflation","Indice CAC 40","Taux de chômage"],correct:2,expl:"CAC 40 = indicateur boursier, pas macroéconomique."},
      {q:"Rentabilité: investissement 100 000 MAD, bénéfice 15 000 MAD :",opts:["1.5%","10%","15%","20%"],correct:2,expl:"15 000/100 000 × 100 = 15%."},
      {q:"Loi de la demande :",opts:["Prix↑ → Demande↑","Prix↑ → Demande↓","Prix↓ → Demande↓","Indépendants"],correct:1,expl:"Relation inverse : prix monte → demande baisse."},
      {q:"C(10,3) = ?",opts:["30","120","720","10"],correct:1,expl:"10!/(3!·7!) = (10×9×8)/(3×2×1) = 120."}
    ]}},
  agro:{title:'IAV – ENAM – ENCSK',badge:'🌿 IAV & ENAM',
    annales:{title:'📄 Annales IAV/ENAM',desc:'Annales IAV Hassan II, ENAM et ENCSK.',stats:[{n:'40+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],
      files:[{name:'Sujet IAV Hassan II – SVT 2024',size:'1.0 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Correction IAV 2024',size:'0.9 MB',type:'PDF',icon:'📋',color:'di-green'},{name:'Annales IAV/ENAM 2019-2023',size:'4.2 MB',type:'PDF',icon:'📚',color:'di-purple'}]},
    qcm:{questions:[
      {q:"La photosynthèse se déroule dans :",opts:["La mitochondrie","Le chloroplaste","Le noyau","La vacuole"],correct:1,expl:"Chloroplaste : phase claire (thylakoïdes) + Calvin (stroma)."},
      {q:"NPK désigne :",opts:["Azote, Potassium, Calcium","Azote, Phosphore, Potassium","Nitrate, Phosphate, Calcium","Nitrogène, Potassium, Carbone"],correct:1,expl:"N=Azote, P=Phosphore, K=Potassium — 3 macronutriments essentiels."},
      {q:"La méiose produit :",opts:["2 cellules diploïdes","4 cellules diploïdes","2 cellules haploïdes","4 cellules haploïdes"],correct:3,expl:"4 cellules haploïdes (n) pour reproduction sexuée."},
      {q:"Bilan ATP respiration cellulaire complète ≈",opts:["2 ATP","8 ATP","38 ATP","100 ATP"],correct:2,expl:"Glycolyse(2)+Krebs(2)+Chaîne respiratoire(34) ≈ 36-38 ATP."},
      {q:"Sol argileux est caractérisé par :",opts:["Forte CEC, drainage rapide","Faible CEC, drainage lent","Forte CEC, drainage lent","Faible CEC, drainage rapide"],correct:2,expl:"Argile → forte CEC et drainage lent (texture fine)."}
    ]}}
};

function openConcoursModule(filiere,type){
  concoursCurrent={filiere,type};
  const data=CONCOURS_DATA[filiere],typeData=data[type]||data['annales'];
  document.getElementById('conc-main-view').classList.add('hidden');
  document.getElementById('conc-sub-page').classList.add('active');
  document.getElementById('conc-bc').textContent=data.title;
  document.getElementById('conc-sub-badge').textContent=data.badge;
  document.getElementById('conc-sub-title').textContent=typeData.title;
  document.getElementById('conc-sub-desc').textContent=typeData.desc;
  document.getElementById('conc-sub-stats').innerHTML=(typeData.stats||[]).map(s=>`<div class="conc-stat"><div class="conc-stat-num">${s.n}</div><div class="conc-stat-lbl">${s.l}</div></div>`).join('');
  const heroColors={med:'linear-gradient(135deg,#1f0707,#450a0a)',ing:'linear-gradient(135deg,#061129,#0c1f4d)',adm:'linear-gradient(135deg,#1c1402,#473305)',encg:'linear-gradient(135deg,#001a0e,#003d1e)',agro:'linear-gradient(135deg,#0e0320,#2a0a5e)'};
  document.getElementById('conc-sub-hero').style.background=heroColors[filiere];
  const files=typeData.files||[];
  document.getElementById('conc-sub-drive-count').textContent=files.length+(files.length===1?' fichier':' fichiers');
  document.getElementById('conc-sub-drive-list').innerHTML=files.length
    ?files.map(d=>`<div class="drive-item"><div class="di-ico ${d.color}">${d.icon}</div><div class="di-info"><div class="di-name">${d.name}</div><div class="di-meta">${d.type} • ${d.size}</div></div><button class="di-btn" onclick="showToast('📥 Téléchargement de «${d.name.replace(/'/g,'')}»')">📥 Télécharger</button></div>`).join('')
    :'<div style="text-align:center;padding:28px;color:var(--t3);border:1px dashed var(--b1);border-radius:12px">Aucun fichier pour cette section.</div>';
  ytLoad();ytRender('concours');
  const qcmSec=document.getElementById('conc-qcm-section');
  if(type==='qcm'&&data.qcm?.questions?.length){qcmSec.style.display='block';document.getElementById('conc-qcm-sub').textContent='Questions type concours '+data.title;initConcoursQCM()}
  else qcmSec.style.display='none';
  window.scrollTo(0,0);
}
function backToConcours(){document.getElementById('conc-main-view').classList.remove('hidden');document.getElementById('conc-sub-page').classList.remove('active');document.getElementById('conc-bc').textContent='Prépa Concours'}

function initConcoursQCM(){
  const qs=[...CONCOURS_DATA[concoursCurrent.filiere].qcm.questions].sort(()=>Math.random()-.5);
  concQCMState={questions:qs,current:0,score:0,answers:Array(qs.length).fill(null),_pending:null};
  document.getElementById('conc-qcm-finish').classList.remove('show');
  renderConcQCMDots();renderConcQCMQuestion();updateConcQCMScore();
}
function renderConcQCMDots(){const d=document.getElementById('conc-qcm-dots');if(!d)return;d.innerHTML=concQCMState.questions.map((_,i)=>{let c='qcm-dot';if(i===concQCMState.current)c+=' curr';else if(concQCMState.answers[i]!==null)c+=concQCMState.answers[i]===concQCMState.questions[i].correct?' ok':' ko';return`<div class="${c}"></div>`}).join('')}
function renderConcQCMQuestion(){
  const area=document.getElementById('conc-qcm-area');if(!area)return;
  if(concQCMState.current>=concQCMState.questions.length){area.innerHTML='';showConcQCMFinish();return}
  const q=concQCMState.questions[concQCMState.current],answered=concQCMState.answers[concQCMState.current]!==null;
  area.innerHTML=`<div class="qcm-question-card"><div class="qcm-q-num">Question ${concQCMState.current+1} / ${concQCMState.questions.length}</div><div class="qcm-q-text">${q.q}</div><div class="qcm-options">${q.opts.map((opt,i)=>{let cls='qcm-opt';if(answered){if(i===q.correct)cls+=' correct';else if(i===concQCMState.answers[concQCMState.current])cls+=' wrong';}return`<div class="${cls}" onclick="selectConcQCM(${i})" id="cqcm-opt-${i}"><div class="qcm-opt-letter">${['A','B','C','D'][i]}</div><div class="qcm-opt-text">${opt}</div></div>`}).join('')}</div><div class="qcm-expl ${answered?'show':''}"><strong>✅ Explication :</strong> ${q.expl}</div><div class="qcm-actions"><button class="qcm-submit" onclick="submitConcQCM()" ${answered?'disabled style="opacity:.4;pointer-events:none"':''}>✓ Valider</button><button class="qcm-next ${answered?'show':''}" onclick="nextConcQCM()">${concQCMState.current<concQCMState.questions.length-1?'Suivante →':'Résultats →'}</button></div></div>`;
}
function selectConcQCM(idx){if(concQCMState.answers[concQCMState.current]!==null)return;document.querySelectorAll('[id^="cqcm-opt-"]').forEach(o=>o.classList.remove('selected'));document.getElementById('cqcm-opt-'+idx)?.classList.add('selected');concQCMState._pending=idx}
function submitConcQCM(){if(concQCMState._pending==null){showToast('⚠️ Sélectionne une réponse !');return}const q=concQCMState.questions[concQCMState.current];concQCMState.answers[concQCMState.current]=concQCMState._pending;if(concQCMState._pending===q.correct){concQCMState.score++;showToast('✅ Bonne réponse !');confetti({particleCount:40,spread:40,origin:{y:.6},colors:['#00b87a','#1a6aff']})}else showToast('❌ Mauvaise réponse !');concQCMState._pending=null;updateConcQCMScore();renderConcQCMDots();renderConcQCMQuestion()}
function nextConcQCM(){concQCMState.current++;concQCMState._pending=null;renderConcQCMDots();renderConcQCMQuestion()}
function updateConcQCMScore(){const a=concQCMState.answers.filter(x=>x!==null).length;const el=document.getElementById('conc-qcm-score');if(el){el.textContent=concQCMState.score+' / '+a;el.style.color=concQCMState.score===a&&a>0?'var(--green)':'var(--t1)'}}
function showConcQCMFinish(){
  const fin=document.getElementById('conc-qcm-finish');if(!fin)return;fin.classList.add('show');
  const pct=Math.round((concQCMState.score/concQCMState.questions.length)*100);
  document.getElementById('conc-qcm-finish-score').textContent=concQCMState.score+'/'+concQCMState.questions.length;
  let ico='😤',lbl='Continue à travailler !',col='var(--red)';
  if(pct>=80){ico='🏆';lbl='Excellent ! Tu es prêt(e).';col='var(--green)'}else if(pct>=60){ico='👍';lbl='Bien ! Revois les erreurs.';col='var(--gold)'}else if(pct>=40){ico='📚';lbl='À revoir — utilise l\'Advisor IA !';col='var(--gold)'}
  document.getElementById('conc-qcm-finish-ico').textContent=ico;document.getElementById('conc-qcm-finish-lbl').textContent=lbl;document.getElementById('conc-qcm-finish-score').style.color=col;
  if(pct>=80)confetti({particleCount:120,spread:70,origin:{y:.5},colors:['#00b87a','#1a6aff','#7c4dff','#e09000']});
}

/* ── DASHBOARD ── */
function initDashboard(){
  const u=currentUser;
  document.getElementById('navAvatar').textContent=u.initials||initials(u.name);
  document.getElementById('navName').textContent=u.name;
  document.getElementById('dashWelcome').textContent='Bonjour, '+u.name.split(' ')[0]+' 👋';
  tcData=getTCData();if(!tcData||!tcData.initialized){tcData=generateDefaultTC();saveTCData(tcData)}
  tcCheckDayReset();
  const todayH=Math.round((tcData.todaySeconds||0)/360)/10;
  const totalH=(tcData.history||[]).reduce((s,h)=>s+h.hours,0).toFixed(1);
  const realH=(tcData.history||[]).filter(h=>!h.simulated).reduce((s,h)=>s+h.hours,0).toFixed(1);
  const avg=tcData.history.length?(tcData.history.reduce((s,h)=>s+h.hours,0)/tcData.history.length).toFixed(1):'--';
  const target=tcData.todayTarget||6;
  document.getElementById('ds-total').textContent=totalH+' h';document.getElementById('ds-today').textContent='Aujourd\'hui : '+todayH+'h';
  document.getElementById('ds-streak').textContent=(tcData.loggingStreak||1)+' jours';document.getElementById('ds-vs').textContent='Victory streak : '+(tcData.victoryStreak||0);
  document.getElementById('ds-target').textContent=target.toFixed(1)+' h';document.getElementById('ds-avg').textContent=avg+' h';document.getElementById('ds-real').textContent='Total réel : '+realH+'h';
  document.getElementById('cm-target-num').textContent=target.toFixed(1);document.getElementById('cm-actual').textContent=todayH+' h';document.getElementById('cm-bar').style.width=Math.min(100,(todayH/target)*100)+'%';
  renderDashChart();
}
function renderDashChart(){
  const ctx=document.getElementById('dashChart').getContext('2d');
  if(dashChart)dashChart.destroy();
  const hist=(tcData.history||[]).slice(-14),fore=(tcData.forecast||[]).slice(0,5);
  const allD=[...new Set([...hist.map(h=>h.date),...fore.map(f=>f.date)])].sort();
  const hv=allD.map(d=>{const h=hist.find(x=>x.date===d);return h?h.hours:null});
  const fv=allD.map(d=>{const f=fore.find(x=>x.date===d);return f?f.hours:null});
  const lbs=allD.map(d=>{const dt=new Date(d);return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})});
  const gA=ctx.createLinearGradient(0,0,0,196);gA.addColorStop(0,'rgba(0,184,122,.16)');gA.addColorStop(1,'rgba(0,184,122,0)');
  const gF=ctx.createLinearGradient(0,0,0,196);gF.addColorStop(0,'rgba(26,106,255,.1)');gF.addColorStop(1,'rgba(26,106,255,0)');
  dashChart=new Chart(ctx,{type:'line',data:{labels:lbs,datasets:[{label:'Focus Réel',data:hv,borderColor:'#00b87a',borderWidth:2.5,pointBackgroundColor:'#00b87a',backgroundColor:gA,fill:true,tension:.35,spanGaps:true},{label:'Prévision',data:fv,borderColor:'#1a6aff',borderWidth:2.5,borderDash:[5,5],pointBackgroundColor:'#1a6aff',backgroundColor:gF,fill:true,tension:.35,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,0,0,.05)'},ticks:{color:'#8aa0b8',font:{size:10}}},y:{grid:{color:'rgba(0,0,0,.05)'},ticks:{color:'#8aa0b8',font:{size:10}},suggestedMin:0,suggestedMax:12}}}});
}

/* ── TIME CHALLENGER ── */
function getTCData(){try{return JSON.parse(localStorage.getItem(KEY_TC)||'null')}catch{return null}}
function saveTCData(d){localStorage.setItem(KEY_TC,JSON.stringify(d))}
function tcRandNorm(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function generateDefaultTC(){
  const minH=4,maxH=8,mean=6,std=1.2,history=[],today=new Date();
  for(let i=30;i>=1;i--){const d=new Date(today);d.setDate(today.getDate()-i);history.push({date:d.toISOString().split('T')[0],hours:Math.max(.5,Math.min(12,mean+tcRandNorm()*std)),simulated:true})}
  const forecast=genForecast(history,minH,maxH);
  return{initialized:true,minH,maxH,history,forecast,todaySeconds:0,todayTarget:forecast[0]?.hours||6,loggingStreak:1,victoryStreak:0,lastDate:today.toISOString().split('T')[0]};
}
function genForecast(history,minH,maxH,days=7){
  const mean=(minH+maxH)/2,recent=history.slice(-10).map(h=>h.hours);
  const wAvg=recent.reduce((s,h,i)=>s+h*(i+1),0)/recent.reduce((s,_,i)=>s+(i+1),0);
  const forecast=[],today=new Date();
  for(let i=0;i<days;i++){const d=new Date(today);d.setDate(today.getDate()+i);forecast.push({date:d.toISOString().split('T')[0],hours:Math.max(.5,Math.min(12,(wAvg*.7+mean*.3)+tcRandNorm()*.4))})}
  return forecast;
}
function tcCheckDayReset(){
  if(!tcData)return;
  const today=new Date().toISOString().split('T')[0];
  if(tcData.lastDate!==today){
    const yH=Math.round((tcData.todaySeconds||0)/360)/10;
    if(yH>0){tcData.history.push({date:tcData.lastDate,hours:yH,simulated:false});tcData.loggingStreak=(tcData.loggingStreak||0)+1;const yF=tcData.forecast.find(f=>f.date===tcData.lastDate);if(yF&&yH>=yF.hours)tcData.victoryStreak=(tcData.victoryStreak||0)+1;else tcData.victoryStreak=0;tcData.forecast=genForecast(tcData.history,tcData.minH,tcData.maxH,7)}
    tcData.todaySeconds=0;tcData.lastDate=today;const tf=tcData.forecast.find(f=>f.date===today);tcData.todayTarget=tf?Math.round(tf.hours*10)/10:6;saveTCData(tcData);miniSwAccSec=0;
  }else{miniSwAccSec=tcData.todaySeconds||0}
  updateMiniComparison();
}

/* ── PACKS ── */
const SECTION_META={
  drives:{heroClass:'ph-drives',pill:'📂 Drives de Cours',title:'Drives de Cours',desc:'Tous les cours organisés par matière et semestre.',s1:'8',l1:'Matières',s2:'340+',l2:'Fichiers',s3:'S1-S2',l3:'Semestres',filters:['Tout','Maths','Physique','Info','Chimie','Français']},
  videos:{heroClass:'ph-videos',pill:'🎬 Vidéos & Exercices',title:'Vidéos Pédagogiques',desc:'120+ vidéos en Darija & Français.',s1:'120+',l1:'Vidéos',s2:'6',l2:'Matières',s3:'100%',l3:'Gratuit',filters:['Tout','Analyse','Algèbre','Physique','Informatique']},
  exams:{heroClass:'ph-exams',pill:'📝 Examens',title:'Examens & Contrôles',desc:'5 années d\'examens avec corrections vidéo.',s1:'5 ans',l1:'Années',s2:'100%',l2:'Corrigés',s3:'PDF+▶',l3:'Format',filters:['Tout','2024','2023','2022','Rattrapage']}
};
const modulesData={
  drives:[
    {title:'Analyse – Fonctions & Suites S1',subject:'MATHÉMATIQUES',thumb:'mt-blue',emoji:'📐',level:'Semestre 1',tags:['maths'],meta:'142 pages • 5 chapitres',drives:[{name:'Cours complet – Analyse S1',size:'3.2 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Série exercices – Limites',size:'1.1 MB',type:'PDF',icon:'📋',color:'di-green'},{name:'Fiche de révision',size:'0.4 MB',type:'PDF',icon:'📌',color:'di-purple'}]},
    {title:'Algèbre Linéaire Complète S1',subject:'MATHÉMATIQUES',thumb:'mt-blue',emoji:'🔢',level:'Semestre 1',tags:['maths'],meta:'98 pages • 4 chapitres',drives:[{name:'Cours Algèbre Linéaire',size:'2.8 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'TD Espaces Vectoriels',size:'1.4 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Mécanique Newtonienne S1',subject:'PHYSIQUE',thumb:'mt-purple',emoji:'⚡',level:'Semestre 1',tags:['physique'],meta:'87 pages • 4 chapitres',drives:[{name:'Cours Mécanique',size:'2.5 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Exercices résolus',size:'1.8 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Électromagnétisme S2',subject:'PHYSIQUE',thumb:'mt-purple',emoji:'🔬',level:'Semestre 2',tags:['physique'],meta:'115 pages • 6 chapitres',drives:[{name:'Cours EM Vol. 1',size:'3.0 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Exercices corrigés',size:'2.1 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Algorithmique & Structures S1',subject:'INFORMATIQUE',thumb:'mt-green',emoji:'💻',level:'Semestre 1',tags:['info'],meta:'73 pages • 5 chapitres',drives:[{name:'Poly Algo & Structures',size:'2.2 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'TP corrigés',size:'1.6 MB',type:'PDF',icon:'💻',color:'di-purple'}]},
    {title:'Chimie Organique S2',subject:'CHIMIE',thumb:'mt-gold',emoji:'⚗️',level:'Semestre 2',tags:['chimie'],meta:'91 pages • 4 chapitres',drives:[{name:'Cours Chimie Organique',size:'2.9 MB',type:'PDF',icon:'📄',color:'di-blue'}]},
    {title:'Thermodynamique Appliquée S2',subject:'PHYSIQUE',thumb:'mt-purple',emoji:'🌡️',level:'Semestre 2',tags:['physique'],meta:'66 pages • 3 chapitres',drives:[{name:'Cours Thermodynamique',size:'2.0 MB',type:'PDF',icon:'📄',color:'di-blue'}]},
    {title:'Français – Méthodologie',subject:'FRANÇAIS',thumb:'mt-red',emoji:'📝',level:'CPGE',tags:['français'],meta:'44 pages',drives:[{name:'Méthodologie Dissertation',size:'0.8 MB',type:'PDF',icon:'📄',color:'di-blue'}]}
  ],
  videos:[
    {title:'Dérivation & Intégration – Série',subject:'ANALYSE',thumb:'mt-blue',emoji:'📈',level:'S1',tags:['analyse'],meta:'12 vidéos • 4h20',drives:[]},
    {title:'Espaces Vectoriels – Bases',subject:'ALGÈBRE',thumb:'mt-purple',emoji:'🔷',level:'S1',tags:['algèbre'],meta:'8 vidéos • 3h05',drives:[]},
    {title:'Optique Géométrique – Lentilles',subject:'PHYSIQUE',thumb:'mt-green',emoji:'🔭',level:'S1',tags:['physique'],meta:'6 vidéos • 2h15',drives:[]},
    {title:'Complexité Algorithmique',subject:'INFORMATIQUE',thumb:'mt-gold',emoji:'⚙️',level:'S2',tags:['informatique'],meta:'5 vidéos • 1h45',drives:[]},
    {title:'Séries Entières – Convergence',subject:'ANALYSE',thumb:'mt-blue',emoji:'∞',level:'S2',tags:['analyse'],meta:'7 vidéos • 2h50',drives:[]},
    {title:'Électrostatique – Potentiel',subject:'PHYSIQUE',thumb:'mt-purple',emoji:'⚡',level:'S2',tags:['physique'],meta:'9 vidéos • 3h30',drives:[]}
  ],
  exams:[
    {title:'Examen Final Maths – Juin 2024',subject:'MATHS 2024',thumb:'mt-blue',emoji:'📝',level:'2024',tags:['2024'],meta:'Corrigé vidéo inclus',drives:[{name:'Sujet Examen Maths Juin 2024',size:'0.6 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Correction complète PDF',size:'0.9 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Contrôle Physique – S1 2024',subject:'PHYSIQUE 2024',thumb:'mt-purple',emoji:'📋',level:'2024',tags:['2024'],meta:'Corrigé vidéo S1',drives:[{name:'Sujet Contrôle Physique S1',size:'0.5 MB',type:'PDF',icon:'📄',color:'di-blue'}]},
    {title:'Rattrapage Analyse 2023',subject:'MATHS 2023',thumb:'mt-green',emoji:'🔁',level:'Rattrapage',tags:['rattrapage'],meta:'Corrigé inclus',drives:[{name:'Sujet Rattrapage Analyse',size:'0.4 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Correction Rattrapage',size:'0.7 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Examen Chimie Juin 2023',subject:'CHIMIE 2023',thumb:'mt-gold',emoji:'⚗️',level:'2023',tags:['2023'],meta:'Corrigé PDF',drives:[{name:'Sujet Chimie 2023',size:'0.5 MB',type:'PDF',icon:'📄',color:'di-blue'}]},
    {title:'Partiel Informatique S2 2024',subject:'INFO 2024',thumb:'mt-green',emoji:'💻',level:'2024',tags:['2024'],meta:'Corrigé code',drives:[{name:'Sujet Info S2',size:'0.3 MB',type:'PDF',icon:'📄',color:'di-blue'}]},
    {title:'Examen Physique Final 2022',subject:'PHYSIQUE 2022',thumb:'mt-purple',emoji:'⚡',level:'2022',tags:['2022'],meta:'Corrigé vidéo',drives:[{name:'Sujet Physique 2022',size:'0.6 MB',type:'PDF',icon:'📄',color:'di-blue'}]}
  ]
};
let activeFilter='Tout';
function initPacks(section){
  const m=SECTION_META[section];if(!m)return;
  document.getElementById('bc-section').textContent=m.title;
  const hero=document.getElementById('packs-hero');hero.className='packs-hero '+m.heroClass;
  document.getElementById('ph-pill').textContent=m.pill;document.getElementById('ph-title').textContent=m.title;document.getElementById('ph-desc').textContent=m.desc;
  document.getElementById('ph-s1').textContent=m.s1;document.getElementById('ph-l1').textContent=m.l1;document.getElementById('ph-s2').textContent=m.s2;document.getElementById('ph-l2').textContent=m.l2;document.getElementById('ph-s3').textContent=m.s3;document.getElementById('ph-l3').textContent=m.l3;
  const fb=document.getElementById('pack-filters');fb.innerHTML=m.filters.map(f=>`<button class="filt-btn ${f==='Tout'?'active':''}" onclick="setFilter('${f}',this)">${f}</button>`).join('');
  activeFilter='Tout';document.getElementById('pack-search').value='';renderModules();
}
function setFilter(f,btn){activeFilter=f;document.querySelectorAll('#pack-filters .filt-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderModules()}
function renderModules(){
  const search=document.getElementById('pack-search').value.toLowerCase();
  const items=(modulesData[currentSection]||[]).filter(m=>{
    const mf=activeFilter==='Tout'||m.tags.some(t=>t.toLowerCase()===activeFilter.toLowerCase());
    const ms=m.title.toLowerCase().includes(search)||m.subject.toLowerCase().includes(search);
    return mf&&ms;
  });
  const grid=document.getElementById('module-grid');
  if(!items.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--t3)">Aucun résultat 🔍</div>';return}
  grid.innerHTML=items.map(m=>{
    const realIdx=modulesData[currentSection].indexOf(m);
    return`<div class="mod-card animate-in" onclick="openModule('${currentSection}',${realIdx})" style="animation-delay:${realIdx*.05}s">
      <div class="mod-thumb ${m.thumb}"><span>${m.emoji}</span><div class="mod-lvl">${m.level}</div><div class="mod-free">Gratuit</div></div>
      <div class="mod-body"><div class="mod-subj">${m.subject}</div><div class="mod-title">${m.title}</div><div class="mod-meta">📄 ${m.meta}</div><button class="mod-cta">📖 Étudier ce module →</button></div>
    </div>`;
  }).join('');
}

/* ── STUDY ZONE ── */
const TIPS=['La technique Pomodoro (25min focus + 5min pause) améliore la concentration.','Explique le concept à voix haute — méthode Feynman !','Fais des pauses toutes les 90 minutes : cycles ultradiens.','Commence par la tâche la plus difficile (Eat the Frog) le matin.','Révise dans les 24h suivant l\'apprentissage pour maximiser la rétention.','Le sommeil consolide la mémoire : 7-8h par nuit est essentiel.','Alterne les sujets pour stimuler différentes zones du cerveau.'];
function initStudy(){
  const m=currentModule;if(!m)return;
  document.getElementById('study-module-name').textContent=m.title;
  const drives=m.drives||[];
  document.getElementById('drive-count').textContent=drives.length+(drives.length===1?' fichier':' fichiers');
  document.getElementById('drive-list').innerHTML=drives.length
    ?drives.map(d=>`<div class="drive-item"><div class="di-ico ${d.color}">${d.icon}</div><div class="di-info"><div class="di-name">${d.name}</div><div class="di-meta">${d.type} • ${d.size}</div></div><button class="di-btn" onclick="showToast('📥 Téléchargement de «${d.name.replace(/'/g,'')}»')">📥 Télécharger</button></div>`).join('')
    :'<div style="text-align:center;padding:28px;color:var(--t3);border:1px dashed var(--b1);border-radius:var(--r2)">Aucun fichier drive.</div>';
  ytLoad();ytRender('study');
  switchPratique('qcm');initQCM();renderExercices();
  const progs=[{n:'Cours',p:75,ico:'📖',c:'rgba(26,106,255,.7)'},{n:'Exercices',p:40,ico:'✏️',c:'rgba(0,184,122,.7)'},{n:'Révision',p:20,ico:'🔄',c:'rgba(224,144,0,.7)'}];
  document.getElementById('prog-items').innerHTML=progs.map(p=>`<div class="prog-item"><div class="prog-ico">${p.ico}</div><div class="prog-body"><div class="prog-name">${p.n}</div><div class="prog-bar-wrap"><div class="prog-bar-in" style="width:${p.p}%;background:${p.c}"></div></div></div><span style="font-size:.73rem;font-weight:700;color:var(--t3);flex-shrink:0">${p.p}%</span></div>`).join('');
  document.getElementById('tip-card').textContent=TIPS[Math.floor(Math.random()*TIPS.length)];
  tcData=getTCData();if(!tcData||!tcData.initialized){tcData=generateDefaultTC();saveTCData(tcData)}
  tcCheckDayReset();document.getElementById('mini-streak').textContent='Streak: '+(tcData.loggingStreak||1)+'j';document.getElementById('mini-obj').textContent=(tcData.todayTarget||6).toFixed(1)+' h';
  miniReset(true);updateMiniComparison();
}
function switchPratique(mode){document.getElementById('pratique-qcm').style.display=mode==='qcm'?'block':'none';document.getElementById('pratique-exo').style.display=mode==='exo'?'block':'none';document.getElementById('tab-qcm').classList.toggle('active',mode==='qcm');document.getElementById('tab-exo').classList.toggle('active',mode==='exo')}

const QCM_BANK=[
  {q:"Limite de (sin x)/x quand x → 0 ?",opts:["0","∞","1","Indéfinie"],correct:2,expl:"Limite fondamentale : lim(x→0) sin(x)/x = 1."},
  {q:"Suite croissante et majorée est :",opts:["Divergente","Convergente","Oscillante","Non déterminée"],correct:1,expl:"Tout suite monotone et bornée est convergente (théorème fondamental)."},
  {q:"Dérivée de ln(x) pour x > 0 :",opts:["ln(x)/x","1/x","x·ln(x)","e^x"],correct:1,expl:"(ln x)' = 1/x. Formule fondamentale."},
  {q:"Un espace vectoriel doit contenir :",opts:["Au moins 2 vecteurs non nuls","Le vecteur nul","Une base orthonormée","Un sous-espace de dimension 1"],correct:1,expl:"Tout espace vectoriel contient le vecteur nul (élément neutre)."},
  {q:"Complexité tri par insertion (pire cas) :",opts:["O(n log n)","O(n)","O(n²)","O(log n)"],correct:2,expl:"Pire cas (tableau inversé) : O(n²)."},
  {q:"F = ma en unités SI :",opts:["kg·m/s","kg·m/s²","N·s","kg²/m"],correct:1,expl:"N = kg·m/s² — définition du Newton."},
  {q:"Groupe -OH : caractéristique de :",opts:["Acides carboxyliques","Alcools","Cétones","Aldéhydes"],correct:1,expl:"-OH sur carbone sp³ = alcool (ex: éthanol)."},
  {q:"ΔU (1er principe thermodynamique) = ...",opts:["W - Q","Q + W","Q × W","Q / W"],correct:1,expl:"ΔU = Q + W (convention IUPAC)."}
];
let qcmState={questions:[],current:0,score:0,answers:[],_pending:null};
function initQCM(){const s=[...QCM_BANK].sort(()=>Math.random()-.5).slice(0,5);qcmState={questions:s,current:0,score:0,answers:Array(s.length).fill(null),_pending:null};document.getElementById('qcm-finish').classList.remove('show');renderQCMDots();renderQCMQuestion();updateQCMScore()}
function renderQCMDots(){const d=document.getElementById('qcm-dots');if(!d)return;d.innerHTML=qcmState.questions.map((_,i)=>{let c='qcm-dot';if(i===qcmState.current)c+=' curr';else if(qcmState.answers[i]!==null)c+=qcmState.answers[i]===qcmState.questions[i].correct?' ok':' ko';return`<div class="${c}"></div>`}).join('')}
function renderQCMQuestion(){
  const area=document.getElementById('qcm-question-area');if(!area)return;
  if(qcmState.current>=qcmState.questions.length){area.innerHTML='';showQCMFinish();return}
  const q=qcmState.questions[qcmState.current],answered=qcmState.answers[qcmState.current]!==null;
  area.innerHTML=`<div class="qcm-question-card"><div class="qcm-q-num">Question ${qcmState.current+1} / ${qcmState.questions.length}</div><div class="qcm-q-text">${q.q}</div><div class="qcm-options">${q.opts.map((opt,i)=>{let cls='qcm-opt';if(answered){if(i===q.correct)cls+=' correct';else if(i===qcmState.answers[qcmState.current])cls+=' wrong';}return`<div class="${cls}" onclick="selectQCMAnswer(${i})" id="qcm-opt-${i}"><div class="qcm-opt-letter">${['A','B','C','D'][i]}</div><div class="qcm-opt-text">${opt}</div></div>`}).join('')}</div><div class="qcm-expl ${answered?'show':''}"><strong>✅ Explication :</strong> ${q.expl}</div><div class="qcm-actions"><button class="qcm-submit" onclick="submitQCM()" ${answered?'disabled style="opacity:.4;pointer-events:none"':''}>✓ Valider</button><button class="qcm-next ${answered?'show':''}" onclick="nextQCM()">${qcmState.current<qcmState.questions.length-1?'Question suivante →':'Voir résultats →'}</button></div></div>`;
}
function selectQCMAnswer(idx){if(qcmState.answers[qcmState.current]!==null)return;document.querySelectorAll('.qcm-opt').forEach(o=>o.classList.remove('selected'));document.getElementById('qcm-opt-'+idx)?.classList.add('selected');qcmState._pending=idx}
function submitQCM(){if(qcmState._pending==null){showToast('⚠️ Sélectionne une réponse !');return}const q=qcmState.questions[qcmState.current];qcmState.answers[qcmState.current]=qcmState._pending;if(qcmState._pending===q.correct){qcmState.score++;showToast('✅ Bonne réponse !');confetti({particleCount:40,spread:40,origin:{y:.6}})}else showToast('❌ Mauvaise réponse !');qcmState._pending=null;updateQCMScore();renderQCMDots();renderQCMQuestion()}
function nextQCM(){qcmState.current++;qcmState._pending=null;renderQCMDots();renderQCMQuestion()}
function updateQCMScore(){const a=qcmState.answers.filter(x=>x!==null).length;const el=document.getElementById('qcm-score-val');if(el){el.textContent=qcmState.score+' / '+a;el.style.color=qcmState.score===a&&a>0?'var(--green)':'var(--t1)'}}
function showQCMFinish(){const fin=document.getElementById('qcm-finish');if(!fin)return;fin.classList.add('show');const pct=Math.round((qcmState.score/qcmState.questions.length)*100);document.getElementById('qcm-finish-score').textContent=qcmState.score+'/'+qcmState.questions.length;let ico='😤',lbl='Continue !',col='var(--red)';if(pct>=80){ico='🏆';lbl='Excellent !';col='var(--green)'}else if(pct>=60){ico='👍';lbl='Bien !';col='var(--gold)'}else if(pct>=40){ico='📚';lbl='À revoir !';col='var(--gold)'}document.getElementById('qcm-finish-ico').textContent=ico;document.getElementById('qcm-finish-lbl').textContent=lbl;document.getElementById('qcm-finish-score').style.color=col;if(pct>=80)confetti({particleCount:120,spread:70,origin:{y:.5}})}

const EXERCICES_BANK=[
  {title:'Calcul de limites',tags:['Analyse','Limites'],diff:'facile',enonce:'<strong>Calculer :</strong><br>1) \\( \\lim_{x \\to +\\infty} \\frac{3x^2-2x+1}{x^2+x} \\)<br>2) \\( \\lim_{x \\to 0} \\frac{e^x-1}{x} \\)<br>3) \\( \\lim_{x \\to 1} \\frac{x^2-1}{x-1} \\)',solution:[{num:'1',text:'Diviser par \\( x^2 \\) → \\( \\frac{3-2/x+1/x^2}{1+1/x} \\to \\mathbf{3} \\)'},{num:'2',text:'Dérivée de \\( e^x \\) en 0 : \\( \\mathbf{1} \\)'},{num:'3',text:'\\( \\frac{(x+1)(x-1)}{x-1} = x+1 \\to \\mathbf{2} \\)'}]},
  {title:'Diagonalisation d\'une matrice',tags:['Algèbre','Matrices'],diff:'moyen',enonce:'<strong>\\( A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 3 \\end{pmatrix} \\)</strong><br>1) Valeurs propres. 2) Vecteurs propres. 3) Diagonalisable ?',solution:[{num:'1',text:'\\( \\lambda_1 = 2,\\; \\lambda_2 = 3 \\)'},{num:'2',text:'\\( v_1 = \\begin{pmatrix}1\\\\0\\end{pmatrix},\\; v_2 = \\begin{pmatrix}1\\\\1\\end{pmatrix} \\)'},{num:'3',text:'Deux VP distinctes → <strong>diagonalisable</strong>'}]},
  {title:'Mouvement d\'un projectile',tags:['Physique','Mécanique'],diff:'difficile',enonce:'<strong>\\( v_0 = 20 \\, m/s \\) à \\( 45° \\), \\( g = 10 \\, m/s^2 \\)</strong><br>1) Portée max. 2) Hauteur max. 3) Durée vol.',solution:[{num:'1',text:'\\( R = \\frac{v_0^2 \\sin 2\\theta}{g} = \\mathbf{40\\,m} \\)'},{num:'2',text:'\\( H = \\frac{v_0^2 \\sin^2\\theta}{2g} = \\mathbf{10\\,m} \\)'},{num:'3',text:'\\( T \\approx \\mathbf{2.83\\,s} \\)'}]}
];
function renderExercices(){
  const list=document.getElementById('exo-list');if(!list)return;
  list.innerHTML=EXERCICES_BANK.map((ex,i)=>`<div class="exo-card" id="exo-${i}"><div class="exo-card-head" onclick="toggleExo(${i})"><div class="exo-num">${i+1}</div><div class="exo-info"><div class="exo-title">${ex.title}</div><div class="exo-tags">${ex.tags.map(t=>`<span class="exo-tag">${t}</span>`).join('')}</div></div><span class="exo-diff ${ex.diff}">${ex.diff.charAt(0).toUpperCase()+ex.diff.slice(1)}</span><span class="exo-chevron">▼</span></div><div class="exo-body" id="exo-body-${i}"><div class="exo-enonce">${ex.enonce}</div><button class="exo-sol-btn" id="exo-sol-btn-${i}" onclick="toggleSolution(${i})">👁 Voir la correction</button><div class="exo-solution" id="exo-sol-${i}">${ex.solution.map(s=>`<div class="exo-step"><div class="exo-step-num">Partie ${s.num}</div>${s.text}</div>`).join('')}</div></div></div>`).join('');
  /* Rendu MathJax dans les exercices */
  if(window.MathJax&&MathJax.typesetPromise){MathJax.typesetPromise([list]).catch(e=>console.error(e))}
}
function toggleExo(i){const card=document.getElementById('exo-'+i),body=document.getElementById('exo-body-'+i);const o=card.classList.contains('open');card.classList.toggle('open',!o);body.classList.toggle('open',!o)}
function toggleSolution(i){const sol=document.getElementById('exo-sol-'+i),btn=document.getElementById('exo-sol-btn-'+i);const o=sol.classList.contains('show');sol.classList.toggle('show',!o);if(btn)btn.textContent=o?'👁 Voir la correction':'🙈 Masquer'}

/* ── YOUTUBE ── */
const YT_NS={};
function ytLoad(){try{const s=JSON.parse(localStorage.getItem(KEY_YT)||'{}');Object.assign(YT_NS,s)}catch{}}
function ytSave(){localStorage.setItem(KEY_YT,JSON.stringify(YT_NS))}
function ytExtractId(url){if(!url)return null;const m=url.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);if(m)return m[1];if(/^[a-zA-Z0-9_-]{11}$/.test(url.trim()))return url.trim();return null}
function ytToggle(id){const box=document.getElementById('yt-box-'+id),btn=document.getElementById('yt-toggle-'+id);const o=box.classList.contains('open');box.classList.toggle('open',!o);if(btn)btn.textContent=o?'+ Ajouter':'✕ Fermer'}
function ytAdd(id){
  const urlEl=document.getElementById('yt-url-'+id),titEl=document.getElementById('yt-title-'+id);if(!urlEl)return;
  const url=urlEl.value.trim(),title=(titEl?titEl.value.trim():'')||'Vidéo sans titre';
  if(!url){showToast('⚠️ Colle un lien YouTube');return}
  const vid=ytExtractId(url);if(!vid){showToast('❌ Lien YouTube invalide');return}
  if(!YT_NS[id])YT_NS[id]=[];
  YT_NS[id].push({id:vid,title,url:'https://www.youtube.com/watch?v='+vid});
  urlEl.value='';if(titEl)titEl.value='';
  ytSave();ytRender(id);showToast('✅ Vidéo ajoutée !');
  confetti({particleCount:60,spread:50,origin:{y:.7},colors:['#1a6aff','#7c4dff']});
}
function ytDelete(id,idx){if(!confirm('Supprimer cette vidéo ?'))return;YT_NS[id].splice(idx,1);ytSave();ytRender(id);showToast('🗑️ Vidéo supprimée')}
function ytPlay(id,idx,videoId){const pa=document.getElementById('ytp-'+id+'-'+idx);if(!pa||pa.classList.contains('active'))return;pa.innerHTML=`<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;pa.classList.add('active')}
function ytRender(id){
  const grid=document.getElementById('yt-grid-'+id),empty=document.getElementById('yt-empty-'+id),count=document.getElementById('yt-count-'+id);if(!grid)return;
  const items=YT_NS[id]||[];
  if(count)count.textContent=items.length+(items.length===1?' vidéo':' vidéos');
  if(!items.length){if(empty)empty.style.display='block';grid.innerHTML='';return}
  if(empty)empty.style.display='none';
  grid.innerHTML=items.map((v,i)=>`<div class="yt-card">
    <div class="yt-thumb" id="ytw-${id}-${i}" onclick="ytPlay('${id}',${i},'${v.id}')">
      <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" loading="lazy">
      <div class="yt-play-ov"><div class="yt-play-circle">▶</div></div>
      <div class="yt-player-area" id="ytp-${id}-${i}"></div>
    </div>
    <div class="yt-card-body">
      <div class="yt-card-lbl">YouTube</div>
      <div class="yt-card-title">${v.title}</div>
      <div class="yt-card-acts">
        <button class="yt-watch" onclick="window.open('${v.url}','_blank')">▶ Ouvrir</button>
        <button class="yt-del" onclick="ytDelete('${id}',${i})">🗑</button>
      </div>
    </div>
  </div>`).join('');
}

/* ── POMODORO ── */
let miniPomSec=25*60,miniPomTotal=25*60,miniPomRunning=false,miniPomInterval=null,miniSwAccSec=0;
const CIRC=2*Math.PI*56;
function miniPlay(){if(miniPomRunning)return;miniPomRunning=true;document.getElementById('mini-play').style.display='none';document.getElementById('mini-pause').style.display='flex';document.getElementById('mini-mode').textContent='En cours…';miniPomInterval=setInterval(()=>{miniPomSec--;updateMiniRing();const fc=document.getElementById('study-focus-chip');if(fc)fc.textContent='⏱ '+((miniSwAccSec+(miniPomTotal-miniPomSec))/3600).toFixed(1)+'h focus';if(miniPomSec<=0){clearInterval(miniPomInterval);miniPomRunning=false;miniSwAccSec+=miniPomTotal;if(tcData){tcData.todaySeconds=miniSwAccSec;saveTCData(tcData)}updateMiniComparison();showToast('🎉 Pomodoro terminé !');chime();confetti({particleCount:80,spread:60,origin:{y:.6}});miniReset(true)}},1000)}
function miniPause(){clearInterval(miniPomInterval);miniPomRunning=false;document.getElementById('mini-play').style.display='flex';document.getElementById('mini-pause').style.display='none';document.getElementById('mini-mode').textContent='En pause';if(tcData){tcData.todaySeconds=miniSwAccSec;saveTCData(tcData)}}
function miniReset(silent=false){clearInterval(miniPomInterval);miniPomRunning=false;miniPomSec=miniPomTotal;document.getElementById('mini-play').style.display='flex';document.getElementById('mini-pause').style.display='none';document.getElementById('mini-mode').textContent='Prêt';updateMiniRing()}
function updateMiniRing(){const m=Math.floor(miniPomSec/60),s=miniPomSec%60;const el=document.getElementById('mini-time');if(el)el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');const offset=CIRC-(miniPomSec/miniPomTotal)*CIRC;const ring=document.getElementById('mini-ring');if(ring){ring.style.strokeDasharray=CIRC+' '+CIRC;ring.style.strokeDashoffset=offset}}
function updateMiniComparison(){const accH=Math.round(miniSwAccSec/360)/10,target=tcData?.todayTarget||6;const el=document.getElementById('mini-acc');if(el)el.textContent=accH.toFixed(1)+'h';const pct=Math.min(100,(accH/target)*100);const bf=document.getElementById('mini-bar');if(bf)bf.style.width=pct+'%';const vEl=document.getElementById('mini-verdict');if(vEl){if(accH===0){vEl.textContent='Lance le minuteur pour commencer.';vEl.className='pomo-verdict'}else if(accH<target){vEl.textContent='Encore '+(target-accH).toFixed(1)+'h pour battre l\'objectif !';vEl.className='pomo-verdict'}else{vEl.textContent='🚀 Tu bats l\'objectif de '+(accH-target).toFixed(1)+'h !';vEl.className='pomo-verdict winning'}}}

/* ── UTILS ── */
let toastTimer;
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3200)}
function chime(){try{const ac=new(window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(523,ac.currentTime);o.frequency.setValueAtTime(659,ac.currentTime+.15);g.gain.setValueAtTime(.001,ac.currentTime);g.gain.exponentialRampToValueAtTime(.25,ac.currentTime+.06);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+1.2);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+1.4)}catch(e){}}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded',()=>{
  ytLoad();
  const session=getSession();
  if(session){currentUser=session;showPage('dashboard');initDashboard()}else showPage('login');
  updateMiniRing();
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey&&e.target.id==='advInput'){e.preventDefault();sendAdvMsg()}
    if(e.key==='Enter'&&(e.target.id==='emailInput'||e.target.id==='pwInput'||e.target.id==='nameInput'))handleAuth();
    if(e.key==='Escape'&&advOpen)closeAdvisor();
  });
});