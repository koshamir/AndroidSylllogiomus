
const TIER_NAMES = [
  'Adept','Scholar','Savant','Expert','Mastermind','Visionary','Genius','Virtuoso','Luminary','Prodigy','Oracle','Sage','Philosopher','Mystic','Transcendent'
];

const TIER_SCORE_RANGES = [
  { min:-Infinity, max:249 },
  { min:250, max:499 },
  { min:500, max:749 },
  { min:750, max:999 },
  { min:1000, max:1249 },
  { min:1250, max:1499 },
  { min:1500, max:1749 },
  { min:1750, max:1999 },
  { min:2000, max:2249 },
  { min:2250, max:2499 },
  { min:2500, max:2749 },
  { min:2750, max:2999 },
  { min:3000, max:3249 },
  { min:3250, max:3499 },
  { min:3500, max:Infinity },
];

const QUESTION_TYPES = [
  'Distinction',
  'Comparison Numerical',
  'Comparison Chronological',
  'Syllogism',
  'Linear Arrangement',
  'Circular Arrangement',
  'Direction',
  'Direction3D Spatial',
  'Direction3D Temporal',
  'Graph Matching',
  'Analogy',
  'Binary',
];

const TIERS_MATRIX = {
  0:[1,1,1,0,0,0,0,0,0,0,0,0],
  1:[1,1,1,1,0,0,0,0,0,0,0,0],
  2:[1,1,1,1,1,0,0,0,0,0,0,0],
  3:[1,1,1,1,1,1,0,0,0,0,0,0],
  4:[1,1,1,1,1,1,1,0,0,0,0,0],
  5:[1,1,1,1,1,1,1,1,1,0,1,0],
  6:[1,1,1,1,1,1,1,1,1,1,1,1],
  7:[1,1,1,1,1,1,1,1,1,1,1,1],
  8:[1,1,1,1,1,1,1,1,1,1,1,1],
  9:[1,1,1,1,1,1,1,1,1,1,1,1],
  10:[1,1,1,1,1,1,1,1,1,1,1,1],
  11:[1,1,1,1,1,1,1,1,1,1,1,1],
  12:[1,1,1,1,1,1,1,1,1,1,1,1],
  13:[1,1,1,1,1,1,1,1,1,1,1,1],
  14:[1,1,1,1,1,1,1,1,1,1,1,1],
};

const TOKENS = [
  'QAW','WEN','REV','DUP','FAZ','KAL','GUL','NAV','KIV','LUM','TOV','RIF','SEL','VAR','PON','MIR','ZEN','BEX','YOL','DAR',
  'VEX','MUN','SIR','TAN','FOL','GAV','RAN','JEV','NOL','XAR','CEV','LIR','PAX','TIR','WAL','KEM','NEX','BIR','SOV','QUX'
];

const EVENTS = ['the eclipse','the summit','the launch','the ceremony','the hearing','the race','the rehearsal','the trial','the parade','the festival'];
const PEOPLE = ['Arin','Bela','Ciro','Dena','Evo','Faye','Gio','Hana'];
const OBJECTS = ['red book','blue mug','green pen','gold coin','silver key','black phone'];
const DIRECTIONS_2D = ['north','south','east','west'];
const ANALOGY_PAIRS = [
  ['bird','nest'], ['bee','hive'], ['fish','water'], ['author','book'], ['painter','canvas'], ['doctor','hospital'], ['teacher','classroom'], ['driver','car']
];
const BINARY_OPS = ['AND','OR','XOR','NAND'];
const STORAGE_KEY = 'syllogimous-clone-state-v1';

