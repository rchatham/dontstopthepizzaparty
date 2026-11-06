// Exercise the audio sequence with a fake clock and audio graph, without a browser.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup() {
  const nodes = new Map(), timers = new Map(), tones = []; let id = 0;
  function node(key) {
    if (!nodes.has(key)) nodes.set(key, {value:'50',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},handlers:{},children:[],attrs:{},textContent:'',
      addEventListener(e,fn){this.handlers[e]=fn;},setAttribute(k,v){this.attrs[k]=v;},getBoundingClientRect(){return {left:0,top:0,width:600,height:300};},
      querySelector:node,appendChild(n){this.children.push(n);},remove(){},contains(){return false;}});
    return nodes.get(key);
  }
  const hero=node('.dsp-hero');hero.dataset={lights:'fade'};
  for(const [key,val] of Object.entries({'stage-tempo':'124','stage-motion':'150','stage-kick':'80','stage-bass':'40','stage-hats':'50','stage-groove':'house','stage-volume':'25'})) node(key).value=val;
  const param=()=>({setValueAtTime(){},setTargetAtTime(){},exponentialRampToValueAtTime(){}});
  class Audio {
    constructor(){this.state='suspended';this.currentTime=0;}
    async resume(){this.state='running';}
    createGain(){return {gain:param(),connect(){},disconnect(){}};}
    createBiquadFilter(){return {frequency:param(),connect(){}};}
    createOscillator(){const record={};tones.push(record);return {frequency:{setValueAtTime(f){record.frequency=f;},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){}};}
  }
  const document={hidden:false,querySelector:node,getElementById:node,createElement:()=>node('particle'+id++),addEventListener(e,f){this[e]=f;}};
  const ctx={document,window:{AudioContext:Audio,matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}},location:{search:''},performance:{now:()=>1000},setTimeout(f,ms){const n=++id;timers.set(n,{f,ms});return n;},clearTimeout(n){timers.delete(n);},setInterval(){}};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../files/stage.js'),'utf8'),ctx);
  function tick(){const entry=[...timers].find(([,v])=>v.f.name==='beat');assert.ok(entry,'beat scheduled');timers.delete(entry[0]);entry[1].f();}
  return {node,hero,document,tones,tick,click:()=>node('.dsp-party-button').handlers.click()};
}
test('drop builds on beat, pauses, returns with sub bass and 48 particles, then releases button',async()=>{
  const s=setup();s.click();await new Promise(setImmediate);
  assert.equal(s.hero.dataset.drop,'build');assert.equal(s.node('.dsp-party-button').disabled,true);
  s.click(); // Repeated requests cannot restart the build.
  for(let i=0;i<15;i++)s.tick();assert.equal(s.hero.dataset.drop,'break');
  let before=s.tones.length;s.tick();s.tick();assert.equal(s.tones.length,before);
  s.tick();assert.equal(s.hero.dataset.drop,'drop');assert.ok(s.tones.some(t=>t.frequency===75));
  assert.equal(s.node('.dsp-party-effects').children.length,48);
  for(let i=0;i<15;i++)s.tick();assert.equal(s.hero.dataset.drop,'idle');assert.equal(s.node('.dsp-party-button').disabled,false);
});
test('mute cancels an active drop and future button presses remain silent',async()=>{
  const s=setup();s.click();await new Promise(setImmediate);
  s.node('stage-sound').handlers.click();assert.equal(s.hero.dataset.drop,'idle');
  const before=s.tones.length;s.click();assert.equal(s.tones.length,before);assert.equal(s.node('stage-sound').attrs['aria-pressed'],'false');
});
test('hiding the page cancels the sequence',async()=>{
 const s=setup();s.click();await new Promise(setImmediate);s.document.hidden=true;s.document.visibilitychange();assert.equal(s.hero.dataset.drop,'idle');assert.equal(s.node('.dsp-party-button').disabled,false);
});
