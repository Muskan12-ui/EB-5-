window.__ok = true;
document.addEventListener("DOMContentLoaded", function () {
  var topbar = document.getElementById("topbar");
  function onScroll() {
    if (topbar) topbar.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  /* expose the fixed topbar+header height so the hero can reserve exactly that much
     top space (the urgency bar wraps to a different height across breakpoints) */
  function setTopbarH() {
    if (topbar)
      document.documentElement.style.setProperty(
        "--topbar-h",
        topbar.offsetHeight + "px",
      );
  }
  setTopbarH();
  window.addEventListener("resize", setTopbarH);
  window.addEventListener("load", setTopbarH);

  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    function slowHeroVideo() {
      heroVideo.playbackRate = 0.65;
    }
    heroVideo.addEventListener("loadedmetadata", slowHeroVideo);
    heroVideo.addEventListener("play", slowHeroVideo);
    slowHeroVideo();
  }

  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (burger && menu) {
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.textContent = open ? "✕" : "☰";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
        burger.textContent = "☰";
      });
    });
  }

  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".menu a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href === here) a.classList.add("active");
  });

  /* sticky mobile CTA bar (not on the contact page itself) */
  if (here !== "contact.html") {
    var mcta = document.createElement("div");
    mcta.className = "mcta";
    mcta.innerHTML =
      '<a class="btn btn-gold" href="contact.html">Book a Free Consultation <span class="arr">→</span></a>';
    document.body.appendChild(mcta);
  }

  var pbar = document.createElement("div");
  pbar.className = "progressbar";
  document.body.appendChild(pbar);
  function prog() {
    var h = document.documentElement;
    var m = h.scrollHeight - h.clientHeight;
    pbar.style.width = (m > 0 ? (h.scrollTop / m) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", prog, { passive: true });
  prog();

  document.querySelectorAll(".stagger").forEach(function (c) {
    c.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = i * 85 + "ms";
    });
  });

  function countEl(el) {
    if (el.__counted) return;
    el.__counted = true;
    var t = parseFloat(el.dataset.target),
      pre = el.dataset.prefix || "",
      suf = el.dataset.suffix || "",
      dec = parseInt(el.dataset.dec || "0"),
      start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1600, 1);
      var v = p * p * (3 - 2 * p) * t;
      el.textContent =
        pre + (dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          if (e.target.hasAttribute("data-target")) countEl(e.target);
          if (e.target.querySelectorAll)
            e.target.querySelectorAll("[data-target]").forEach(function (n) {
              countEl(n);
            });
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.16 },
  );
  document.querySelectorAll(".reveal, [data-target]").forEach(function (el) {
    io.observe(el);
  });
  document
    .querySelectorAll(".hero .reveal, .phero .reveal")
    .forEach(function (el) {
      el.classList.add("in");
    });

  document.querySelectorAll("[data-timeline]").forEach(function (tl) {
    var line = tl.querySelector(".tl-line");
    var dots = tl.querySelectorAll(".tdot");
    function draw() {
      var r = tl.getBoundingClientRect();
      var trigger = window.innerHeight * 0.82;
      var h = Math.max(0, Math.min(r.height, trigger - r.top));
      if (line) line.style.height = h + "px";
      dots.forEach(function (d) {
        d.classList.toggle("on", d.getBoundingClientRect().top < trigger);
      });
    }
    window.addEventListener("scroll", draw, { passive: true });
    window.addEventListener("resize", draw);
    draw();
  });

  document.querySelectorAll(".jtl").forEach(function (tl) {
    var line = tl.querySelector(".tl-line");
    function jdraw() {
      var r = tl.getBoundingClientRect();
      var trig = window.innerHeight * 0.62;
      var h = Math.max(0, Math.min(r.height, trig - r.top));
      if (line) line.style.height = h + "px";
    }
    window.addEventListener("scroll", jdraw, { passive: true });
    window.addEventListener("resize", jdraw);
    jdraw();
  });

  /* hero video — nudge autoplay (some browsers need an explicit play() after canplay).
     On failure, hide the <video> so its poster / the image slideshow shows through. */
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    var kick = function () {
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () {});
    };
    if (heroVideo.readyState >= 2) kick();
    heroVideo.addEventListener("canplay", kick, { once: true });
    heroVideo.addEventListener("error", function () {
      heroVideo.style.display = "none";
    });
  }

  /* hero slideshow — the fallback beneath the video (visible if the video errors).
     Probe each image so a missing file (e.g. hero-liberty.jpg) is dropped, not shown blank */
  var slides = Array.prototype.slice.call(
    document.querySelectorAll(".hero-slide"),
  );
  if (slides.length) {
    var pendingProbes = slides.length;
    var probeDone = function () {
      if (--pendingProbes > 0) return;
      if (slides.length < 2) {
        if (slides[0]) slides[0].classList.add("active");
        return;
      }
      var si = 0;
      slides.forEach(function (s, k) {
        s.classList.toggle("active", k === 0);
      });
      setInterval(function () {
        slides[si].classList.remove("active");
        si = (si + 1) % slides.length;
        slides[si].classList.add("active");
      }, 9000);
    };
    slides.slice().forEach(function (s) {
      var m = (s.style.backgroundImage || "").match(
        /url\(["']?([^"')]+)["']?\)/,
      );
      if (!m) {
        probeDone();
        return;
      }
      var probe = new Image();
      probe.onload = probeDone;
      probe.onerror = function () {
        s.parentNode.removeChild(s);
        slides.splice(slides.indexOf(s), 1);
        probeDone();
      };
      probe.src = m[1];
    });
  }

  document.querySelectorAll(".qa .q").forEach(function (q) {
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var item = q.parentElement,
        a = item.querySelector(".a");
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
    });
  });

  document.querySelectorAll(".optrow").forEach(function (row) {
    row.addEventListener("click", function (e) {
      var o = e.target.closest(".opt");
      if (!o) return;
      row.querySelectorAll(".opt").forEach(function (x) {
        x.classList.remove("sel");
      });
      o.classList.add("sel");
      row.dataset.value = o.dataset.value || o.textContent;
    });
  });

  var stepper = document.getElementById("stepper");
  if (stepper) {
    var steps = stepper.querySelectorAll(".estep");
    var bar = stepper.querySelector(".progress i");
    var i = 0;
    function show(n) {
      steps.forEach(function (s, k) {
        s.classList.toggle("on", k === n);
      });
      if (bar) bar.style.width = ((n + 1) / steps.length) * 100 + "%";
    }
    stepper.addEventListener("click", function (e) {
      if (e.target.closest("[data-next]")) {
        if (i < steps.length - 1) {
          i++;
          show(i);
        }
      } else if (e.target.closest("[data-prev]")) {
        if (i > 0) {
          i--;
          show(i);
        }
      } else if (e.target.closest('button[type="submit"]')) {
        e.preventDefault();
        /* compose the answers into a pre-filled WhatsApp enquiry so the lead actually reaches the firm */
        var lines = ["Hello The Calculus — my EB-5 eligibility check:"];
        stepper.querySelectorAll(".estep").forEach(function (st) {
          var h = st.querySelector("h3"),
            sel = st.querySelector(".opt.sel");
          if (h && sel) lines.push(h.textContent + " " + sel.textContent);
        });
        stepper.querySelectorAll(".fd").forEach(function (fd) {
          var lab = fd.querySelector("label"),
            c = fd.querySelector("input");
          if (lab && c && c.value) lines.push(lab.textContent + ": " + c.value);
        });
        var wa =
          "https://wa.me/919818781231?text=" +
          encodeURIComponent(lines.join("\n"));
        stepper.innerHTML =
          '<div class="ok"><b>Thank you.</b> Based on your answers, a personal consultation is the best next step — our team will contact you confidentially.<br><a class="btn btn-gold" style="margin-top:16px" href="' +
          wa +
          '" target="_blank" rel="noopener">Get my result faster on WhatsApp <span class="arr">→</span></a></div>';
      }
    });
    show(0);
  }

  document.querySelectorAll("form[data-lead]").forEach(function (f) {
    if (f.closest("#stepper"))
      return; /* the stepper composes its own submission */
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      /* hand the enquiry to WhatsApp pre-filled — the site has no backend, so this is how the lead reaches the firm */
      var lines = [
        "Hello The Calculus — I would like to book a free EB-5 consultation.",
      ];
      f.querySelectorAll(".fd").forEach(function (fd) {
        var lab = fd.querySelector("label"),
          c = fd.querySelector("input,select,textarea");
        if (lab && c && c.value && c.value.indexOf("Select") !== 0)
          lines.push(lab.textContent + ": " + c.value);
      });
      var wa =
        "https://wa.me/919818781231?text=" +
        encodeURIComponent(lines.join("\n"));
      var box = document.createElement("div");
      box.className = "ok";
      box.innerHTML =
        '<b>Thank you.</b> We reply within one business day. For an instant response, send us your enquiry on WhatsApp — your details are already filled in.<br><a class="btn btn-gold" style="margin-top:16px" href="' +
        wa +
        '" target="_blank" rel="noopener">Send on WhatsApp <span class="arr">→</span></a>';
      f.innerHTML = "";
      f.appendChild(box);
    });
  });

  var cd = document.querySelector(".countdown[data-deadline]");
  if (cd) {
    var cdT = new Date(cd.getAttribute("data-deadline")).getTime();
    var eD = document.getElementById("cdD"),
      eH = document.getElementById("cdH"),
      eM = document.getElementById("cdM"),
      eS = document.getElementById("cdS");
    var cdTimer;
    function cpad(n) {
      return (n < 10 ? "0" : "") + n;
    }
    function ctick() {
      var diff = cdT - Date.now();
      if (diff <= 0) {
        if (cdTimer) clearInterval(cdTimer);
        cd.classList.add("cd-passed");
        cd.innerHTML =
          '<div class="cd-text"><span class="cd-eye">A note on timing</span><b>The 30 September 2026 filing window has passed. Speak with us for the current EB-5 rules and investment amounts.</b></div><a class="btn btn-gold" href="contact.html">Talk to an advisor <span class="arr">&rarr;</span></a>';
        return;
      }
      if (eD) eD.textContent = Math.floor(diff / 86400000);
      if (eH) eH.textContent = cpad(Math.floor(diff / 3600000) % 24);
      if (eM) eM.textContent = cpad(Math.floor(diff / 60000) % 60);
      if (eS) eS.textContent = cpad(Math.floor(diff / 1000) % 60);
    }
    ctick();
    cdTimer = setInterval(ctick, 1000);
  }

  var y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();

  /* ===== parallax scroll on hero text ===== */
  var phero = document.querySelector(".phero");
  if (phero) {
    var ph1 = phero.querySelector("h1");
    var pp = phero.querySelector("p");
    var reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reducedMotion) {
      window.addEventListener(
        "scroll",
        function () {
          var s = window.scrollY;
          var limit = phero.offsetHeight;
          if (s < limit) {
            var offset = s * 0.3;
            if (ph1) ph1.style.transform = "translateY(" + offset + "px)";
            if (pp) pp.style.transform = "translateY(" + offset * 0.6 + "px)";
          }
        },
        { passive: true },
      );
    }
  }

  /* ===== typewriter effect (about page) ===== */
  var twEl = document.querySelector(".typewriter");
  if (twEl) {
    var fullText = twEl.textContent;
    twEl.textContent = "";
    twEl.classList.add("typing");
    var twIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            twIO.unobserve(e.target);
            var idx = 0;
            var speed = Math.max(8, Math.min(25, 1500 / fullText.length));
            function typeChar() {
              if (idx < fullText.length) {
                twEl.textContent += fullText.charAt(idx);
                idx++;
                setTimeout(typeChar, speed);
              } else {
                twEl.classList.remove("typing");
                twEl.classList.add("done");
              }
            }
            typeChar();
          }
        });
      },
      { threshold: 0.3 },
    );
    twIO.observe(twEl);
  }

  /* ===== gaincard mouse-move parallax ===== */
  document.querySelectorAll(".gaincard").forEach(function (gc) {
    gc.setAttribute("data-parallax", "");
    var img = gc.querySelector(".gc-img");
    if (!img) return;
    gc.addEventListener("mousemove", function (e) {
      var r = gc.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var yy = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform =
        "scale(1.08) translate(" + x * 10 + "px," + yy * 10 + "px)";
    });
    gc.addEventListener("mouseleave", function () {
      img.style.transform = "";
    });
  });

  /* ===== table row-by-row reveal ===== */
  document.querySelectorAll(".ctable").forEach(function (tbl) {
    tbl.classList.add("reveal-rows");
    var rows = tbl.querySelectorAll("tr");
    var tblIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            tblIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    rows.forEach(function (row, idx) {
      row.style.transitionDelay = idx * 80 + "ms";
      tblIO.observe(row);
    });
  });

  /* ===== journey active step tracking ===== */
  var jsteps = document.querySelectorAll(".jstep");
  if (jsteps.length) {
    function updateActiveStep() {
      var mid = window.innerHeight * 0.5;
      var closest = null,
        closestDist = Infinity;
      jsteps.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closest = s;
        }
      });
      jsteps.forEach(function (s) {
        s.classList.toggle("j-active", s === closest);
      });
    }
    window.addEventListener("scroll", updateActiveStep, { passive: true });
    updateActiveStep();
  }

  var accessModal = document.querySelector("[data-access-modal]");
  if (accessModal) {
    var accessCard = accessModal.querySelector(".access-card");
    var accessKey = "tcJourneyAccessGranted";
    var accessShown = false;
    function openAccessModal() {
      if (accessShown || sessionStorage.getItem(accessKey) === "1") return;
      accessShown = true;
      accessModal.classList.add("is-open");
      accessModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("access-open");
      if (accessCard) accessCard.focus();
    }
    function grantAccess() {
      accessModal.classList.remove("is-open");
      accessModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("access-open");
      sessionStorage.setItem(accessKey, "1");
    }
    accessModal.querySelectorAll("[data-google-access]").forEach(function (el) {
      el.addEventListener("click", function () {
        grantAccess();
      });
    });
    accessModal
      .querySelectorAll("[data-phone-access]")
      .forEach(function (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var phone = form.querySelector('input[type="tel"]');
          if (!phone || !phone.value.trim()) return;
          sessionStorage.setItem("tcJourneyAccessPhone", phone.value.trim());
          grantAccess();
        });
      });
    setTimeout(openAccessModal, 250);
  }

  /* ===== proof strip animated counter ===== */
  document.querySelectorAll(".proof .big").forEach(function (el) {
    if (!el.hasAttribute("data-target")) {
      var text = el.textContent;
      var num = parseFloat(text.replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) {
        el.setAttribute("data-target", num);
        el.setAttribute("data-prefix", text.match(/^[^0-9]*/)[0] || "");
        el.setAttribute("data-suffix", text.match(/[^0-9.]*$/)[0] || "");
        el.setAttribute("data-dec", text.indexOf(".") >= 0 ? "1" : "0");
        var pIO = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) {
                pIO.unobserve(e.target);
                countEl(e.target);
                e.target.classList.add("counted");
              }
            });
          },
          { threshold: 0.3 },
        );
        pIO.observe(el);
      }
    }
  });

  /* ===== heritage counter ===== */
  document.querySelectorAll(".hc-num[data-target]").forEach(function (el) {
    var hcIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            hcIO.unobserve(e.target);
            countEl(e.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    hcIO.observe(el);
  });
});