function now(){ return Date.now(); }
function sample(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffled(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pickMany(arr,n){ return shuffled(arr).slice(0,n); }
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function clamp(v,min,max){ return Math.min(max,Math.max(min,v)); }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[ch])); }
function fmtDuration(sec){ if(sec < 60) return `${sec}s`; const m=Math.floor(sec/60), s=sec%60; return s?`${m}m ${s}s`:`${m}m`; }
function dateKey(ts){ return new Date(ts).toISOString().slice(0,10); }
function weekKey(ts){ const d=new Date(ts); const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = date.getUTCDay() || 7; date.setUTCDate(date.getUTCDate() + 4 - day); const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1)); const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7); return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`; }

function getTierIndex(score){
  return TIER_SCORE_RANGES.findIndex(r => score >= r.min && score <= r.max);
}
function getTierName(score){ return TIER_NAMES[getTierIndex(score)]; }
function nextTierInfo(score){
  const idx=getTierIndex(score);
  if(idx>=TIER_NAMES.length-1) return null;
  const next=TIER_SCORE_RANGES[idx+1].min;
  return { name:TIER_NAMES[idx+1], remaining:Math.max(0, next-score) };
}
function tierColor(score){
  const idx=getTierIndex(score);
  const palette = [
    ['#F0F8FF','#045D56'],['#ADD8E6','#013220'],['#E6E6FA','#4B0082'],['#D8BFD8','#8B008B'],['#DDA0DD','#483D8B'],
    ['#B0E0E6','#002366'],['#AFEEEE','#004953'],['#00CED1','#002D62'],['#98FB98','#006400'],['#FFFACD','#556B2F'],
    ['#FFDAB9','#A0522D'],['#FFC0CB','#8B0000'],['#D8BFD8','#4A235A'],['#C71585','#FFE4E1'],['#4B0082','#F0F8FF']
  ];
  return palette[idx];
}

function defaultState(){
  return {
    score: 0,
    dontShowIntro: false,
    history: [],
    statsByType: {},
    streak: 0,
    longestStreak: 0,
    currentQuestion: null,
    mode: 'arcade',
    questionStartTs: null,
    playBuckets: {},
    settings: {
      timerSeconds: 45,
      displayMode: 'standard',
      dailyGoalMinutes: 20,
      enabledTypes: Object.fromEntries(QUESTION_TYPES.map(t => [t, true]))
    }
  };
}

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      settings: { ...defaultState().settings, ...(parsed.settings || {}) },
      statsByType: parsed.statsByType || {},
      history: parsed.history || []
    };
  } catch {
    return defaultState();
  }
}

let state = loadState();

function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function toast(msg){
  const host = document.getElementById('toastHost');
  const el = document.createElement('div');
  el.className='toast';
  el.textContent=msg;
  host.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(8px)'; }, 1800);
  setTimeout(()=>el.remove(), 2400);
}

function addPlaytime(seconds){
  const ts = now();
  const day = dateKey(ts), week = weekKey(ts);
  state.playBuckets[day] = (state.playBuckets[day] || 0) + seconds;
  state.playBuckets[week] = (state.playBuckets[week] || 0) + seconds;
}

function getPlaytimeToday(){ return state.playBuckets[dateKey(now())] || 0; }
function getPlaytimeWeek(){ return state.playBuckets[weekKey(now())] || 0; }

function unlockedTypes(){
  const idx=getTierIndex(state.score);
  const flags=TIERS_MATRIX[idx] || TIERS_MATRIX[0];
  return QUESTION_TYPES.filter((t,i)=>flags[i] && state.settings.enabledTypes[t] !== false);
}

function allTimeStats(){
  const res = { correct:0, incorrect:0, timeout:0 };
  for(const q of state.history){
    if(q.outcome === 'correct') res.correct++;
    else if(q.outcome === 'incorrect') res.incorrect++;
    else if(q.outcome === 'timeout') res.timeout++;
  }
  return res;
}

function ensureTypeStat(type){
  if(!state.statsByType[type]) state.statsByType[type] = { correct:0, incorrect:0, timeout:0, asked:0 };
  return state.statsByType[type];
}

function relationChain(names, comparator){
  const order = shuffled(names);
  const premises = [];
  for(let i=0;i<order.length-1;i++) premises.push(comparator(order[i], order[i+1]));
  return { order, premises };
}

function generateDistinction(){
  const [a,b,c] = pickMany(TOKENS,3);
  const sameAB = Math.random() < 0.5;
  const sameBC = Math.random() < 0.5;
  const premises = [
    `${a} is ${sameAB ? 'the same type as' : 'different from'} ${b}.`,
    `${b} is ${sameBC ? 'the same type as' : 'different from'} ${c}.`
  ];
  let answer, conclusion;
  if(sameAB && sameBC){ answer = true; conclusion = `${a} is the same type as ${c}.`; }
  else if(sameAB && !sameBC){ answer = true; conclusion = `${a} is different from ${c}.`; }
  else if(!sameAB && sameBC){ answer = true; conclusion = `${a} is different from ${c}.`; }
  else {
    const truthful = Math.random() < 0.5;
    answer = truthful;
    conclusion = `${a} is ${truthful ? 'different from' : 'the same type as'} ${c}.`;
  }
  return { type:'Distinction', instructions:'Track sameness versus difference across the chain.', premises, conclusion, answer, difficulty:2 };
}

function generateComparisonNumerical(){
  const [a,b,c,d] = pickMany(TOKENS,4);
  const values = shuffled([randInt(2,9),randInt(10,18),randInt(19,27),randInt(28,36)]);
  const items = [[a,values[0]],[b,values[1]],[c,values[2]],[d,values[3]]].sort((x,y)=>y[1]-x[1]);
  const premises = [
    `${items[0][0]} is greater than ${items[1][0]}.`,
    `${items[1][0]} is greater than ${items[2][0]}.`,
    `${items[2][0]} is greater than ${items[3][0]}.`
  ];
  const truthful = Math.random() < 0.65;
  const left = truthful ? items[0][0] : items[2][0];
  const right = truthful ? items[3][0] : items[1][0];
  const conclusion = `${left} is greater than ${right}.`;
  return { type:'Comparison Numerical', instructions:'Infer the order from largest to smallest.', premises, conclusion, answer:truthful, difficulty:3 };
}

function generateComparisonChronological(){
  const names = pickMany(EVENTS,4);
  const chain = relationChain(names, (x,y)=>`${x} happened before ${y}.`);
  const truthful = Math.random() < 0.65;
  const conclusion = truthful
    ? `${chain.order[0]} happened before ${chain.order[3]}.`
    : `${chain.order[2]} happened before ${chain.order[1]}.`;
  return { type:'Comparison Chronological', instructions:'Treat “before” as an ordered time relation.', premises: chain.premises, conclusion, answer:truthful, difficulty:3 };
}

function generateSyllogism(){
  const [A,B,C] = pickMany(TOKENS,3);
  const pattern = randInt(1,4);
  let premises, conclusion, answer;
  if(pattern === 1){
    premises = [`All ${A} are ${B}.`,`All ${B} are ${C}.`];
    answer = true; conclusion = `All ${A} are ${C}.`;
  } else if(pattern === 2){
    premises = [`All ${A} are ${B}.`,`No ${B} are ${C}.`];
    answer = true; conclusion = `No ${A} are ${C}.`;
  } else if(pattern === 3){
    premises = [`Some ${A} are ${B}.`,`All ${B} are ${C}.`];
    answer = true; conclusion = `Some ${A} are ${C}.`;
  } else {
    premises = [`Some ${A} are ${B}.`,`Some ${B} are ${C}.`];
    answer = false; conclusion = `All ${A} are ${C}.`;
  }
  return { type:'Syllogism', instructions:'Decide whether the conclusion necessarily follows from the premises.', premises, conclusion, answer, difficulty:2 };
}

function generateLinearArrangement(){
  const names = pickMany(PEOPLE,5);
  const order = shuffled(names);
  const premises = [
    `${order[0]} is left of ${order[1]}.`,
    `${order[1]} is left of ${order[2]}.`,
    `${order[2]} is left of ${order[3]}.`,
    `${order[3]} is left of ${order[4]}.`
  ];
  const truthful = Math.random() < 0.65;
  const conclusion = truthful ? `${order[0]} is left of ${order[4]}.` : `${order[4]} is left of ${order[1]}.`;
  return { type:'Linear Arrangement', instructions:'Visualize a straight line from left to right.', premises, conclusion, answer:truthful, difficulty:4 };
}

function generateCircularArrangement(){
  const names = pickMany(PEOPLE,4);
  const order = shuffled(names);
  const premises = [
    `${order[0]} is next to ${order[1]}.`,
    `${order[1]} is next to ${order[2]}.`,
    `${order[2]} is next to ${order[3]}.`,
    `${order[3]} is next to ${order[0]}.`
  ];
  const truthful = Math.random() < 0.65;
  const conclusion = truthful ? `${order[0]} is opposite ${order[2]}.` : `${order[0]} is opposite ${order[1]}.`;
  return { type:'Circular Arrangement', instructions:'Imagine four people seated around a circle.', premises, conclusion, answer:truthful, difficulty:4 };
}

function generateDirection(){
  const path = [{x:0,y:0}];
  const dirs = pickMany(DIRECTIONS_2D,4);
  const steps = dirs.map(()=>randInt(1,4));
  let pos={x:0,y:0};
  const premises=[];
  for(let i=0;i<dirs.length;i++){
    const dir=dirs[i], step=steps[i];
    premises.push(`Move ${step} step${step>1?'s':''} ${dir}.`);
    if(dir==='north') pos.y += step;
    if(dir==='south') pos.y -= step;
    if(dir==='east') pos.x += step;
    if(dir==='west') pos.x -= step;
  }
  const truthful = Math.random() < 0.65;
  const dx=pos.x, dy=pos.y;
  const truthText = describe2D(dx,dy);
  let conclusion = truthful ? `The final position is ${truthText} of the start.` : `The final position is ${describe2D(dx? -dx : 1, dy)} of the start.`;
  if(!truthText) conclusion = truthful ? `The final position is at the starting point.` : `The final position is east of the start.`;
  if(truthText === '') conclusion = truthful ? `The final position is at the starting point.` : `The final position is north of the start.`;
  return { type:'Direction', instructions:'Accumulate the moves and compare the final position with the start.', premises, conclusion, answer:truthful, difficulty:4 };
}
function describe2D(dx,dy){
  if(dx===0 && dy===0) return '';
  const parts=[];
  if(dy>0) parts.push('north'); if(dy<0) parts.push('south'); if(dx>0) parts.push('east'); if(dx<0) parts.push('west');
  return parts.join('-');
}

function generateDirection3DSpatial(){
  const moves = [
    ['north',[0,1,0]],['south',[0,-1,0]],['east',[1,0,0]],['west',[-1,0,0]],['up',[0,0,1]],['down',[0,0,-1]]
  ];
  let x=0,y=0,z=0;
  const picked = pickMany(moves,4);
  const premises=[];
  for(const [name,[dx,dy,dz]] of picked){
    const step=randInt(1,3);
    premises.push(`Move ${step} step${step>1?'s':''} ${name}.`);
    x += dx*step; y += dy*step; z += dz*step;
  }
  const truthful = Math.random() < 0.65;
  const truth = describe3D(x,y,z);
  const falseText = truth.includes('above') ? truth.replace('above','below') : (truth ? truth + ' and above' : 'above');
  const conclusion = truthful ? `The final position is ${truth || 'at the starting point'}.` : `The final position is ${falseText}.`;
  return { type:'Direction3D Spatial', instructions:'Track movement in 3D space including vertical displacement.', premises, conclusion, answer:truthful, difficulty:5 };
}
function describe3D(x,y,z){
  const horiz = describe2D(x,y);
  const parts=[];
  if(horiz) parts.push(`${horiz} of the start`);
  if(z>0) parts.push('above the start');
  if(z<0) parts.push('below the start');
  return parts.join(' and ');
}

function generateDirection3DTemporal(){
  const events = pickMany(EVENTS,4);
  const order = shuffled(events);
  const premises = [
    `${order[0]} happened before ${order[1]}.`,
    `${order[1]} happened before ${order[2]}.`,
    `${order[2]} happened before ${order[3]}.`
  ];
  const truthful = Math.random() < 0.65;
  const conclusion = truthful ? `${order[0]} happened before ${order[3]}.` : `${order[3]} happened before ${order[1]}.`;
  return { type:'Direction3D Temporal', instructions:'Treat temporal direction like ordered placement on a timeline.', premises, conclusion, answer:truthful, difficulty:4 };
}

function generateGraphMatching(){
  const names = pickMany(TOKENS,4);
  const order = shuffled(names);
  const premises = [
    `${order[0]} is greater than ${order[1]}.`,
    `${order[1]} is greater than ${order[2]}.`,
    `${order[2]} is greater than ${order[3]}.`
  ];
  const truthful = Math.random() < 0.65;
  const conclusion = truthful ? `${order[0]} is greater than ${order[3]}.` : `${order[3]} is greater than ${order[1]}.`;
  return { type:'Graph Matching', instructions:'Resolve the graph by chaining the relations transitively.', premises, conclusion, answer:truthful, difficulty:3 };
}

function generateAnalogy(){
  const [p1,p2,p3,p4] = pickMany(ANALOGY_PAIRS,4);
  const truthful = Math.random() < 0.65;
  const correct = p3[1];
  const wrong = p4[1];
  const conclusion = `${p1[0]} : ${p1[1]} :: ${p3[0]} : ${truthful ? correct : wrong}`;
  const premises = [
    `The second word should stand in the same relation to the third pair as in the first pair.`
  ];
  return { type:'Analogy', instructions:'Identify the matching relationship rather than surface similarity.', premises, conclusion, answer:truthful, difficulty:2 };
}

function generateBinary(){
  const p = Math.random() < 0.5;
  const q = Math.random() < 0.5;
  const op = sample(BINARY_OPS);
  const real = evalBinary(p,q,op);
  const truthful = Math.random() < 0.65;
  const stated = truthful ? real : !real;
  const premises = [`P = ${p}`, `Q = ${q}`, `${op} returns a Boolean result.`];
  const conclusion = `${op}(P, Q) is ${stated}.`;
  return { type:'Binary', instructions:'Use the binary operator on the given truth values.', premises, conclusion, answer:truthful, difficulty:2 };
}
function evalBinary(p,q,op){
  if(op==='AND') return p && q;
  if(op==='OR') return p || q;
  if(op==='XOR') return (!!p) !== (!!q);
  if(op==='NAND') return !(p && q);
  return false;
}

function generateQuestion(){
  const candidates = unlockedTypes();
  if(!candidates.length){
    state.settings.enabledTypes['Distinction'] = true;
    return generateDistinction();
  }
  const type = sample(candidates);
  switch(type){
    case 'Distinction': return generateDistinction();
    case 'Comparison Numerical': return generateComparisonNumerical();
    case 'Comparison Chronological': return generateComparisonChronological();
    case 'Syllogism': return generateSyllogism();
    case 'Linear Arrangement': return generateLinearArrangement();
    case 'Circular Arrangement': return generateCircularArrangement();
    case 'Direction': return generateDirection();
    case 'Direction3D Spatial': return generateDirection3DSpatial();
    case 'Direction3D Temporal': return generateDirection3DTemporal();
    case 'Graph Matching': return generateGraphMatching();
    case 'Analogy': return generateAnalogy();
    case 'Binary': return generateBinary();
    default: return generateDistinction();
  }
}

function setScreen(screen){
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`screen-${screen}`);
  if(target) target.classList.remove('hidden');
  document.getElementById('drawer').classList.add('hidden');
  document.getElementById('drawer').setAttribute('aria-hidden','true');
  if(screen === 'game' && !state.currentQuestion) startMode(state.mode || 'arcade');
  render();
}

let timerHandle = null;
let remaining = 0;
function startTimer(){
  clearInterval(timerHandle);
  remaining = Number(state.settings.timerSeconds || 0);
  updateTimerUI();
  if(!remaining) return;
  timerHandle = setInterval(()=>{
    remaining -= 1;
    updateTimerUI();
    if(remaining <= 0){
      clearInterval(timerHandle);
      handleAnswer(null);
    }
  }, 1000);
}
function updateTimerUI(){
  const total = Number(state.settings.timerSeconds || 0);
  const fill = document.getElementById('timerFill');
  const label = document.getElementById('timerLabel');
  if(!total){ fill.style.width='100%'; label.textContent='Timer off'; return; }
  fill.style.width = `${clamp((remaining/total)*100,0,100)}%`;
  label.textContent = `${remaining}s remaining`;
}

function startMode(mode){
  state.mode = mode;
  state.currentQuestion = generateQuestion();
  state.questionStartTs = now();
  persist();
  setScreen('game');
  startTimer();
}

function handleAnswer(userAnswer){
  if(!state.currentQuestion) return;
  clearInterval(timerHandle);
  const q = state.currentQuestion;
  const spent = Math.max(1, Math.round((now() - state.questionStartTs) / 1000));
  addPlaytime(spent);
  const outcome = userAnswer === null ? 'timeout' : (userAnswer === q.answer ? 'correct' : 'incorrect');
  if(state.mode === 'arcade'){
    if(outcome === 'correct'){
      state.score += 10;
      state.streak += 1;
      state.longestStreak = Math.max(state.longestStreak, state.streak);
    } else {
      state.score = Math.max(0, state.score - 10);
      state.streak = 0;
    }
  }
  const stat = ensureTypeStat(q.type);
  stat.asked += 1;
  stat[outcome] += 1;
  state.history.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(now()+Math.random()),
    ts: now(),
    type: q.type,
    premises: q.premises,
    conclusion: q.conclusion,
    answer: q.answer,
    userAnswer,
    outcome,
    mode: state.mode,
    spent,
    instructions: q.instructions || ''
  });
  state.history = state.history.slice(0,300);
  const message = outcome === 'correct' ? 'Correct' : outcome === 'incorrect' ? 'Incorrect' : 'Time out';
  toast(`${message} · ${q.type}`);
  state.currentQuestion = generateQuestion();
  state.questionStartTs = now();
  persist();
  render();
  startTimer();
}

function renderTierChip(){
  const tier = getTierName(state.score);
  const chip = document.getElementById('tierChip');
  chip.textContent = `${tier} · ${state.score} pts`;
  const [bg,fg] = tierColor(state.score);
  chip.style.background = bg;
  chip.style.color = fg;
}

function renderStart(){
  const tier = getTierName(state.score);
  document.getElementById('startTierName').textContent = tier;
  document.getElementById('startScore').textContent = `${state.score} pts`;
  const next = nextTierInfo(state.score);
  document.getElementById('nextTierHint').textContent = next ? `Next ${next.name} · ${next.remaining} pts left` : 'Top tier reached';
  const agg = allTimeStats();
  document.getElementById('statCorrect').textContent = agg.correct;
  document.getElementById('statTimeout').textContent = agg.timeout;
  document.getElementById('statIncorrect').textContent = agg.incorrect;
  document.getElementById('statLongest').textContent = state.longestStreak;
  document.getElementById('statCurrent').textContent = state.streak;
  document.getElementById('statPlayToday').textContent = fmtDuration(Math.round(getPlaytimeToday()));
  document.getElementById('statPlayWeek').textContent = fmtDuration(Math.round(getPlaytimeWeek()));
  const goalSec = Math.max(300, (Number(state.settings.dailyGoalMinutes) || 20) * 60);
  const pct = Math.round(clamp((getPlaytimeToday()/goalSec)*100, 0, 100));
  document.getElementById('dailyProgressPercent').textContent = `${pct}%`;
  document.querySelector('.ring').style.background = `conic-gradient(var(--primary) ${pct*3.6}deg, #dbe7f3 0deg)`;
}

