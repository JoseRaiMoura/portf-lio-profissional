(() => {
  "use strict";

  // configuração inicial
  const reduceMotion = !!window.__reduceMotion;

  if (window.__systemReduced && window.__reduceMotion){
    const banner = document.createElement("div");
    banner.className = "motion-banner";
    banner.innerHTML = "Seu sistema está com <strong>movimento reduzido</strong>, por isso as animações estão desligadas.";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Ativar animações";
    btn.addEventListener("click", () => {
      try { localStorage.setItem("forceMotion", "1"); } catch (e) {}
      location.reload();
    });
    banner.appendChild(btn);
    document.body.appendChild(banner);
  }
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  // barra de progresso de leitura
  const progressBar = document.getElementById("progressBar");

  function updateProgress(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // navegação: sombra ao rolar + scrollspy
  const topnav = document.getElementById("topnav");
  const navPill = document.getElementById("navPill");
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function moveNavPill(){
    const activeLink = navLinks.find(link => link.classList.contains("is-active"));
    if (!navPill || !activeLink) {
      if (navPill) navPill.style.opacity = "0";
      return;
    }
    const parentRect = activeLink.closest(".nav-links").getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    navPill.style.opacity = "1";
    navPill.style.width = linkRect.width + 16 + "px";
    navPill.style.transform = `translateX(${linkRect.left - parentRect.left - 8}px)`;
  }

  function onScrollNav(){
    topnav.classList.toggle("is-scrolled", window.scrollY > 30);

    let currentId = "";
    const probe = window.scrollY + window.innerHeight * 0.3;
    sections.forEach(sec => {
      if (sec.offsetTop <= probe) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
    });
    moveNavPill();
  }

  window.addEventListener("scroll", onScrollNav, { passive: true });
  window.addEventListener("resize", moveNavPill);
  onScrollNav();

  // revelar ao rolar (em cascata) + barras de habilidade
  document.querySelectorAll(".block").forEach(block => {
    const items = block.querySelectorAll(":scope > [data-reveal], :scope .entry[data-reveal], :scope .project-card[data-reveal]");
    items.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 70, 350) + "ms";
    });
  });

  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  revealEls.forEach(el => revealObserver.observe(el));

  // efeito de "digitando" no cargo
  const roleTextEl = document.getElementById("roleText");
  const roles = [
    "Desenvolvedor Front-end",
    "Entusiasta de Cibersegurança",
    "Estudante de ADS"
  ];

  function typeLoop(){
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick(){
      const current = roles[roleIndex];
      if (!deleting){
        charIndex++;
        roleTextEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length){
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        roleTextEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0){
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  if (roleTextEl){
    if (reduceMotion){
      roleTextEl.textContent = roles[0];
    } else {
      typeLoop();
    }
  }

  // botões magnéticos
  if (!isTouch && !reduceMotion){
    document.querySelectorAll("[data-magnetic]").forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.3}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.35s var(--ease, ease)";
        el.style.transform = "translate(0, 0)";
        setTimeout(() => { el.style.transition = ""; }, 350);
      });
    });
  }

  // inclinação (tilt) e brilho nos cards de projeto
  if (!isTouch && !reduceMotion){
    document.querySelectorAll("[data-tilt]").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -8;
        const rotateY = ((x / rect.width) - 0.5) * 8;
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
      });
    });
  }

  // rede de partículas na barra lateral
  const canvas = document.getElementById("particles");
  if (canvas && !reduceMotion){
    const ctx = canvas.getContext("2d");
    const sidebar = canvas.parentElement;
    let particles = [];
    let width, height;
    let rafId;

    function resize(){
      width = canvas.width = sidebar.offsetWidth;
      height = canvas.height = sidebar.offsetHeight;
    }

    function makeParticles(){
      const count = Math.round((width * height) / 26000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6
      }));
    }

    function step(){
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196, 181, 253, 0.6)";
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++){
        for (let j = i + 1; j < particles.length; j++){
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120){
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.22 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(step);
    }

    resize();
    makeParticles();
    step();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        resize();
        makeParticles();
        step();
      }, 200);
    });
  }

  // parallax suave da foto de perfil
  if (!isTouch && !reduceMotion){
    const sidebarEl = document.querySelector(".sidebar");
    const photoEl = document.querySelector(".photo");

    if (sidebarEl && photoEl){
      sidebarEl.addEventListener("mousemove", (e) => {
        const rect = sidebarEl.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        photoEl.style.transform = `translate(${relX * 10}px, ${relY * 10}px)`;
      });
      sidebarEl.addEventListener("mouseleave", () => {
        photoEl.style.transform = "translate(0, 0)";
      });
    }
  }

  // botão copiar e-mail
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(value);
      } catch (err) {
      }
      const original = btn.textContent;
      btn.textContent = "Copiado!";
      btn.classList.add("is-copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("is-copied");
      }, 1800);
    });
  });

  // efeito de onda (ripple) nos botões de destaque
  if (!reduceMotion){
    document.querySelectorAll(".big-cta, .nav-cta").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);

        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
        ripple.style.top = (e.clientY - rect.top - size / 2) + "px";

        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // botão "voltar ao topo"
  const toTop = document.getElementById("toTop");
  if (toTop){
    function toggleToTop(){
      toTop.classList.toggle("is-visible", window.scrollY > 480);
    }
    window.addEventListener("scroll", toggleToTop, { passive: true });
    toggleToTop();

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
