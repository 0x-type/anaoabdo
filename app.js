/* ============================================================ STATE ============================================================ */
const KEY_USER='pl_user_v2',KEY_TC='pl_tc_v2',KEY_YT='pl_yt_v2';
let currentUser=null,authMode='login',currentSection='drives',currentModule=null,tcData=null,dashChart=null;
let concoursCurrent={filiere:null,type:null};
let concQCMState={questions:[],current:0,score:0,answers:[]};

/* ============================================================ AUTH ============================================================ */
function getSession(){try{return JSON.parse(sessionStorage.getItem(KEY_USER)||localStorage.getItem(KEY_USER)||'null')}catch{return null}}
function setSession(u){const s=JSON.stringify(u);sessionStorage.setItem(KEY_USER,s);localStorage.setItem(KEY_USER,s)}
function clearSession(){sessionStorage.removeItem(KEY_USER);localStorage.removeItem(KEY_USER)}
function getUsers(){try{return JSON.parse(localStorage.getItem('pl_users')||'{}')}catch{return{}}}
function saveUsers(u){localStorage.setItem('pl_users',JSON.stringify(u))}
function initials(name){return(name||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?'}
function switchTab(tab){authMode=tab;document.getElementById('tab-login').classList.toggle('active',tab==='login');document.getElementById('tab-register').classList.toggle('active',tab==='register');document.getElementById('nameGroup').style.display=tab==='register'?'block':'none';document.getElementById('submitTxt').textContent=tab==='login'?'Se connecter →':'Créer mon compte →';document.getElementById('errBanner').classList.remove('show')}
function handleGoogle(){processLogin({name:'Youssef El Amrani',email:'youssef@gmail.com',initials:'YE',provider:'google'})}
function demoLogin(){processLogin({name:'Étudiant Démo',email:'demo@prepalab.ma',initials:'ED',provider:'demo'})}
function handleAuth(){
  const email=document.getElementById('emailInput').value.trim(),pw=document.getElementById('pwInput').value,name=document.getElementById('nameInput').value.trim();
  let ok=true;
  ['emailErr','pwErr'].forEach(id=>document.getElementById(id).classList.remove('show'));
  document.getElementById('errBanner').classList.remove('show');
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){document.getElementById('emailErr').classList.add('show');ok=false}
  if(!pw||pw.length<6){document.getElementById('pwErr').classList.add('show');ok=false}
  if(!ok)return;
  const btn=document.getElementById('submitBtn');btn.classList.add('loading');
  setTimeout(()=>{
    const users=getUsers();
    if(authMode==='login'){const u=users[email];if(!u){btn.classList.remove('loading');showBannerErr('Aucun compte avec cet email.');return}if(u.password!==btoa(pw)){btn.classList.remove('loading');showBannerErr('Mot de passe incorrect.');return}btn.classList.remove('loading');processLogin({name:u.name,email,initials:initials(u.name),provider:'email'})}
    else{if(users[email]){btn.classList.remove('loading');showBannerErr('Compte existant avec cet email.');return}const n=name||email.split('@')[0];users[email]={name:n,email,password:btoa(pw)};saveUsers(users);btn.classList.remove('loading');processLogin({name:n,email,initials:initials(n),provider:'email'})}
  },750);
}
function showBannerErr(msg){document.getElementById('errMsg').textContent=msg;document.getElementById('errBanner').classList.add('show')}
function togglePw(){const i=document.getElementById('pwInput'),b=document.getElementById('eyeBtn');i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'👁':'🙈'}
function forgotPw(){const e=document.getElementById('emailInput').value.trim();showToast(e?'📧 Email envoyé à '+e:'✉️ Entre ton email d\'abord')}
function processLogin(user){
  currentUser=user;setSession(user);
  showToast('🎉 Bienvenue, '+user.name.split(' ')[0]+' !');
  setTimeout(()=>window.location.href='dashboard.html',600);
}
function logout(){clearSession();currentUser=null;window.location.href='login.html'}

/* ============================================================ ROUTING ============================================================ */
function showPage(id){window.location.href=id+'.html'}
function goPacks(section){
  currentSection=section;
  localStorage.setItem('pl_section',section);
  window.location.href='packs.html';
}
function goStudyZone(){
  if(!currentModule){const m=modulesData[currentSection];currentModule=m?m[0]:null}
  if(currentModule)localStorage.setItem('pl_module',JSON.stringify(currentModule));
  localStorage.setItem('pl_section',currentSection);
  window.location.href='study.html';
}
function openModule(section,idx){
  currentSection=section;
  currentModule=modulesData[section][idx];
  localStorage.setItem('pl_section',section);
  localStorage.setItem('pl_module',JSON.stringify(currentModule));
  window.location.href='study.html';
}

/* ============================================================ CONCOURS PAGE ============================================================ */
function initConcours(){
  document.getElementById('conc-bc').textContent='Prépa Concours';
  document.getElementById('conc-main-view').classList.remove('hidden');
  document.getElementById('conc-sub-page').classList.remove('active');
  filterConcours('all',document.querySelector('.conc-tab'));
  ytLoad();ytRender('concours');
}

function filterConcours(cat,btn){
  document.querySelectorAll('.conc-tab').forEach(t=>t.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.querySelectorAll('.sector-card').forEach(card=>{
    if(cat==='all'||card.dataset.cat===cat){card.style.display='flex'}
    else{card.style.display='none'}
  });
}

const CONCOURS_DATA={
  med:{
    title:'Médecine & Pharmacie',
    badge:'🩺 Médecine',
    annales:{
      title:'📄 Annales Médecine',
      desc:'Annales officielles des concours d\'accès aux Facultés de Médecine et Pharmacie du Maroc.',
      stats:[{n:'60+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],
      files:[
        {name:'Sujet Concours Médecine Casa 2024',size:'1.2 MB',type:'PDF',icon:'📄',color:'di-blue'},
        {name:'Correction SVT – Casa 2024',size:'0.9 MB',type:'PDF',icon:'📋',color:'di-green'},
        {name:'Sujet Médecine Rabat 2024',size:'1.1 MB',type:'PDF',icon:'📄',color:'di-blue'},
        {name:'Sujet Médecine Fès 2024',size:'1.0 MB',type:'PDF',icon:'📄',color:'di-blue'},
        {name:'Correction Physique-Chimie 2023',size:'0.8 MB',type:'PDF',icon:'📋',color:'di-green'},
        {name:'Sujet Médecine Casa 2023',size:'1.1 MB',type:'PDF',icon:'📄',color:'di-blue'},
        {name:'Annales compilées 2019-2023',size:'5.4 MB',type:'PDF',icon:'📚',color:'di-purple'}
      ]
    },
    videos:{
      title:'🎬 Vidéos Médecine',
      desc:'Corrections vidéo détaillées des épreuves SVT, Physique-Chimie et Mathématiques.',
      stats:[{n:'80+',l:'Vidéos'},{n:'4',l:'Matières'},{n:'Darija',l:'Langue'}],
      files:[]
    },
    qcm:{
      title:'🎯 QCM Médecine',
      desc:'Questions type concours — SVT, Physique-Chimie, Maths.',
      stats:[{n:'200+',l:'Questions'},{n:'3',l:'Matières'},{n:'Type',l:'Concours'}],
      files:[],
      questions:[
        {q:"En biologie cellulaire, l'ATP est produit principalement dans :",opts:["Le noyau","Les mitochondries","Le réticulum endoplasmique","Les ribosomes"],correct:1,expl:"Les mitochondries sont le siège de la respiration cellulaire (phosphorylation oxydative) qui produit la majorité de l'ATP cellulaire."},
        {q:"Quel est le pH du sang humain normal ?",opts:["6.8 – 7.0","7.0 – 7.2","7.35 – 7.45","7.5 – 7.8"],correct:2,expl:"Le pH sanguin normal est maintenu entre 7.35 et 7.45 (légèrement basique). Au-delà de ces limites on parle d'acidose ou alcalose."},
        {q:"La formule de l'aspirine (acide acétylsalicylique) est :",opts:["C₇H₆O₃","C₉H₈O₄","C₆H₁₂O₆","C₈H₁₀N₄O₂"],correct:1,expl:"L'aspirine est l'acide acétylsalicylique, de formule C₉H₈O₄ (MW ≈ 180 g/mol). C'est un anti-inflammatoire non stéroïdien (AINS)."},
        {q:"Combien de chromosomes contient une cellule somatique humaine normale ?",opts:["23","44","46","48"],correct:2,expl:"Une cellule somatique humaine est diploïde (2n) avec 46 chromosomes (23 paires). Les gamètes sont haploïdes avec 23 chromosomes."},
        {q:"L'hormone insuline est sécrétée par :",opts:["Les cellules alpha du pancréas","Les cellules bêta du pancréas","Le foie","La glande surrénale"],correct:1,expl:"L'insuline est sécrétée par les cellules bêta des îlots de Langerhans du pancréas. Elle régule la glycémie en favorisant la captation du glucose."}
      ]
    }
  },
  ing:{
    title:'Ingénieur (ENSA/ENSAM/UM6P)',
    badge:'⚙️ Ingénieur',
    annales:{
      title:'📄 Annales Ingénieur',
      desc:'Annales officielles ENSA, ENSAM, UM6P avec solutions détaillées.',
      stats:[{n:'50+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'3',l:'Matières'}],
      files:[
        {name:'Sujet ENSA – Maths 2024',size:'0.8 MB',type:'PDF',icon:'📄',color:'di-blue'},
        {name:'Correction ENSA Maths 2024',size:'1.0 MB',type:'PDF',icon:'📋',color:'di-green'},
        {name:'Sujet ENSAM Casa 2024',size:'0.9 MB',type:'PDF',icon:'📄',color:'di-blue'},
        {name:'Sujet UM6P 2024',size:'1.1 MB',type:'PDF',icon:'📄',color:'di-blue'},
        {name:'Correction Physique-Chimie ENSA 2023',size:'0.7 MB',type:'PDF',icon:'📋',color:'di-green'},
        {name:'Annales ENSA compilées 2019-2023',size:'4.8 MB',type:'PDF',icon:'📚',color:'di-purple'}
      ]
    },
    videos:{title:'🎬 Vidéos Ingénieur',desc:'Corrections vidéo Maths, Physique, Informatique pour les concours ingénieur.',stats:[{n:'60+',l:'Vidéos'},{n:'3',l:'Matières'},{n:'HD',l:'Qualité'}],files:[]},
    qcm:{
      title:'🎯 QCM Ingénieur',
      desc:'Questions type ENSA/ENSAM — Maths et Physique.',
      stats:[{n:'150+',l:'Questions'},{n:'2',l:'Matières'},{n:'Type',l:'Concours'}],
      files:[],
      questions:[
        {q:"L'intégrale ∫₀¹ x² dx est égale à :",opts:["1/2","1/3","1/4","2/3"],correct:1,expl:"∫₀¹ x² dx = [x³/3]₀¹ = 1/3 − 0 = 1/3. C'est une intégrale fondamentale à maîtriser."},
        {q:"En physique, la relation entre énergie cinétique et vitesse est :",opts:["Ec = mv","Ec = ½mv²","Ec = mv²","Ec = 2mv"],correct:1,expl:"L'énergie cinétique est Ec = ½mv² où m est la masse en kg et v la vitesse en m/s. L'énergie s'exprime en Joules (J)."},
        {q:"La dérivée de f(x) = e^(2x) est :",opts:["e^(2x)","2e^(2x)","e^x","2xe^(2x)"],correct:1,expl:"Par la règle de dérivation des fonctions composées : (e^(2x))' = 2·e^(2x). En général, (e^(ax))' = a·e^(ax)."},
        {q:"Dans un circuit RC série, la constante de temps τ est :",opts:["R+C","R/C","RC","R·C²"],correct:2,expl:"La constante de temps d'un circuit RC est τ = RC (en secondes, si R en Ω et C en F). Elle caractérise la vitesse de charge/décharge du condensateur."},
        {q:"Le rang d'une matrice 3×3 nulle est :",opts:["3","1","0","Indéfini"],correct:2,expl:"La matrice nulle n'a aucun pivot, donc son rang est 0. Le rang mesure la dimension de l'image de l'application linéaire associée."}
      ]
    }
  },
  adm:{
    title:'ENA & Administration',
    badge:'🏛️ ENA & Admin',
    annales:{title:'📄 Annales ENA',desc:'Annales ENA, Architecture et concours d\'administration publique.',stats:[{n:'40+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],files:[
      {name:'Sujet ENA – Culture G. 2024',size:'0.7 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Correction ENA 2024',size:'0.8 MB',type:'PDF',icon:'📋',color:'di-green'},
      {name:'Sujet ENA Archi 2023',size:'0.9 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Annales ENA 2019-2023',size:'3.5 MB',type:'PDF',icon:'📚',color:'di-purple'}
    ]},
    videos:{title:'🎬 Vidéos ENA',desc:'Culture générale, Français, Anglais — préparation complète.',stats:[{n:'40+',l:'Vidéos'},{n:'3',l:'Matières'},{n:'100%',l:'Corrigé'}],files:[]},
    qcm:{title:'🎯 QCM ENA',desc:'Culture générale, Logique, Français.',stats:[{n:'100+',l:'Questions'},{n:'3',l:'Domaines'},{n:'Type',l:'Concours'}],files:[],
      questions:[
        {q:"Quelle est la capitale du Maroc ?",opts:["Casablanca","Rabat","Fès","Marrakech"],correct:1,expl:"Rabat est la capitale administrative du Maroc depuis l'époque du Protectorat français. Casablanca est la capitale économique."},
        {q:"En quelle année le Maroc a-t-il accédé à l'indépendance ?",opts:["1952","1954","1956","1960"],correct:2,expl:"Le Maroc a obtenu son indépendance le 2 mars 1956, après la signature de la déclaration franco-marocaine mettant fin au Protectorat."},
        {q:"L'ONU compte actuellement :",opts:["150 membres","175 membres","193 membres","210 membres"],correct:2,expl:"L'ONU compte 193 États membres. Le dernier pays à rejoindre est le Soudan du Sud en 2011. La Palestine et le Vatican ont un statut d'observateur."},
        {q:"La Cour Constitutionnelle du Maroc est régie par la Constitution de :",opts:["1962","1992","1996","2011"],correct:3,expl:"La Constitution de 2011 a créé la Cour Constitutionnelle (remplaçant le Conseil Constitutionnel) suite au mouvement du 20 février et aux réformes du Printemps arabe."},
        {q:"Le PIB du Maroc en 2023 est approximativement de :",opts:["80 Mds $","130 Mds $","160 Mds $","200 Mds $"],correct:1,expl:"Le PIB du Maroc en 2023 est d'environ 130 milliards de dollars, faisant du Maroc la 5ème économie d'Afrique. Il vise 300 Mds $ à horizon 2035."}
      ]
    }
  },
  encg:{
    title:'ENCG & ISCAE',
    badge:'📊 ENCG & ISCAE',
    annales:{title:'📄 Annales ENCG / ISCAE',desc:'Annales officielles des concours ENCG (toutes villes) et ISCAE avec corrections.',stats:[{n:'45+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],files:[
      {name:'Sujet ENCG Casa – Maths 2024',size:'0.6 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Correction ENCG 2024',size:'0.7 MB',type:'PDF',icon:'📋',color:'di-green'},
      {name:'Sujet ISCAE 2024',size:'0.8 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Sujet ENCG Rabat 2023',size:'0.5 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Sujet ENCG Fès 2023',size:'0.5 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Annales ENCG compilées 2019-2023',size:'3.8 MB',type:'PDF',icon:'📚',color:'di-purple'}
    ]},
    videos:{title:'🎬 Vidéos ENCG / ISCAE',desc:'Corrections vidéo Maths, Économie, Français et Anglais pour ENCG/ISCAE.',stats:[{n:'50+',l:'Vidéos'},{n:'4',l:'Matières'},{n:'100%',l:'Corrigé'}],files:[]},
    qcm:{title:'🎯 QCM ENCG / ISCAE',desc:'Logique, Maths, Économie — type concours ENCG.',stats:[{n:'120+',l:'Questions'},{n:'3',l:'Matières'},{n:'Type',l:'Concours'}],files:[],
      questions:[
        {q:"Si 5 ouvriers font un travail en 8 jours, en combien de jours 10 ouvriers feront-ils ce même travail ?",opts:["4 jours","6 jours","10 jours","16 jours"],correct:0,expl:"Travail total = 5 × 8 = 40 jours-ouvriers. Avec 10 ouvriers : 40/10 = 4 jours. C'est une règle de trois inverse."},
        {q:"Lequel des suivants n'est PAS un indicateur macroéconomique ?",opts:["PIB","Taux d'inflation","Indice CAC 40","Taux de chômage"],correct:2,expl:"L'indice boursier CAC 40 est un indicateur boursier (microéconomique), pas un indicateur macroéconomique. Les autres (PIB, inflation, chômage) mesurent l'état général de l'économie."},
        {q:"La loi de l'offre et de la demande stipule que :",opts:["Plus le prix monte, plus la demande augmente","Plus le prix monte, moins la demande augmente","L'offre est toujours égale à la demande","Les prix sont fixés par l'État"],correct:1,expl:"La loi de la demande : quand le prix augmente, la demande diminue (relation inverse). La loi de l'offre : quand le prix augmente, l'offre augmente."},
        {q:"Un entrepreneur investit 100 000 MAD et réalise un bénéfice de 15 000 MAD. Son taux de rentabilité est :",opts:["1,5%","10%","15%","20%"],correct:2,expl:"Taux de rentabilité = Bénéfice / Investissement × 100 = 15 000 / 100 000 × 100 = 15%."},
        {q:"En anglais, 'GDP' signifie :",opts:["General Domestic Product","Gross Domestic Product","Global Development Plan","General Development Program"],correct:1,expl:"GDP = Gross Domestic Product (Produit Intérieur Brut en français, PIB). C'est la valeur totale des biens et services produits dans un pays sur une période donnée."}
      ]
    }
  },
  agro:{
    title:'IAV – ENAM – ENCSK',
    badge:'🌿 IAV & ENAM & ENCSK',
    annales:{title:'📄 Annales IAV / ENAM / ENCSK',desc:'Annales officielles IAV Hassan II, ENAM et ENCSK avec corrections complètes.',stats:[{n:'40+',l:'Annales'},{n:'5 ans',l:'Historique'},{n:'4',l:'Matières'}],files:[
      {name:'Sujet IAV Hassan II – SVT 2024',size:'1.0 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Correction IAV 2024',size:'0.9 MB',type:'PDF',icon:'📋',color:'di-green'},
      {name:'Sujet ENAM 2024',size:'0.8 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Sujet ENCSK 2024',size:'0.7 MB',type:'PDF',icon:'📄',color:'di-blue'},
      {name:'Correction Physique-Chimie IAV 2023',size:'0.8 MB',type:'PDF',icon:'📋',color:'di-green'},
      {name:'Annales IAV/ENAM compilées 2019-2023',size:'4.2 MB',type:'PDF',icon:'📚',color:'di-purple'}
    ]},
    videos:{title:'🎬 Vidéos IAV / ENAM / ENCSK',desc:'Corrections vidéo SVT, Maths, Physique-Chimie pour IAV, ENAM et ENCSK.',stats:[{n:'45+',l:'Vidéos'},{n:'4',l:'Matières'},{n:'100%',l:'Corrigé'}],files:[]},
    qcm:{title:'🎯 QCM IAV / ENAM / ENCSK',desc:'Biologie, Agronomie, Chimie — type concours IAV.',stats:[{n:'100+',l:'Questions'},{n:'3',l:'Matières'},{n:'Type',l:'Concours'}],files:[],
      questions:[
        {q:"La photosynthèse se déroule principalement dans :",opts:["La mitochondrie","Le chloroplaste","Le noyau","La vacuole"],correct:1,expl:"La photosynthèse se déroule dans les chloroplastes, plus précisément dans les thylakoïdes (phase lumineuse) et le stroma (cycle de Calvin)."},
        {q:"Quel est le principal gaz produit lors de la respiration cellulaire aérobie ?",opts:["O₂","N₂","CO₂","H₂"],correct:2,expl:"La respiration cellulaire aérobie consomme du glucose et de l'O₂ pour produire de l'ATP, du CO₂ et de l'H₂O. La formule : C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP."},
        {q:"En agronomie, le terme 'NPK' désigne :",opts:["Azote, Potassium, Calcium","Azote, Phosphore, Potassium","Nitrate, Phosphate, Calcium","Nitrogène, Potassium, Carbone"],correct:1,expl:"NPK désigne les 3 macronutriments essentiels des engrais : N=Azote (Nitrogen), P=Phosphore, K=Potassium (Kalium). Ce sont les éléments clés de la nutrition végétale."},
        {q:"La méiose produit :",opts:["2 cellules diploïdes","4 cellules diploïdes","2 cellules haploïdes","4 cellules haploïdes"],correct:3,expl:"La méiose est une division cellulaire réductionnelle qui produit 4 cellules haploïdes (n chromosomes) à partir d'une cellule diploïde (2n). Elle est à la base de la reproduction sexuée."},
        {q:"Le pH d'un sol légèrement acide est compris entre :",opts:["3 et 4","4 et 5","5.5 et 6.5","7 et 8"],correct:2,expl:"Un sol légèrement acide a un pH entre 5.5 et 6.5. La plupart des cultures s'épanouissent entre pH 6 et 7. En dessous de 5, la toxicité aluminique peut nuire aux plantes."}
      ]
    }
  }
};

function openConcoursModule(filiere,type){
  concoursCurrent={filiere,type};
  const data=CONCOURS_DATA[filiere];
  const typeData=data[type];
  document.getElementById('conc-main-view').classList.add('hidden');
  document.getElementById('conc-sub-page').classList.add('active');
  document.getElementById('conc-bc').textContent=data.title+' / '+type.charAt(0).toUpperCase()+type.slice(1);
  document.getElementById('conc-sub-badge').textContent=data.badge;
  document.getElementById('conc-sub-title').textContent=typeData.title;
  document.getElementById('conc-sub-desc').textContent=typeData.desc;
  document.getElementById('conc-sub-stats').innerHTML=typeData.stats.map(s=>`<div class="conc-stat"><div class="conc-stat-num">${s.n}</div><div class="conc-stat-lbl">${s.l}</div></div>`).join('');
  const heroColors={med:'linear-gradient(135deg,#1f0707,#450a0a)',ing:'linear-gradient(135deg,#061129,#0c1f4d)',adm:'linear-gradient(135deg,#1c1402,#473305)',encg:'linear-gradient(135deg,#001a0e,#003d1e)',agro:'linear-gradient(135deg,#0e0320,#2a0a5e)'};
  document.getElementById('conc-sub-hero').style.background=heroColors[filiere];
  const driveTitle={annales:'📄 Annales disponibles',videos:'🎬 Liens Vidéos',qcm:'📋 Ressources QCM'};
  document.getElementById('conc-sub-drive-title').textContent=driveTitle[type]||'📄 Fichiers';
  const files=typeData.files||[];
  document.getElementById('conc-sub-drive-count').textContent=files.length+(files.length===1?' fichier':' fichiers');
  document.getElementById('conc-sub-drive-list').innerHTML=files.length
    ?files.map(d=>`<div class="drive-item"><div class="di-ico ${d.color}">${d.icon}</div><div class="di-info"><div class="di-name">${d.name}</div><div class="di-meta">${d.type} • ${d.size}</div></div><button class="di-btn" onclick="showToast('📥 Téléchargement de «${d.name.replace(/'/g,'')}»')">📥 Télécharger</button></div>`).join('')
    :'<div style="text-align:center;padding:28px;color:var(--t3);border:1px dashed var(--b1);border-radius:12px">Aucun fichier pour cette section.</div>';
  const qcmSec=document.getElementById('conc-qcm-section');
  if(type==='qcm'&&typeData.questions&&typeData.questions.length){
    qcmSec.style.display='block';
    document.getElementById('conc-qcm-sub').textContent='Questions type concours '+data.title;
    initConcoursQCM();
  }else{qcmSec.style.display='none'}
  ytLoad();ytRender('concours');
  window.scrollTo(0,0);
}

function backToConcours(){
  document.getElementById('conc-main-view').classList.remove('hidden');
  document.getElementById('conc-sub-page').classList.remove('active');
  document.getElementById('conc-bc').textContent='Prépa Concours';
}

/* ============================================================ CONCOURS QCM ============================================================ */
function initConcoursQCM(){
  const data=CONCOURS_DATA[concoursCurrent.filiere];
  if(!data||!data.qcm||!data.qcm.questions)return;
  const qs=[...data.qcm.questions].sort(()=>Math.random()-.5);
  concQCMState={questions:qs,current:0,score:0,answers:Array(qs.length).fill(null),_pending:null};
  document.getElementById('conc-qcm-finish').classList.remove('show');
  renderConcQCMDots();renderConcQCMQuestion();updateConcQCMScore();
}
function renderConcQCMDots(){
  const dots=document.getElementById('conc-qcm-dots');
  if(!dots)return;
  dots.innerHTML=concQCMState.questions.map((_,i)=>{
    let cls='qcm-dot';
    if(i===concQCMState.current)cls+=' curr';
    else if(concQCMState.answers[i]===null)cls+='';
    else if(concQCMState.answers[i]===concQCMState.questions[i].correct)cls+=' ok';
    else cls+=' ko';
    return`<div class="${cls}"></div>`;
  }).join('');
}
function renderConcQCMQuestion(){
  const area=document.getElementById('conc-qcm-area');
  if(!area)return;
  if(concQCMState.current>=concQCMState.questions.length){area.innerHTML='';showConcQCMFinish();return}
  const q=concQCMState.questions[concQCMState.current];
  const answered=concQCMState.answers[concQCMState.current]!==null;
  area.innerHTML=`<div class="qcm-question-card">
    <div class="qcm-q-num">Question ${concQCMState.current+1} / ${concQCMState.questions.length}</div>
    <div class="qcm-q-text">${q.q}</div>
    <div class="qcm-options">${q.opts.map((opt,i)=>{let cls='qcm-opt';if(answered){if(i===q.correct)cls+=' correct';else if(i===concQCMState.answers[concQCMState.current])cls+=' wrong';}return`<div class="${cls}" onclick="selectConcQCM(${i})" id="cqcm-opt-${i}"><div class="qcm-opt-letter">${['A','B','C','D'][i]}</div><div class="qcm-opt-text">${opt}</div></div>`}).join('')}</div>
    <div class="qcm-expl ${answered?'show':''}"><strong>✅ Explication :</strong> ${q.expl}</div>
    <div class="qcm-actions">
      <button class="qcm-submit" onclick="submitConcQCM()" ${answered?'disabled style="opacity:.4;pointer-events:none"':''}>✓ Valider</button>
      <button class="qcm-next ${answered?'show':''}" onclick="nextConcQCM()">${concQCMState.current<concQCMState.questions.length-1?'Suivante →':'Résultats →'}</button>
    </div>
  </div>`;
}
function selectConcQCM(idx){if(concQCMState.answers[concQCMState.current]!==null)return;document.querySelectorAll('[id^="cqcm-opt-"]').forEach(o=>o.classList.remove('selected'));document.getElementById('cqcm-opt-'+idx)?.classList.add('selected');concQCMState._pending=idx}
function submitConcQCM(){
  if(concQCMState._pending===undefined||concQCMState._pending===null){showToast('⚠️ Sélectionne une réponse !');return}
  const q=concQCMState.questions[concQCMState.current];
  concQCMState.answers[concQCMState.current]=concQCMState._pending;
  if(concQCMState._pending===q.correct){concQCMState.score++;showToast('✅ Bonne réponse !');confetti({particleCount:40,spread:40,origin:{y:.6},colors:['#00b87a','#1a6aff']})}
  else showToast('❌ Mauvaise réponse !');
  concQCMState._pending=null;updateConcQCMScore();renderConcQCMDots();renderConcQCMQuestion();
}
function nextConcQCM(){concQCMState.current++;concQCMState._pending=null;renderConcQCMDots();renderConcQCMQuestion()}
function updateConcQCMScore(){const answered=concQCMState.answers.filter(a=>a!==null).length;const el=document.getElementById('conc-qcm-score');if(el){el.textContent=concQCMState.score+' / '+answered;el.style.color=concQCMState.score===answered&&answered>0?'var(--green)':'var(--t1)'}}
function showConcQCMFinish(){
  const fin=document.getElementById('conc-qcm-finish');if(!fin)return;fin.classList.add('show');
  const pct=Math.round((concQCMState.score/concQCMState.questions.length)*100);
  document.getElementById('conc-qcm-finish-score').textContent=concQCMState.score+'/'+concQCMState.questions.length;
  let ico='😤',lbl='Continue à travailler !',col='var(--red)';
  if(pct>=80){ico='🏆';lbl='Excellent !';col='var(--green)'}else if(pct>=60){ico='👍';lbl='Bien ! Revois les erreurs.';col='var(--gold)'}else if(pct>=40){ico='📚';lbl='À revoir !';col='var(--gold)'}
  document.getElementById('conc-qcm-finish-ico').textContent=ico;
  document.getElementById('conc-qcm-finish-lbl').textContent=lbl;
  document.getElementById('conc-qcm-finish-score').style.color=col;
  if(pct>=80)confetti({particleCount:120,spread:70,origin:{y:.5},colors:['#00b87a','#1a6aff','#7c4dff','#e09000']});
}

/* ============================================================ DASHBOARD ============================================================ */
function initDashboard(){
  const u=currentUser;
  document.getElementById('navAvatar').textContent=u.initials||initials(u.name);
  document.getElementById('navName').textContent=u.name;
  document.getElementById('dashWelcome').textContent='Bonjour, '+u.name.split(' ')[0]+' 👋';
  tcData=getTCData();
  if(!tcData||!tcData.initialized){tcData=generateDefaultTC();saveTCData(tcData)}
  tcCheckDayReset();
  const todayH=Math.round((tcData.todaySeconds||0)/360)/10;
  const totalH=(tcData.history||[]).reduce((s,h)=>s+h.hours,0).toFixed(1);
  const realH=(tcData.history||[]).filter(h=>!h.simulated).reduce((s,h)=>s+h.hours,0).toFixed(1);
  const avg=tcData.history.length?(tcData.history.reduce((s,h)=>s+h.hours,0)/tcData.history.length).toFixed(1):'--';
  const target=tcData.todayTarget||6;
  document.getElementById('ds-total').textContent=totalH+' h';
  document.getElementById('ds-today').textContent='Aujourd\'hui : '+todayH+'h';
  document.getElementById('ds-streak').textContent=(tcData.loggingStreak||1)+' jours';
  document.getElementById('ds-vs').textContent='Victory streak : '+(tcData.victoryStreak||0);
  document.getElementById('ds-target').textContent=target.toFixed(1)+' h';
  document.getElementById('ds-avg').textContent=avg+' h';
  document.getElementById('ds-real').textContent='Total réel : '+realH+'h';
  document.getElementById('cm-target-num').textContent=target.toFixed(1);
  document.getElementById('cm-actual').textContent=todayH+' h';
  document.getElementById('cm-bar').style.width=Math.min(100,(todayH/target)*100)+'%';
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
  dashChart=new Chart(ctx,{type:'line',data:{labels:lbs,datasets:[{label:'Focus Réel',data:hv,borderColor:'#00b87a',borderWidth:2.5,pointBackgroundColor:'#00b87a',backgroundColor:gA,fill:true,tension:.35,spanGaps:true},{label:'Prévision IA',data:fv,borderColor:'#1a6aff',borderWidth:2.5,borderDash:[5,5],pointBackgroundColor:'#1a6aff',backgroundColor:gF,fill:true,tension:.35,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(15,28,46,.96)',titleFont:{family:'Outfit',size:12,weight:'bold'},bodyFont:{family:'Instrument Sans',size:11},borderColor:'rgba(26,106,255,.2)',borderWidth:1,padding:10,titleColor:'#0f1c2e',bodyColor:'#3a5068'}},scales:{x:{grid:{color:'rgba(0,0,0,.05)'},ticks:{color:'#8aa0b8',font:{size:10}}},y:{grid:{color:'rgba(0,0,0,.05)'},ticks:{color:'#8aa0b8',font:{size:10}},suggestedMin:0,suggestedMax:12}}}});
}

/* ============================================================ TIME CHALLENGER ============================================================ */
function getTCData(){try{return JSON.parse(localStorage.getItem(KEY_TC)||'null')}catch{return null}}
function saveTCData(d){localStorage.setItem(KEY_TC,JSON.stringify(d))}
function tcRandNorm(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function generateDefaultTC(){
  const minH=4,maxH=8,mean=(minH+maxH)/2,std=1.2,history=[],today=new Date();
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

/* ============================================================ PACKS DATA ============================================================ */
const SECTION_META={
  drives:{heroClass:'ph-drives',pill:'📂 Drives de Cours',title:'Drives de Cours',desc:'Tous les cours organisés par matière et semestre — téléchargement direct Google Drive.',s1:'8',l1:'Matières',s2:'340+',l2:'Fichiers',s3:'S1-S2',l3:'Semestres',filters:['Tout','Maths','Physique','Info','Chimie','Français']},
  videos:{heroClass:'ph-videos',pill:'🎬 Vidéos & Exercices',title:'Vidéos Pédagogiques',desc:'120+ vidéos en Darija & Français — exercices corrigés pas à pas.',s1:'120+',l1:'Vidéos',s2:'6',l2:'Matières',s3:'100%',l3:'Gratuit',filters:['Tout','Analyse','Algèbre','Physique','Informatique']},
  exams:{heroClass:'ph-exams',pill:'📝 Examens',title:'Examens & Contrôles',desc:'Examens des 5 dernières années avec corrections vidéo détaillées. PDF imprimables.',s1:'5 ans',l1:'Années',s2:'100%',l2:'Corrigés',s3:'PDF+▶',l3:'Format',filters:['Tout','2024','2023','2022','Rattrapage']}
};
const modulesData={
  drives:[
    {title:'Analyse – Fonctions & Suites S1',subject:'MATHÉMATIQUES',thumb:'mt-blue',emoji:'📐',level:'Semestre 1',tags:['maths'],meta:'142 pages • 5 chapitres',drives:[{name:'Cours complet – Analyse S1',size:'3.2 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Série d\'exercices – Limites',size:'1.1 MB',type:'PDF',icon:'📋',color:'di-green'},{name:'Fiche de révision',size:'0.4 MB',type:'PDF',icon:'📌',color:'di-purple'}]},
    {title:'Algèbre Linéaire Complète S1',subject:'MATHÉMATIQUES',thumb:'mt-blue',emoji:'🔢',level:'Semestre 1',tags:['maths'],meta:'98 pages • 4 chapitres',drives:[{name:'Cours Algèbre Linéaire',size:'2.8 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'TD Espaces Vectoriels',size:'1.4 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Mécanique Newtonienne S1',subject:'PHYSIQUE',thumb:'mt-purple',emoji:'⚡',level:'Semestre 1',tags:['physique'],meta:'87 pages • 4 chapitres',drives:[{name:'Cours Mécanique',size:'2.5 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Exercices résolus',size:'1.8 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Électromagnétisme S2',subject:'PHYSIQUE',thumb:'mt-purple',emoji:'🔬',level:'Semestre 2',tags:['physique'],meta:'115 pages • 6 chapitres',drives:[{name:'Cours EM – Vol. 1',size:'3.0 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Cours EM – Vol. 2',size:'2.7 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Exercices corrigés',size:'2.1 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Algorithmique & Structures S1',subject:'INFORMATIQUE',thumb:'mt-green',emoji:'💻',level:'Semestre 1',tags:['info'],meta:'73 pages • 5 chapitres',drives:[{name:'Poly Algo & Structures',size:'2.2 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'TP corrigés',size:'1.6 MB',type:'PDF',icon:'💻',color:'di-purple'}]},
    {title:'Chimie Organique S2',subject:'CHIMIE',thumb:'mt-gold',emoji:'⚗️',level:'Semestre 2',tags:['chimie'],meta:'91 pages • 4 chapitres',drives:[{name:'Cours Chimie Organique',size:'2.9 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Mécanismes réactionnels',size:'1.3 MB',type:'PDF',icon:'📋',color:'di-green'}]},
    {title:'Thermodynamique Appliquée S2',subject:'PHYSIQUE',thumb:'mt-purple',emoji:'🌡️',level:'Semestre 2',tags:['physique'],meta:'66 pages • 3 chapitres',drives:[{name:'Cours Thermodynamique',size:'2.0 MB',type:'PDF',icon:'📄',color:'di-blue'}]},
    {title:'Français – Méthodologie',subject:'FRANÇAIS',thumb:'mt-red',emoji:'📝',level:'CPGE',tags:['français'],meta:'44 pages',drives:[{name:'Méthodologie Dissertation',size:'0.8 MB',type:'PDF',icon:'📄',color:'di-blue'},{name:'Fiches de vocabulaire',size:'0.5 MB',type:'PDF',icon:'📌',color:'di-purple'}]}
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
  document.getElementById('ph-pill').textContent=m.pill;
  document.getElementById('ph-title').textContent=m.title;
  document.getElementById('ph-desc').textContent=m.desc;
  document.getElementById('ph-s1').textContent=m.s1;document.getElementById('ph-l1').textContent=m.l1;
  document.getElementById('ph-s2').textContent=m.s2;document.getElementById('ph-l2').textContent=m.l2;
  document.getElementById('ph-s3').textContent=m.s3;document.getElementById('ph-l3').textContent=m.l3;
  const fb=document.getElementById('pack-filters');
  fb.innerHTML=m.filters.map(f=>`<button class="filt-btn ${f==='Tout'?'active':''}" onclick="setFilter('${f}',this)">${f}</button>`).join('');
  activeFilter='Tout';document.getElementById('pack-search').value='';renderModules();
}
function setFilter(f,btn){activeFilter=f;document.querySelectorAll('#pack-filters .filt-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderModules()}
function renderModules(){
  const search=document.getElementById('pack-search').value.toLowerCase();
  const grid=document.getElementById('module-grid');
  const items=(modulesData[currentSection]||[]).filter(m=>{
    const mf=activeFilter==='Tout'||m.tags.some(t=>t.toLowerCase()===activeFilter.toLowerCase());
    const ms=m.title.toLowerCase().includes(search)||m.subject.toLowerCase().includes(search);
    return mf&&ms;
  });
  if(!items.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--t3)">Aucun résultat 🔍</div>';return}
  grid.innerHTML=items.map(m=>{
    const realIdx=modulesData[currentSection].indexOf(m);
    return`<div class="mod-card animate-in" onclick="openModule('${currentSection}',${realIdx})" style="animation-delay:${realIdx*.05}s">
      <div class="mod-thumb ${m.thumb}"><span>${m.emoji}</span><div class="mod-lvl">${m.level}</div><div class="mod-free">Gratuit</div></div>
      <div class="mod-body"><div class="mod-subj">${m.subject}</div><div class="mod-title">${m.title}</div><div class="mod-meta">📄 ${m.meta}</div><button class="mod-cta">📖 Étudier ce module →</button></div>
    </div>`;
  }).join('');
}

/* ============================================================ STUDY ZONE ============================================================ */
const TIPS=['La technique Pomodoro (25min focus + 5min pause) est prouvée pour améliorer la concentration et la mémorisation.','Explique le concept à voix haute comme si tu l\'enseignais — c\'est la méthode Feynman !','Fais des pauses toutes les 90 minutes : le cerveau fonctionne en cycles ultradiens.','Commence par la tâche la plus difficile (Eat the Frog) — tu seras plus lucide le matin.','Révise dans les 24h suivant l\'apprentissage pour maximiser la rétention à long terme.','Le sommeil consolide la mémoire : 7-8h par nuit pendant les révisions est essentiel.','Alterne les sujets (Maths → Physique → Info) pour stimuler différentes zones du cerveau.'];
function initStudy(){
  const m=currentModule;
  if(!m){window.location.href='packs.html';return}
  document.getElementById('study-module-name').textContent=m.title;
  const drives=m.drives||[];
  document.getElementById('drive-count').textContent=drives.length+(drives.length===1?' fichier':' fichiers');
  document.getElementById('drive-list').innerHTML=drives.length
    ?drives.map(d=>`<div class="drive-item"><div class="di-ico ${d.color}">${d.icon}</div><div class="di-info"><div class="di-name">${d.name}</div><div class="di-meta">${d.type} • ${d.size}</div></div><button class="di-btn" onclick="showToast('📥 Téléchargement de «${d.name.replace(/'/g,'')}»')">📥 Télécharger</button></div>`).join('')
    :'<div style="text-align:center;padding:28px;color:var(--t3);border:1px dashed var(--b1);border-radius:var(--r2)">Aucun fichier drive pour ce module.</div>';
  ytLoad();ytRender('study');
  switchPratique('qcm');initQCM();renderExercices();
  const progs=[{n:'Cours',p:75,ico:'📖',c:'rgba(26,106,255,.7)'},{n:'Exercices',p:40,ico:'✏️',c:'rgba(0,184,122,.7)'},{n:'Révision',p:20,ico:'🔄',c:'rgba(224,144,0,.7)'}];
  document.getElementById('prog-items').innerHTML=progs.map(p=>`<div class="prog-item"><div class="prog-ico">${p.ico}</div><div class="prog-body"><div class="prog-name">${p.n}</div><div class="prog-bar-wrap"><div class="prog-bar-in" style="width:${p.p}%;background:${p.c}"></div></div></div><span style="font-size:.73rem;font-weight:700;color:var(--t3);flex-shrink:0">${p.p}%</span></div>`).join('');
  document.getElementById('tip-card').textContent=TIPS[Math.floor(Math.random()*TIPS.length)];
  tcData=getTCData();if(!tcData||!tcData.initialized){tcData=generateDefaultTC();saveTCData(tcData)}
  tcCheckDayReset();
  document.getElementById('mini-streak').textContent='Streak: '+(tcData.loggingStreak||1)+'j';
  document.getElementById('mini-obj').textContent=(tcData.todayTarget||6).toFixed(1)+' h';
  miniReset(true);updateMiniComparison();
}
function switchPratique(mode){
  document.getElementById('pratique-qcm').style.display=mode==='qcm'?'block':'none';
  document.getElementById('pratique-exo').style.display=mode==='exo'?'block':'none';
  document.getElementById('tab-qcm').classList.toggle('active',mode==='qcm');
  document.getElementById('tab-exo').classList.toggle('active',mode==='exo');
}

/* ============================================================ QCM (Study Zone) ============================================================ */
const QCM_BANK=[
  {q:"Quelle est la limite de (sin x)/x quand x → 0 ?",opts:["0","∞","1","Indéfinie"],correct:2,expl:"C'est une limite fondamentale : lim(x→0) sin(x)/x = 1. On peut la démontrer via les inégalités trigonométriques ou la règle de L'Hôpital."},
  {q:"Une suite (uₙ) est croissante et majorée. Elle est donc :",opts:["Divergente","Convergente","Oscillante","Cauchy mais pas convergente"],correct:1,expl:"Tout suite monotone et bornée est convergente — c'est le théorème des suites monotones bornées (fondamental en Analyse S1)."},
  {q:"Quelle est la dérivée de f(x) = ln(x) pour x > 0 ?",opts:["ln(x)/x","1/x","x·ln(x)","e^x"],correct:1,expl:"La dérivée de ln(x) est 1/x. C'est l'une des formules de dérivation les plus utilisées en Analyse."},
  {q:"En algèbre linéaire, un espace vectoriel V sur ℝ contient obligatoirement :",opts:["Au moins deux vecteurs non nuls","Le vecteur nul","Une base orthonormée","Un sous-espace de dimension 1"],correct:1,expl:"Tout espace vectoriel doit contenir le vecteur nul (élément neutre de l'addition). C'est l'un des axiomes fondamentaux."},
  {q:"La complexité temporelle d'un tri par insertion dans le pire cas est :",opts:["O(n log n)","O(n)","O(n²)","O(log n)"],correct:2,expl:"Dans le pire cas (tableau trié en ordre inverse), le tri par insertion effectue n(n-1)/2 comparaisons, soit une complexité O(n²)."},
  {q:"La loi de Newton F = ma s'exprime en unités SI comme :",opts:["kg·m/s","kg·m/s²","N·s","kg²/m"],correct:1,expl:"F est en Newton (N), m en kilogrammes (kg), a en m/s². Donc N = kg·m/s² — c'est la définition du Newton dans le système SI."},
  {q:"En chimie organique, le groupe -OH est caractéristique de :",opts:["Les acides carboxyliques","Les alcools","Les cétones","Les aldéhydes"],correct:1,expl:"Le groupe hydroxyle -OH lié à un carbone sp³ est le groupe fonctionnel caractéristique des alcools (ex: éthanol CH₃CH₂OH)."},
  {q:"En thermodynamique, le premier principe s'énonce : ΔU = ...",opts:["W - Q","Q + W","Q × W","Q / W"],correct:1,expl:"ΔU = Q + W (convention IUPAC). L'énergie interne d'un système varie de la somme de la chaleur reçue Q et du travail reçu W."}
];
let qcmState={questions:[],current:0,score:0,answers:[]};
function initQCM(){const shuffled=[...QCM_BANK].sort(()=>Math.random()-.5).slice(0,5);qcmState={questions:shuffled,current:0,score:0,answers:Array(shuffled.length).fill(null)};document.getElementById('qcm-finish').classList.remove('show');renderQCMDots();renderQCMQuestion();updateQCMScore()}
function renderQCMDots(){const dots=document.getElementById('qcm-dots');if(!dots)return;dots.innerHTML=qcmState.questions.map((_,i)=>{let cls='qcm-dot';if(i===qcmState.current)cls+=' curr';else if(qcmState.answers[i]===null)cls+='';else if(qcmState.answers[i]===qcmState.questions[i].correct)cls+=' ok';else cls+=' ko';return`<div class="${cls}"></div>`}).join('')}
function renderQCMQuestion(){
  const area=document.getElementById('qcm-question-area');if(!area)return;
  if(qcmState.current>=qcmState.questions.length){area.innerHTML='';showQCMFinish();return}
  const q=qcmState.questions[qcmState.current];const answered=qcmState.answers[qcmState.current]!==null;
  area.innerHTML=`<div class="qcm-question-card"><div class="qcm-q-num">Question ${qcmState.current+1} / ${qcmState.questions.length}</div><div class="qcm-q-text">${q.q}</div><div class="qcm-options">${q.opts.map((opt,i)=>{let cls='qcm-opt';if(answered){if(i===q.correct)cls+=' correct';else if(i===qcmState.answers[qcmState.current])cls+=' wrong';}return`<div class="${cls}" onclick="selectQCMAnswer(${i})" id="qcm-opt-${i}"><div class="qcm-opt-letter">${['A','B','C','D'][i]}</div><div class="qcm-opt-text">${opt}</div></div>`}).join('')}</div><div class="qcm-expl ${answered?'show':''}"><strong>✅ Explication :</strong> ${q.expl}</div><div class="qcm-actions"><button class="qcm-submit" id="qcm-submit-btn" onclick="submitQCM()" ${answered?'disabled style="opacity:.4;pointer-events:none"':''}>✓ Valider ma réponse</button><button class="qcm-next ${answered?'show':''}" id="qcm-next-btn" onclick="nextQCM()">${qcmState.current<qcmState.questions.length-1?'Question suivante →':'Voir mes résultats →'}</button></div></div>`;
}
function selectQCMAnswer(idx){if(qcmState.answers[qcmState.current]!==null)return;document.querySelectorAll('.qcm-opt').forEach(o=>o.classList.remove('selected'));document.getElementById('qcm-opt-'+idx)?.classList.add('selected');qcmState._pending=idx}
function submitQCM(){if(qcmState._pending===undefined||qcmState._pending===null){showToast('⚠️ Sélectionne une réponse !');return}const q=qcmState.questions[qcmState.current];qcmState.answers[qcmState.current]=qcmState._pending;if(qcmState._pending===q.correct){qcmState.score++;showToast('✅ Bonne réponse !');confetti({particleCount:40,spread:40,origin:{y:.6},colors:['#00b87a','#1a6aff']})}else showToast('❌ Mauvaise réponse !');qcmState._pending=null;updateQCMScore();renderQCMDots();renderQCMQuestion()}
function nextQCM(){qcmState.current++;qcmState._pending=null;renderQCMDots();renderQCMQuestion()}
function updateQCMScore(){const answered=qcmState.answers.filter(a=>a!==null).length;const el=document.getElementById('qcm-score-val');if(el){el.textContent=qcmState.score+' / '+answered;el.style.color=qcmState.score===answered&&answered>0?'var(--green)':'var(--t1)'}}
function showQCMFinish(){const fin=document.getElementById('qcm-finish');if(!fin)return;fin.classList.add('show');const pct=Math.round((qcmState.score/qcmState.questions.length)*100);document.getElementById('qcm-finish-score').textContent=qcmState.score+'/'+qcmState.questions.length;let ico='😤',lbl='Continue à travailler !',col='var(--red)';if(pct>=80){ico='🏆';lbl='Excellent !';col='var(--green)'}else if(pct>=60){ico='👍';lbl='Bien !';col='var(--gold)'}else if(pct>=40){ico='📚';lbl='À revoir !';col='var(--gold)'}document.getElementById('qcm-finish-ico').textContent=ico;document.getElementById('qcm-finish-lbl').textContent=lbl;document.getElementById('qcm-finish-score').style.color=col;if(pct>=80)confetti({particleCount:120,spread:70,origin:{y:.5}})}

/* ============================================================ EXERCICES ============================================================ */
const EXERCICES_BANK=[
  {title:'Calcul de limites — Méthode complète',tags:['Analyse','Limites'],diff:'facile',enonce:'<strong>Calculer les limites suivantes :</strong><br>1) lim<sub>x→+∞</sub> (3x² - 2x + 1) / (x² + x)<br>2) lim<sub>x→0</sub> (e^x - 1) / x<br>3) lim<sub>x→1</sub> (x² - 1) / (x - 1)',solution:[{num:'1',text:'Pour x→+∞, diviser par x² : (3 - 2/x + 1/x²) / (1 + 1/x) → 3/1 = <strong>3</strong>'},{num:'2',text:'C\'est la dérivée de e^x en 0 : lim = <strong>1</strong>.'},{num:'3',text:'Factorisation : (x+1)(x-1)/(x-1) = x+1 → <strong>2</strong>.'}]},
  {title:'Diagonalisation d\'une matrice 2×2',tags:['Algèbre','Matrices'],diff:'moyen',enonce:'<strong>Soit A = [[2, 1], [0, 3]].</strong><br>1) Calculer les valeurs propres de A.<br>2) Trouver les vecteurs propres associés.<br>3) A est-elle diagonalisable ?',solution:[{num:'1',text:'χ_A(λ) = (2-λ)(3-λ). Valeurs propres : <strong>λ₁ = 2</strong> et <strong>λ₂ = 3</strong>.'},{num:'2',text:'v₁=[1,0]ᵀ, <strong>v₂=[1,1]ᵀ</strong>.'},{num:'3',text:'Deux valeurs propres distinctes → <strong>A est diagonalisable</strong>.'}]},
  {title:'Mouvement d\'un projectile',tags:['Physique','Mécanique'],diff:'difficile',enonce:'<strong>v₀ = 20 m/s à 45°.</strong><br>1) Portée maximale.<br>2) Hauteur maximale.<br>3) Durée de vol. (g = 10 m/s²)',solution:[{num:'1',text:'R = v₀² sin(2θ) / g = <strong>40 m</strong>.'},{num:'2',text:'H = <strong>10 m</strong>.'},{num:'3',text:'T ≈ <strong>2.83 s</strong>.'}]}
];
function renderExercices(){
  const list=document.getElementById('exo-list');if(!list)return;
  list.innerHTML=EXERCICES_BANK.map((ex,i)=>`<div class="exo-card" id="exo-${i}"><div class="exo-card-head" onclick="toggleExo(${i})"><div class="exo-num">${i+1}</div><div class="exo-info"><div class="exo-title">${ex.title}</div><div class="exo-tags">${ex.tags.map(t=>`<span class="exo-tag">${t}</span>`).join('')}</div></div><span class="exo-diff ${ex.diff}">${ex.diff.charAt(0).toUpperCase()+ex.diff.slice(1)}</span><span class="exo-chevron">▼</span></div><div class="exo-body" id="exo-body-${i}"><div class="exo-enonce">${ex.enonce}</div><button class="exo-sol-btn" id="exo-sol-btn-${i}" onclick="toggleSolution(${i})">👁 Voir la correction</button><div class="exo-solution" id="exo-sol-${i}">${ex.solution.map(s=>`<div class="exo-step"><div class="exo-step-num">Partie ${s.num}</div>${s.text}</div>`).join('')}</div></div></div>`).join('');
}
function toggleExo(i){const card=document.getElementById('exo-'+i),body=document.getElementById('exo-body-'+i);const isOpen=card.classList.contains('open');card.classList.toggle('open',!isOpen);body.classList.toggle('open',!isOpen)}
function toggleSolution(i){const sol=document.getElementById('exo-sol-'+i),btn=document.getElementById('exo-sol-btn-'+i);const isOpen=sol.classList.contains('show');sol.classList.toggle('show',!isOpen);if(btn)btn.textContent=isOpen?'👁 Voir la correction':'🙈 Masquer la correction'}

/* ============================================================ YOUTUBE ============================================================ */
const YT_NS={};
function ytLoad(){try{const s=JSON.parse(localStorage.getItem(KEY_YT)||'{}');Object.assign(YT_NS,s)}catch{}}
function ytSave(){localStorage.setItem(KEY_YT,JSON.stringify(YT_NS))}
function ytExtractId(url){if(!url)return null;const m=url.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);if(m)return m[1];if(/^[a-zA-Z0-9_-]{11}$/.test(url.trim()))return url.trim();return null}
function ytToggle(id){const box=document.getElementById('yt-box-'+id),btn=document.getElementById('yt-toggle-'+id);const o=box.classList.contains('open');box.classList.toggle('open',!o);if(btn)btn.textContent=o?'+ Ajouter':'✕ Fermer'}
function ytAdd(id){const urlEl=document.getElementById('yt-url-'+id),titEl=document.getElementById('yt-title-'+id);if(!urlEl)return;const url=urlEl.value.trim(),title=(titEl?titEl.value.trim():'')||'Vidéo sans titre';if(!url){showToast('⚠️ Colle un lien YouTube');return}const vid=ytExtractId(url);if(!vid){showToast('❌ Lien YouTube invalide');urlEl.style.borderColor='var(--red)';setTimeout(()=>urlEl.style.borderColor='',1500);return}if(!YT_NS[id])YT_NS[id]=[];YT_NS[id].push({id:vid,title,url:'https://www.youtube.com/watch?v='+vid});urlEl.value='';if(titEl)titEl.value='';ytSave();ytRender(id);showToast('✅ Vidéo ajoutée !');confetti({particleCount:60,spread:50,origin:{y:.7},colors:['#1a6aff','#0099e6','#7c4dff']})}
function ytDelete(id,idx){if(!confirm('Supprimer cette vidéo ?'))return;YT_NS[id].splice(idx,1);ytSave();ytRender(id);showToast('🗑️ Vidéo supprimée')}
function ytPlay(id,idx,videoId){const pa=document.getElementById('ytp-'+id+'-'+idx);if(!pa||pa.classList.contains('active'))return;pa.innerHTML=`<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;pa.classList.add('active');const tw=document.getElementById('ytw-'+id+'-'+idx);if(tw){const img=tw.querySelector('img'),ov=tw.querySelector('.yt-play-ov');if(img)img.style.opacity='0';if(ov)ov.style.display='none'}}
function ytRender(id){const grid=document.getElementById('yt-grid-'+id),empty=document.getElementById('yt-empty-'+id),count=document.getElementById('yt-count-'+id);if(!grid)return;const items=YT_NS[id]||[];if(count)count.textContent=items.length+(items.length===1?' vidéo':' vidéos');if(!items.length){if(empty)empty.style.display='block';grid.innerHTML='';return}if(empty)empty.style.display='none';grid.innerHTML=items.map((v,i)=>`<div class="yt-card"><div class="yt-thumb" id="ytw-${id}-${i}" onclick="ytPlay('${id}',${i},'${v.id}')"><img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" loading="lazy"><div class="yt-play-ov"><div class="yt-play-circle">▶</div></div><div class="yt-player-area" id="ytp-${id}-${i}"></div></div><div class="yt-card-body"><div class="yt-card-lbl">YouTube</div><div class="yt-card-title">${v.title}</div><div class="yt-card-acts"><button class="yt-watch" onclick="window.open('${v.url}','_blank')">▶ YouTube</button><button class="yt-del" onclick="ytDelete('${id}',${i})">🗑</button></div></div></div>`).join('')}

/* ============================================================ MINI POMODORO ============================================================ */
let miniPomSec=25*60,miniPomTotal=25*60,miniPomRunning=false,miniPomInterval=null,miniSwAccSec=0;
const CIRC=2*Math.PI*56;
function miniPlay(){if(miniPomRunning)return;miniPomRunning=true;document.getElementById('mini-play').style.display='none';document.getElementById('mini-pause').style.display='flex';document.getElementById('mini-mode').textContent='En cours…';miniPomInterval=setInterval(()=>{miniPomSec--;updateMiniRing();const focusChip=document.getElementById('study-focus-chip');if(focusChip)focusChip.textContent='⏱ '+((miniSwAccSec+(miniPomTotal-miniPomSec))/3600).toFixed(1)+'h focus';if(miniPomSec<=0){clearInterval(miniPomInterval);miniPomRunning=false;miniSwAccSec+=miniPomTotal;if(tcData){tcData.todaySeconds=miniSwAccSec;saveTCData(tcData)}updateMiniComparison();showToast('🎉 Pomodoro terminé ! +'+Math.round(miniPomTotal/60)+'min');chime();confetti({particleCount:80,spread:60,origin:{y:.6}});miniReset(true)}},1000)}
function miniPause(){clearInterval(miniPomInterval);miniPomRunning=false;document.getElementById('mini-play').style.display='flex';document.getElementById('mini-pause').style.display='none';document.getElementById('mini-mode').textContent='En pause';if(tcData){tcData.todaySeconds=miniSwAccSec;saveTCData(tcData)}}
function miniReset(silent=false){clearInterval(miniPomInterval);miniPomRunning=false;miniPomSec=miniPomTotal;document.getElementById('mini-play').style.display='flex';document.getElementById('mini-pause').style.display='none';document.getElementById('mini-mode').textContent='Prêt';updateMiniRing()}
function updateMiniRing(){const m=Math.floor(miniPomSec/60),s=miniPomSec%60;const el=document.getElementById('mini-time');if(el)el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');const offset=CIRC-(miniPomSec/miniPomTotal)*CIRC;const ring=document.getElementById('mini-ring');if(ring){ring.style.strokeDasharray=CIRC+' '+CIRC;ring.style.strokeDashoffset=offset}}
function updateMiniComparison(){const accH=Math.round(miniSwAccSec/360)/10,target=tcData?.todayTarget||6;const el=document.getElementById('mini-acc');if(el)el.textContent=accH.toFixed(1)+'h';const pct=Math.min(100,(accH/target)*100);const bf=document.getElementById('mini-bar');if(bf)bf.style.width=pct+'%';const vEl=document.getElementById('mini-verdict');if(vEl){if(accH===0){vEl.textContent='Lance le minuteur pour commencer.';vEl.className='pomo-verdict'}else if(accH<target){vEl.textContent='Encore '+(target-accH).toFixed(1)+'h pour battre l\'IA !';vEl.className='pomo-verdict'}else{vEl.textContent='🚀 Tu bats la prévision IA de '+(accH-target).toFixed(1)+'h !';vEl.className='pomo-verdict winning'}}}

/* ============================================================ UTILS ============================================================ */
let toastTimer;
function showToast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3200)}
function chime(){try{const ac=new(window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(523,ac.currentTime);o.frequency.setValueAtTime(659,ac.currentTime+.15);g.gain.setValueAtTime(.001,ac.currentTime);g.gain.exponentialRampToValueAtTime(.25,ac.currentTime+.06);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+1.2);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+1.4)}catch(e){}}

/* ============================================================ BOOT ============================================================ */
document.addEventListener('DOMContentLoaded',()=>{
  ytLoad();
  const session=getSession();
  const pathname=window.location.pathname;
  const page=pathname.split('/').pop().replace('.html','')||'login';

  if(!session&&page!=='login'){window.location.href='login.html';return}
  if(session&&page==='login'){window.location.href='dashboard.html';return}

  if(session){
    currentUser=session;
    currentSection=localStorage.getItem('pl_section')||'drives';
    try{currentModule=JSON.parse(localStorage.getItem('pl_module')||'null')}catch{currentModule=null}
  }

  if(page==='dashboard')initDashboard();
  else if(page==='packs'){
    initPacks(currentSection);
    ['drives','videos','exams'].forEach(s=>{
      const el=document.getElementById('pk-'+s);
      if(el)el.classList.toggle('active',s===currentSection);
    });
  }
  else if(page==='concours')initConcours();
  else if(page==='study')initStudy();

  updateMiniRing();
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.id&&e.target.id.startsWith('yt-url-'))ytAdd(e.target.id.replace('yt-url-',''));
    if(e.key==='Enter'&&(e.target.id==='emailInput'||e.target.id==='pwInput'||e.target.id==='nameInput'))handleAuth();
  });
});