function renderGame(){
  const q = state.currentQuestion;
  if(!q) return;
  document.getElementById('questionTypePill').textContent = q.type;
  document.getElementById('questionDifficultyPill').textContent = `Premises ${q.premises.length}`;
  document.getElementById('modeLabel').textContent = state.mode === 'arcade' ? 'Arcade' : 'Playground';
  const inst = document.getElementById('questionInstructions');
  if(q.instructions){ inst.classList.remove('hidden'); inst.textContent = q.instructions; }
  else inst.classList.add('hidden');
  document.getElementById('premisesList').innerHTML = q.premises.map((p,i)=>`<div class="premise-item"><b>${i+1}.</b> ${escapeHtml(p)}</div>`).join('');
  document.getElementById('conclusionBox').textContent = q.conclusion;
}

function renderHistory(){
  const host = document.getElementById('historyList');
  if(!state.history.length){ host.innerHTML = '<div class="mini-card">No questions answered yet.</div>'; return; }
  host.innerHTML = state.history.map(item => `
    <article class="history-item ${item.outcome}">
      <div class="history-top">
        <div><b>${escapeHtml(item.type)}</b> · ${escapeHtml(item.mode)}</div>
        <div class="muted small">${new Date(item.ts).toLocaleString()} · ${item.spent}s</div>
      </div>
      <div class="history-premises">${item.premises.map((p,i)=>`<div>${i+1}. ${escapeHtml(p)}</div>`).join('')}</div>
      <div class="history-conclusion"><b>Conclusion:</b> ${escapeHtml(item.conclusion)}</div>
      <div class="muted small">Correct answer: <b>${item.answer ? 'True' : 'False'}</b> · Your answer: <b>${item.userAnswer === null ? 'Timeout' : item.userAnswer ? 'True' : 'False'}</b></div>
    </article>
  `).join('');
}

