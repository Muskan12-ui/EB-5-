window.__ok=true;
document.addEventListener('DOMContentLoaded', function () {

  var topbar = document.getElementById('topbar');
  function onScroll(){ if(topbar) topbar.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll); onScroll();

  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu){
    burger.addEventListener('click', function(){ menu.classList.toggle('open'); burger.textContent = menu.classList.contains('open') ? '✕' : '☰'; });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('open'); burger.textContent='☰'; }); });
  }

  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.menu a').forEach(function(a){
    var href = a.getAttribute('href') || '';
    if (href === here) a.classList.add('active');
  });

  var pbar = document.createElement('div');
  pbar.className = 'progressbar';
  document.body.appendChild(pbar);
  function prog(){
    var h = document.documentElement;
    var m = h.scrollHeight - h.clientHeight;
    pbar.style.width = (m > 0 ? (h.scrollTop / m * 100) : 0) + '%';
  }
  window.addEventListener('scroll', prog, {passive:true}); prog();

  document.querySelectorAll('.stagger').forEach(function(c){
    c.querySelectorAll('.reveal').forEach(function(el,i){ el.style.transitionDelay = (i*85) + 'ms'; });
  });

  function countEl(el){
    if(el.__counted) return; el.__counted = true;
    var t = parseFloat(el.dataset.target), pre = el.dataset.prefix||'', suf = el.dataset.suffix||'', dec = parseInt(el.dataset.dec||'0'), start=null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/1600, 1);
      var v = (p*p*(3-2*p))*t;
      el.textContent = pre + (dec>0 ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suf;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        if(e.target.hasAttribute('data-target')) countEl(e.target);
        if(e.target.querySelectorAll) e.target.querySelectorAll('[data-target]').forEach(function(n){ countEl(n); });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('.reveal, [data-target]').forEach(function(el){ io.observe(el); });
  document.querySelectorAll('.hero .reveal, .phero .reveal').forEach(function(el){ el.classList.add('in'); });

  document.querySelectorAll('[data-timeline]').forEach(function(tl){
    var line = tl.querySelector('.tl-line');
    var dots = tl.querySelectorAll('.tdot');
    function draw(){
      var r = tl.getBoundingClientRect();
      var trigger = window.innerHeight * 0.82;
      var h = Math.max(0, Math.min(r.height, trigger - r.top));
      if(line) line.style.height = h + 'px';
      dots.forEach(function(d){ d.classList.toggle('on', d.getBoundingClientRect().top < trigger); });
    }
    window.addEventListener('scroll', draw, {passive:true}); window.addEventListener('resize', draw); draw();
  });

  document.querySelectorAll('.jtl').forEach(function(tl){
    var line=tl.querySelector('.tl-line');
    function jdraw(){
      var r=tl.getBoundingClientRect();
      var trig=window.innerHeight*0.62;
      var h=Math.max(0,Math.min(r.height, trig - r.top));
      if(line)line.style.height=h+'px';
    }
    window.addEventListener('scroll',jdraw,{passive:true}); window.addEventListener('resize',jdraw); jdraw();
  });

  var slides = document.querySelectorAll('.hero-slide');
  if(slides.length > 1){
    var si = 0;
    setInterval(function(){
      slides[si].classList.remove('active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('active');
    }, 6000);
  }

  document.querySelectorAll('.qa .q').forEach(function(q){
    q.addEventListener('click', function(){
      var item = q.parentElement, a = item.querySelector('.a');
      var open = item.classList.toggle('open');
      a.style.maxHeight = open ? (a.scrollHeight + 'px') : 0;
    });
  });

  document.querySelectorAll('.optrow').forEach(function(row){
    row.addEventListener('click', function(e){
      var o = e.target.closest('.opt'); if(!o) return;
      row.querySelectorAll('.opt').forEach(function(x){ x.classList.remove('sel'); });
      o.classList.add('sel');
      row.dataset.value = o.dataset.value || o.textContent;
    });
  });

  var stepper = document.getElementById('stepper');
  if(stepper){
    var steps = stepper.querySelectorAll('.estep');
    var bar = stepper.querySelector('.progress i');
    var i = 0;
    function show(n){
      steps.forEach(function(s,k){ s.classList.toggle('on', k===n); });
      if(bar) bar.style.width = ((n+1)/steps.length*100) + '%';
    }
    stepper.addEventListener('click', function(e){
      if(e.target.closest('[data-next]')){ if(i < steps.length-1){ i++; show(i);} }
      else if(e.target.closest('[data-prev]')){ if(i>0){ i--; show(i);} }
      else if(e.target.closest('button[type="submit"]')){ e.preventDefault(); stepper.innerHTML='<div class="ok"><b>Thank you.</b> Based on your answers, a personal consultation is the best next step — our team will contact you confidentially.</div>'; }
    });
    show(0);
  }

  document.querySelectorAll('form[data-lead]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var box = f.querySelector('.ok') || document.createElement('div');
      box.className = 'ok';
      box.innerHTML = '<b>Thank you.</b> Based on your details, a consultation is the best next step — we will be in touch confidentially.';
      f.innerHTML = ''; f.appendChild(box);
    });
  });

  var cd = document.querySelector('.countdown[data-deadline]');
  if(cd){
    var cdT = new Date(cd.getAttribute('data-deadline')).getTime();
    var eD=document.getElementById('cdD'),eH=document.getElementById('cdH'),eM=document.getElementById('cdM'),eS=document.getElementById('cdS');
    var cdTimer;
    function cpad(n){return (n<10?'0':'')+n;}
    function ctick(){
      var diff=cdT-Date.now();
      if(diff<=0){
        if(cdTimer) clearInterval(cdTimer);
        cd.classList.add('cd-passed');
        cd.innerHTML='<div class="cd-text"><span class="cd-eye">A note on timing</span><b>The 30 September 2026 filing window has passed. Speak with us for the current EB-5 rules and investment amounts.</b></div><a class="btn btn-gold" href="contact.html">Talk to an advisor <span class="arr">&rarr;</span></a>';
        return;
      }
      if(eD)eD.textContent=Math.floor(diff/86400000);
      if(eH)eH.textContent=cpad(Math.floor(diff/3600000)%24);
      if(eM)eM.textContent=cpad(Math.floor(diff/60000)%60);
      if(eS)eS.textContent=cpad(Math.floor(diff/1000)%60);
    }
    ctick(); cdTimer=setInterval(ctick,1000);
  }

  var y = document.getElementById('yr'); if(y) y.textContent = new Date().getFullYear();
});
