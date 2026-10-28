const foods = [
 {id:"apple",name:"Apple",emoji:"🍎",kind:"fruit",likes:["sweet","crunchy"]},
 {id:"banana",name:"Banana",emoji:"🍌",kind:"fruit",likes:["sweet","soft"]},
 {id:"carrot",name:"Carrot",emoji:"🥕",kind:"veggie",likes:["crunchy"]},
 {id:"broccoli",name:"Broccoli",emoji:"🥦",kind:"veggie",likes:["healthy"]},
 {id:"fish",name:"Fish",emoji:"🐟",kind:"protein",likes:["cooked"]},
 {id:"chicken",name:"Chicken",emoji:"🍗",kind:"protein",likes:["cooked"]},
 {id:"egg",name:"Egg",emoji:"🥚",kind:"protein",likes:["cooked"]},
 {id:"cheese",name:"Cheese",emoji:"🧀",kind:"dairy",likes:["salty"]},
 {id:"bread",name:"Bread",emoji:"🍞",kind:"grain",likes:["toasty","crunchy"]},
 {id:"corn",name:"Corn",emoji:"🌽",kind:"veggie",likes:["sweet"]},
 {id:"mushroom",name:"Mushroom",emoji:"🍄",kind:"veggie",likes:["cooked"]},
 {id:"strawberry",name:"Strawberry",emoji:"🍓",kind:"fruit",likes:["sweet"]},
 {id:"chili",name:"Chili",emoji:"🌶️",kind:"spicy",likes:["spicy"]},
 {id:"lemon",name:"Lemon",emoji:"🍋",kind:"fruit",likes:["sour"]},
 {id:"shrimp",name:"Shrimp",emoji:"🍤",kind:"protein",likes:["cooked"]},
 {id:"potato",name:"Potato",emoji:"🥔",kind:"veggie",likes:["cooked","crunchy"]}
];
const friends = {
 milo:{name:"Milo",desc:"Loves crunchy snacks",color:"#72cbbd",shirt:"#72cbbd",likes:["crunchy","cooked","salty"],dislikes:["spicy"],emoji:"🙂"},
 luna:{name:"Luna",desc:"Loves sweet fruit",color:"#d8a1dc",shirt:"#d8a1dc",likes:["sweet","soft"],dislikes:["spicy","sour"],emoji:"😋"},
 bo:{name:"Bo",desc:"Brave taste tester",color:"#83b9ef",shirt:"#83b9ef",likes:["cooked","spicy","sour"],dislikes:[],emoji:"🤩"}
};
let selected = null, dish = null, prepared = null, seasoning = null, currentFriend = "milo", dishesServed = 0, soundOn = true, toastTimer;
const $ = id => document.getElementById(id);
const scene = $("scene");
function renderFoods(){
 $("foodGrid").innerHTML = foods.map(f=>`<button class="food-item ${selected?.id===f.id?"selected":""}" draggable="true" data-food="${f.id}"><span class="emoji">${f.emoji}</span><span class="food-name">${f.name}</span><span class="tag">${f.kind}</span></button>`).join("");
 document.querySelectorAll(".food-item").forEach(el=>{
  el.addEventListener("click",()=>chooseFood(el.dataset.food));
  el.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",el.dataset.food);});
 });
}
function chooseFood(id){
 selected=foods.find(f=>f.id===id); dish={...selected,cooked:false,chopped:false,blended:false,seasonings:[]}; prepared=dish;
 updateSelected(); renderFoods(); showToast(`${selected.name} picked! Try a kitchen tool.`); say(`${selected.name}? Let's see what we can make!`); sound("pick");
}
function updateSelected(){
 const card=$("selectedCard");
 if(!selected){card.innerHTML='<span class="selected-emoji">🍎</span><div><b>Nothing selected</b><small>Choose an ingredient to begin.</small></div>';return}
 card.innerHTML=`<span class="selected-emoji">${dish?.emoji||selected.emoji}</span><div><b>${dish?.name||selected.name}${dish?.chopped?" · chopped":""}${dish?.cooked?" · cooked":""}${dish?.blended?" · blended":""}</b><small>${dish?.seasonings?.length?dish.seasonings.join(", "):"Ready for your next move!"}</small></div>`;
}
function say(text){$("speech").textContent=text}
function showToast(text){const t=$("toast");t.textContent=text;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2100);$("statusText").textContent=text}
function sound(type){
 if(!soundOn)return;
 try{
  const ctx=sound.ctx||(sound.ctx=new (window.AudioContext||window.webkitAudioContext)());
  if(ctx.state==="suspended")ctx.resume();
  const now=ctx.currentTime;
  const notes={pick:[520,.08,"sine"],chop:[190,.07,"triangle"],cook:[250,.18,"sawtooth"],blend:[110,.3,"sawtooth"],season:[740,.12,"triangle"],serve:[600,.12,"sine"],good:[790,.2,"sine"],bad:[150,.25,"triangle"],click:[430,.05,"sine"]};
  const [freq,dur,wave]=notes[type]||notes.click;
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=wave;o.frequency.setValueAtTime(freq,now);
  if(type==="serve"||type==="good"){o.frequency.exponentialRampToValueAtTime(freq*1.5,now+dur)}
  if(type==="bad"){o.frequency.exponentialRampToValueAtTime(freq*.65,now+dur)}
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.13,now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+dur);
  o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+dur+.02);
 }catch(e){}
}
function animate(cls,duration=1300){scene.classList.remove("cooking","blending","chopping","surprise","chew","blink");scene.classList.add(cls);setTimeout(()=>scene.classList.remove(cls),duration)}
function requireFood(){if(!dish){showToast("Pick an ingredient from the fridge first!");say("Choose something tasty first!");return false}return true}
function renderDish(){
 const d=dish;const txt=d?d.emoji+(d.chopped?" ✂️":""):"";
 $("boardFood").textContent=d&&!d.cooked&&!d.blended?txt:"";
 $("panFood").textContent=d&&d.cooked?d.emoji:"";
 $("blenderFood").textContent=d&&d.blended?d.emoji:"";
 $("plateFood").textContent=d&&d.served?d.emoji:"";
 updateSelected();
}
function action(act){
 if(act==="serve"){serveFood();return}
 if(act==="season"){if(!requireFood())return;seasonFood();return}
 if(!requireFood())return;
 if(act==="chop"){
  if(dish.blended){showToast("It's already blended!");return}
  dish.chopped=true;dish.name=selected.name+" pieces";animate("chopping",1100);sound("chop");say("Chop chop chop! Nice and small.");showToast(`${selected.name} chopped into pieces!`);
 }else if(act==="cook"){
  dish.cooked=true;dish.blended=false;dish.name="Cooked "+selected.name.toLowerCase();animate("cooking",2200);sound("cook");say("Sssss! That smells good.");showToast(`${selected.name} is cooking!`);
 }else if(act==="blend"){
  dish.blended=true;dish.chopped=false;dish.name=selected.name+" smoothie";animate("blending",1800);sound("blend");say("Whirrrrr! Smooth and swirly!");showToast("Blending into a smoothie!");
 }
 renderDish();
}
function seasonFood(){
 if(!requireFood())return;
 const options=["salt","pepper","hot sauce","lemon juice","sprinkles"];
 seasoning=options[(Math.random()*options.length)|0];dish.seasonings.push(seasoning);
 if(seasoning==="hot sauce")dish.spicy=true;if(seasoning==="lemon juice")dish.sour=true;if(seasoning==="sprinkles")dish.sweet=true;if(seasoning==="salt")dish.salty=true;
 animate("surprise",900);sound("season");say(`A little ${seasoning}! What could go wrong?`);showToast(`Added ${seasoning}!`);renderDish();
}
function foodTraits(d){
 const traits=[...(d.likes||[])];
 if(d.cooked)traits.push("cooked","toasty");if(d.chopped)traits.push("crunchy");if(d.blended)traits.push("soft","sweet");
 if(d.seasonings?.includes("hot sauce"))traits.push("spicy");
 if(d.seasonings?.includes("lemon juice"))traits.push("sour");
 if(d.seasonings?.includes("salt"))traits.push("salty");
 if(d.seasonings?.includes("sprinkles"))traits.push("sweet");
 return traits;
}
function serveFood(){
 if(!requireFood())return;
 const f=friends[currentFriend],traits=foodTraits(dish);
 const good=traits.some(t=>f.likes.includes(t));
 const bad=traits.some(t=>f.dislikes.includes(t));
 dish.served=true;dishesServed++;$("dishCount").textContent=`${dishesServed} ${dishesServed===1?"dish":"dishes"} served`;
 renderDish();animate("chew",1600);
 if(bad){sound("bad");say(["Whoa! That's a BIG flavor! 😵","My tongue needs a tiny break!","Wow... that was unexpected!"][Math.random()*3|0]);showToast(`${f.name} isn't sure about that one!`);$("mouth").style.transform="scaleY(.4)";}
 else if(good){sound("good");animate("surprise",1300);say(["YUM! Can I have another bite? 😍","You made this just for me?!","That's chef-level cooking! ⭐"][Math.random()*3|0]);showToast(`${f.name} LOVES your creation!`);}
 else{sound("serve");say(["Hmm... interesting!","I've never tried that before.","A very surprising snack!"][Math.random()*3|0]);showToast(`${f.name} tried your creation!`);}
 setTimeout(()=>{$("mouth").style.transform="";},1000);
}
function clearCounter(){
 selected=null;dish=null;prepared=null;seasoning=null;renderFoods();renderDish();say("Ready for a new recipe!");showToast("Counter cleared.");
 $("boardFood").textContent="";$("panFood").textContent="";$("blenderFood").textContent="";$("plateFood").textContent="";
}
function setFriend(id){
 currentFriend=id;const f=friends[id];
 $("characterName").textContent=f.name.toUpperCase();
 document.querySelector(".body").style.background=f.shirt;
 document.querySelector(".body").style.boxShadow=`inset -8px -4px ${id==="milo"?"#53b2a6":id==="luna"?"#bb7bc4":"#5e9bd4"}`;
 document.querySelectorAll(".friend-card").forEach(el=>{el.classList.toggle("active",el.dataset.friend===id);el.querySelector("span:last-child").textContent=el.dataset.friend===id?"✓":""});
 say(`Hi! I'm ${f.name}. Let's make something!`);showToast(`${f.name} joined the kitchen!`);sound("click");
}
document.querySelectorAll(".action-btn").forEach(b=>b.addEventListener("click",()=>action(b.dataset.action)));
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 ["fridge","tools","people"].forEach(tab=>$(`${tab}Panel`).classList.toggle("hidden",tab!==b.dataset.tab));sound("click");
}));
document.querySelectorAll(".tool-card").forEach(b=>b.addEventListener("click",()=>{
 const map={board:"chop",pan:"cook",blender:"blend",season:"season",plate:"serve"};action(map[b.dataset.tool]);
}));
document.querySelectorAll(".friend-card").forEach(b=>b.addEventListener("click",()=>setFriend(b.dataset.friend)));
$("clearBtn").addEventListener("click",clearCounter);
$("resetBtn").addEventListener("click",()=>{clearCounter();dishesServed=0;$("dishCount").textContent="0 dishes served";say("Welcome back! What are we cooking?");showToast("Kitchen restarted.");});
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundToggle").textContent=soundOn?"🔊 Sound On":"🔇 Sound Off";if(soundOn)sound("good")});
scene.addEventListener("dragover",e=>{e.preventDefault();$("dropHint").style.opacity=1});
scene.addEventListener("dragleave",()=>$("dropHint").style.opacity=0);
scene.addEventListener("drop",e=>{e.preventDefault();$("dropHint").style.opacity=0;const id=e.dataTransfer.getData("text/plain");if(id)chooseFood(id)});
$("board").addEventListener("click",()=>action("chop"));
$("stove").addEventListener("click",()=>action("cook"));
$("pan").addEventListener("click",()=>action("cook"));
$("blender").addEventListener("click",()=>action("blend"));
$("plate").addEventListener("click",serveFood);
$("character").addEventListener("click",()=>{say(`Hey! I'm ${friends[currentFriend].name}. Feed me something yummy!`);sound("click")});
setInterval(()=>{if(Math.random()>.58){scene.classList.add("blink");setTimeout(()=>scene.classList.remove("blink"),170)}},3200);
renderFoods();renderDish();
