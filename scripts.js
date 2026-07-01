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
    if (href === here || (here === 'index.html' && href === 'index.html')) a.classList.add('active');
  });

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        if(e.target.hasAttribute('data-stats')) runCount();
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('.reveal, [data-stats]').forEach(function(el){ io.observe(el); });
  document.querySelectorAll('.hero .reveal, .phero .reveal').forEach(function(el){ el.classList.add('in'); });

  var counted = false;
  function runCount(){
    if(counted) return; counted = true;
    document.querySelectorAll('.num[data-target]').forEach(function(el){
      var t = parseFloat(el.dataset.target), pre = el.dataset.prefix||'', suf = el.dataset.suffix||'', start=null;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts-start)/1500, 1);
        var v = Math.round(p*p*(3-2*p)*t);
        el.textContent = pre + v.toLocaleString() + suf;
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var sky = document.querySelector('.phero .skyline');
  if(sky){ window.addEventListener('scroll', function(){ sky.style.transform = 'translateY(' + (window.scrollY*0.15) + 'px)'; }); }

  var slides = document.querySelectorAll('.hero-slide');
  if(slides.length > 1){
    var si = 0;
    setInterval(function(){
      slides[si].classList.remove('active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('active');
    }, 5000);
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
      if(e.target.matches('[data-next]')){ if(i < steps.length-1){ i++; show(i);} }
      if(e.target.matches('[data-prev]')){ if(i>0){ i--; show(i);} }
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

  var y = document.getElementById('yr'); if(y) y.textContent = new Date().getFullYear();
});
