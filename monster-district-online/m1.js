'use strict';
const c=document.getElementById('game'),ctx=c.getContext('2d');
const W=c.width,H=c.height,TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const now=()=>performance.now()/1000;
const saveKey='monsterDistrictAlpha02';

const state={scene:'title',paused:false,time:0,shake:0,flash:0,toast:[],particles:[],texts:[],slashes:[],projectiles:[],rain:[],missionStage:0,bankRobberyStarted:false,bankCleared:false,bankRobbing:false,escapeTimer:0,wanted:0,bounty:0,heroRep:0,criminalRep:0,coins:2500,gems:40,kills:0,selectedTransform:1,transformWheel:false,transformHold:0,transformPointer:null,fusionTime:0,mostWanted:[['VoidReaper',61800],['ShadowX',44200],['NightFang',39100]],district:'DOWNTOWN'};
try{Object.assign(state,JSON.parse(localStorage.getItem(saveKey)||'{}'),{scene:'title',paused:false,toast:[],particles:[],texts:[],slashes:[],projectiles:[],rain:[],transformWheel:false,transformPointer:null})}catch{}
const save=()=>localStorage.setItem(saveKey,JSON.stringify({bankCleared:state.bankCleared,heroRep:state.heroRep,criminalRep:state.criminalRep,coins:state.coins,gems:state.gems,bounty:state.bounty}));

const forms={
 human:{id:'human',name:'RIFTWALKER',accent:'#63e6ff',accent2:'#ff476f',hp:160,en:120,speed:235,atk:18,range:58,role:'HUMAN',skill:'CORE BURST'},
 volt:{id:'volt',name:'VOLT',accent:'#66eaff',accent2:'#ffe04b',hp:138,en:145,speed:330,atk:21,range:64,role:'SPEED',skill:'ARC DASH'},
 titan:{id:'titan',name:'TITAN',accent:'#ff9a55',accent2:'#ffd07a',hp:260,en:105,speed:165,atk:36,range:80,role:'TANK',skill:'QUAKE'},
 phantom:{id:'phantom',name:'PHANTOM',accent:'#ba8cff',accent2:'#6ef0ff',hp:126,en:160,speed:295,atk:27,range:72,role:'STEALTH',skill:'VOID STEP'},
 inferno:{id:'inferno',name:'INFERNO',accent:'#ff674d',accent2:'#ffd15c',hp:180,en:125,speed:230,atk:31,range:76,role:'FIRE',skill:'FIRE RING'},
 thunder:{id:'thunder',name:'THUNDER COLOSSUS',accent:'#74eaff',accent2:'#ffb64a',hp:340,en:180,speed:210,atk:52,range:95,role:'FUSION',skill:'TEMPEST SLAM'}
};
const player={x:1230,y:1070,vx:0,vy:0,form:'human',hp:160,maxHp:160,en:120,maxEn:120,attackCd:0,skillCd:0,dashCd:0,inv:0,fusion:0,combo:0,comboT:0,angle:-Math.PI/2,dead:false,moveMag:0,walkT:0};

const cleanRoom=s=>(String(s||'downtown').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24)||'downtown');
const roomParam=new URLSearchParams(location.search).get('room');
const net={room:cleanRoom(roomParam),id:(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2))+Math.random().toString(36).slice(2,7),name:localStorage.getItem('mdPlayerName')||('Rift'+String(Math.floor(1000+Math.random()*9000))),client:null,connected:false,topic:'',base:'',lastSend:0,error:false};
localStorage.setItem('mdPlayerName',net.name);
const remotePlayers=new Map();
function initMultiplayer(){
 if(net.client)return;
 if(!window.mqtt){net.error=true;return}
 net.base=`monster-district/alpha-021-online/${net.room}`;net.topic=`${net.base}/players/${net.id}`;
 try{
  const leave=JSON.stringify({type:'leave',id:net.id});
  const client=window.mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:'md_'+net.id.replace(/[^a-zA-Z0-9]/g,'').slice(0,20),clean:true,keepalive:15,reconnectPeriod:1500,connectTimeout:9000,will:{topic:net.topic,payload:leave,qos:0,retain:false}});
  net.client=client;
  client.on('connect',()=>{net.connected=true;net.error=false;client.subscribe(`${net.base}/players/+`,{qos:0});publishNet(true);toast('ONLINE',`Room: ${net.room} • ${net.name}`,'#69f0b1')});
  client.on('reconnect',()=>{net.connected=false});
  client.on('close',()=>{net.connected=false});
  client.on('offline',()=>{net.connected=false});
  client.on('error',()=>{net.connected=false;net.error=true});
  client.on('message',(topic,payload)=>{
   if(topic===net.topic)return;
   try{
    const d=JSON.parse(payload.toString());if(!d||!d.id||d.id===net.id)return;
    if(d.type==='leave'){remotePlayers.delete(d.id);return}
    if(!Number.isFinite(d.x)||!Number.isFinite(d.y))return;
    let r=remotePlayers.get(d.id);
    if(!r){r={id:d.id,name:String(d.name||'Rift').slice(0,18),x:d.x,y:d.y,tx:d.x,ty:d.y,angle:d.angle||0,tangle:d.angle||0,form:forms[d.form]?d.form:'human',move:0,walkT:Math.random()*8,lastSeen:performance.now(),wanted:0};remotePlayers.set(d.id,r)}
    r.tx=clamp(d.x,0,world.w);r.ty=clamp(d.y,0,world.h);r.tangle=Number.isFinite(d.angle)?d.angle:r.tangle;r.form=forms[d.form]?d.form:'human';r.name=String(d.name||r.name).slice(0,18);r.move=clamp(Number(d.move)||0,0,1);r.wanted=clamp(Number(d.wanted)||0,0,5);r.lastSeen=performance.now();
   }catch{}
  });
 }catch{net.error=true}
}
function publishNet(force=false){
 if(!net.client||!net.connected||state.scene!=='play')return;
 const t=performance.now();if(!force&&t-net.lastSend<80)return;net.lastSend=t;
 const payload=JSON.stringify({type:'state',id:net.id,name:net.name,x:Math.round(player.x*10)/10,y:Math.round(player.y*10)/10,angle:Math.round(player.angle*1000)/1000,form:player.form,move:Math.round((player.moveMag||0)*100)/100,wanted:state.wanted,ts:Date.now()});
 try{net.client.publish(net.topic,payload,{qos:0,retain:false})}catch{}
}
function updateRemotePlayers(dt){
 const n=performance.now();
 for(const [id,r] of remotePlayers){if(n-r.lastSeen>4500){remotePlayers.delete(id);continue}r.x=lerp(r.x,r.tx,Math.min(1,dt*12));r.y=lerp(r.y,r.ty,Math.min(1,dt*12));let da=((r.tangle-r.angle+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;r.angle+=da*Math.min(1,dt*12);r.walkT+=dt*(2.6+r.move*9)}
}
function leaveMultiplayer(){if(net.client&&net.connected){try{net.client.publish(net.topic,JSON.stringify({type:'leave',id:net.id}),{qos:0,retain:false})}catch{}}}
addEventListener('pagehide',leaveMultiplayer);addEventListener('beforeunload',leaveMultiplayer);
