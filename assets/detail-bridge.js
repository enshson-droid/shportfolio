/* Keep the portfolio controls working when detail pages are separate files. */
(function(){
  if(window.parent===window) return;
  var activeScrollNodes=new Set();
  function send(type,extra){
    window.parent.postMessage(Object.assign({__portfolioDetailBridge:true,type:type},extra||{}),'*');
  }
  function currentY(){
    var y=Math.max(window.scrollY||0,document.documentElement.scrollTop||0,document.body ? document.body.scrollTop||0 : 0);
    activeScrollNodes.forEach(function(node){
      if(!node.isConnected || node.scrollTop<=0) activeScrollNodes.delete(node);
      else y=Math.max(y,node.scrollTop);
    });
    return y;
  }
  function reportScroll(){send('scroll',{y:currentY()});}
  window.addEventListener('scroll',reportScroll,{passive:true});
  document.addEventListener('scroll',function(event){
    var node=event.target;
    if(node && node.nodeType===1 && node!==document.body && node!==document.documentElement){
      if(node.scrollTop>0) activeScrollNodes.add(node);
      else activeScrollNodes.delete(node);
    }
    reportScroll();
  },{passive:true,capture:true});
  document.addEventListener('mousemove',function(event){
    send('pointer',{x:event.clientX,y:event.clientY,width:window.innerWidth,height:window.innerHeight});
  },{passive:true,capture:true});
  document.addEventListener('click',function(event){
    var origin=event.target && (event.target.nodeType===1 ? event.target : event.target.parentElement);
    var link=origin && origin.closest && origin.closest('a[href^="#"]');
    if(!link) return;
    var hash=link.getAttribute('href');
    if(!hash || hash.length<2) return;
    var target;
    try{target=document.getElementById(decodeURIComponent(hash.slice(1)));}catch(_){return;}
    if(!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
  },true);
  window.addEventListener('message',function(event){
    if(event.source!==window.parent || !event.data || !event.data.__portfolioDetailBridge || event.data.type!=='scrollToTop') return;
    activeScrollNodes.forEach(function(node){node.scrollTo({top:0,left:0,behavior:'smooth'});});
    (document.scrollingElement||document.documentElement).scrollTo({top:0,left:0,behavior:'smooth'});
    window.scrollTo({top:0,left:0,behavior:'smooth'});
  });
  window.addEventListener('load',reportScroll);
  reportScroll();
})();