function renderStats(){
  const host = document.getElementById('statsGrid');
  const cards = QUESTION_TYPES.map(type => {
    const stat = state.statsByType[type] || { asked:0, correct:0, incorrect:0, timeout:0 };
    const acc = stat.asked ? Math.round((stat.correct / stat.asked) * 100) : 0;
    return `
      <div class="type-card">
        <b>${escapeHtml(type)}</b>
        <div class="row"><span>Asked</span><span>${stat.asked}</span></div>
        <div class="row"><span>Correct</span><span>${stat.correct}</span></div>
        <div class="row"><span>Incorrect</span><span>${stat.incorrect}</span></div>
        <div class="row"><span>Timeout</span><span>${stat.timeout}</span></div>
        <div class="row"><span>Accuracy</span><span>${acc}%</span></div>
      </div>`;
  }).join('');
  host.innerHTML = cards;
  const agg = allTimeStats();
  const total = agg.correct + agg.incorrect + agg.timeout;
  const accuracy = total ? Math.round((agg.correct / total) * 100) : 0;
  document.getElementById('accuracyValue').textContent = `${accuracy}%`;
  document.getElementById('totalAnsweredValue').textContent = total;
}

function renderSettings(){
  document.getElementById('timerTypeSelect').value = String(state.settings.timerSeconds);
  document.getElementById('displayModeSelect').value = state.settings.displayMode;
  document.getElementById('dailyGoalInput').value = state.settings.dailyGoalMinutes;
  const idx = getTierIndex(state.score);
  const unlockFlags = TIERS_MATRIX[idx] || TIERS_MATRIX[0];
  document.getElementById('questionTypeToggles').innerHTML = QUESTION_TYPES.map((type,i)=>{
    const unlocked = !!unlockFlags[i];
    const checked = state.settings.enabledTypes[type] !== false && unlocked;
    return `
      <label class="toggle-item ${unlocked ? '' : 'disabled'}">
        <span>${escapeHtml(type)} ${unlocked ? '' : '<span class="muted small">(locked by tier)</span>'}</span>
        <input type="checkbox" data-type-toggle="${escapeHtml(type)}" ${checked ? 'checked' : ''} ${unlocked ? '' : 'disabled'} />
      </label>
    `;
  }).join('');
}

function renderTiers(){
  const host = document.getElementById('tiersMatrix');
  const head = ['Tier','Score range', ...QUESTION_TYPES].map(h=>`<th>${escapeHtml(h)}</th>`).join('');
  const rows = TIER_NAMES.map((name,i)=>{
    const range = TIER_SCORE_RANGES[i];
    const scoreText = `${range.min === -Infinity ? '0' : range.min}–${range.max === Infinity ? '∞' : range.max}`;
    const flags = TIERS_MATRIX[i] || TIERS_MATRIX[14];
    return `<tr><td><b>${name}</b></td><td>${scoreText}</td>${flags.map(v=>`<td>${v ? '✓' : '—'}</td>`).join('')}</tr>`;
  }).join('');
  host.innerHTML = `<table class="matrix-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function render(){
  renderTierChip();
  renderStart();
  renderGame();
  renderHistory();
  renderStats();
  renderSettings();
  renderTiers();
  persist();
}

function exportState(){
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'syllogimous-clone-data.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 500);
}

function importState(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...(parsed.settings || {}) } };
      persist();
      render();
      toast('Data imported');
    } catch {
      toast('Invalid file');
    }
  };
  reader.readAsText(file);
}

function bindEvents(){
  document.getElementById('skipIntroBtn').addEventListener('click', ()=>{
    state.dontShowIntro = document.getElementById('dontShowIntroAgain').checked;
    persist();
    setScreen('start');
  });
  document.getElementById('menuButton').addEventListener('click', ()=>{
    const drawer = document.getElementById('drawer');
    drawer.classList.toggle('hidden');
    drawer.setAttribute('aria-hidden', drawer.classList.contains('hidden') ? 'true' : 'false');
  });
  document.getElementById('drawer').addEventListener('click', e=>{
    if(e.target.id === 'drawer') document.getElementById('drawer').classList.add('hidden');
  });
  document.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click', ()=>setScreen(btn.dataset.screen)));
  document.querySelectorAll('[data-screen-open]').forEach(btn=>btn.addEventListener('click', ()=>setScreen(btn.dataset.screenOpen)));
  document.getElementById('arcadeBtn').addEventListener('click', ()=>startMode('arcade'));
  document.getElementById('playgroundBtn').addEventListener('click', ()=>startMode('playground'));
  document.getElementById('trueBtn').addEventListener('click', ()=>handleAnswer(true));
  document.getElementById('falseBtn').addEventListener('click', ()=>handleAnswer(false));
  document.getElementById('clearHistoryBtn').addEventListener('click', ()=>{
    if(confirm('Clear history?')){ state.history=[]; state.statsByType={}; persist(); render(); }
  });
  document.getElementById('saveSettingsBtn').addEventListener('click', ()=>{
    state.settings.timerSeconds = Number(document.getElementById('timerTypeSelect').value);
    state.settings.displayMode = document.getElementById('displayModeSelect').value;
    state.settings.dailyGoalMinutes = clamp(Number(document.getElementById('dailyGoalInput').value || 20), 5, 240);
    document.querySelectorAll('[data-type-toggle]').forEach(cb => {
      state.settings.enabledTypes[cb.dataset.typeToggle] = cb.checked;
    });
    persist(); render(); toast('Settings saved');
  });
  document.getElementById('resetProgressBtn').addEventListener('click', ()=>{
    if(confirm('Reset all progress and settings?')){ state = defaultState(); persist(); setScreen('intro'); render(); }
  });
  document.getElementById('exportStateBtn').addEventListener('click', exportState);
  document.getElementById('importStateInput').addEventListener('change', e=>{
    const file = e.target.files?.[0];
    if(file) importState(file);
  });
}

function maybeShowIntro(){
  document.getElementById('dontShowIntroAgain').checked = !!state.dontShowIntro;
  if(state.dontShowIntro) setScreen('start');
  else setScreen('intro');
}

function registerSW(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
}

bindEvents();
render();
maybeShowIntro();
registerSW();
