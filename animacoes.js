// animações extras (Anime.js): marcador quadrado, reloginho, auroras,
// linhas de tempo desenhadas, grade de pontos, entrada dos projetos,
// barras de habilidade, listas com stagger, menu e divisória
(() => {
  "use strict";

  const reduceMotion = !!window.__reduceMotion;
  const hasAnime = typeof window.anime !== "undefined";

  if (!hasAnime || reduceMotion){
    document.body.classList.add("js-scope-failed");
    document.querySelectorAll(".skill-fill").forEach(el => {
      el.style.width = el.dataset.level + "%";
    });
    return;
  }

  const { animate, stagger, createTimeline, createScope, onScroll, utils } = anime;

  function safe(label, fn){
    try { fn(); }
    catch (err) {
      console.error("[animação: " + label + "]", err);
      if (label === "auroras") document.body.classList.add("js-scope-failed");
    }
  }

  // marcador quadrado: um "tique" toda vez que a seção entra na tela
  safe("square", () => {
    document.querySelectorAll(".square").forEach(el => {
      const block = el.closest(".block");
      if (!block) return;
      animate(el, {
        rotate: "+=90",
        duration: 500,
        ease: "inOutExpo",
        autoplay: onScroll({ target: block }),
      });
    });
  });

  // reloginho de disponibilidade
  safe("ticker", () => {
    createTimeline({ loop: true, defaults: { ease: "outExpo" } })
      .add(".tick", { y: "-=2", duration: 50 }, stagger(10))
      .add(".ticker", { rotate: 360, duration: 1920 }, "<");
  });

  // auroras responsivas (createScope + mediaQueries)
  safe("auroras", () => {
    createScope({
      mediaQueries: { portrait: "(orientation: portrait)" },
    }).add((scope) => {
      const isPortrait = scope.matches.portrait;
      createTimeline({ loop: true, alternate: true, defaults: { ease: "inOutSine" } })
        .add(".aurora-a", {
          y: isPortrait ? 0 : [-40, 40],
          x: isPortrait ? [-30, 30] : 0,
          duration: 9000,
        }, 0)
        .add(".aurora-b", {
          y: isPortrait ? 0 : [30, -30],
          x: isPortrait ? [25, -25] : 0,
          duration: 11000,
        }, 0);
    });
  });

  // linhas de tempo desenhadas na Formação e nas Conquistas
  safe("timeline-lines", () => {
    const timelines = document.querySelectorAll(".timeline");
    if (!timelines.length) return;
    timelines.forEach(tl => {
      const line = tl.querySelector(".timeline-line line");
      if (!line) return;
      line.style.strokeDasharray = "100";
      line.style.strokeDashoffset = "100";
      animate(line, {
        strokeDashoffset: [100, 0],
        ease: "linear",
        autoplay: onScroll({ target: tl, sync: true }),
      });
    });
    document.body.classList.add("has-timeline-js");
  });

  // grade de pontos pulsando do centro, atrás do "Vamos conversar?"
  safe("cta-dots", () => {
    const wrap = document.getElementById("ctaDots");
    if (!wrap) return;
    for (let i = 0; i < 169; i++) wrap.appendChild(document.createElement("span"));
    const options = { grid: [13, 13], from: "center" };
    animate("#ctaDots span", {
      scale: stagger([1.1, 0.75], options),
      delay: stagger(60, options),
      ease: "inOutQuad",
      autoplay: onScroll({ target: wrap.closest(".contact-cta"), repeat: false }),
    });
  });

  // entrada dos projetos: a grade cresce e os cartões deslizam dentro dela
  safe("project-entrance", () => {
    const grid = document.querySelector(".project-grid");
    if (!grid) return;
    animate(grid, {
      scale: [0.96, 1],
      duration: 700,
      ease: "outExpo",
      autoplay: onScroll({ target: grid, repeat: false }),
    });
    animate(grid.querySelectorAll(".project-card"), {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(90),
      duration: 600,
      ease: "outExpo",
      autoplay: onScroll({ target: grid, repeat: false }),
    });
  });

  // barras de habilidade: largura pelo data-level, com sobrepasso elástico
  safe("skill-bars", () => {
    const bars = document.querySelectorAll(".skill-fill");
    const list = document.querySelector(".skill-list");
    if (!bars.length || !list) return;
    animate(bars, {
      width: (el) => el.dataset.level + "%",
      duration: () => utils.random(900, 1300),
      delay: () => utils.random(0, 300),
      ease: "outElastic(1, .5)",
      autoplay: onScroll({ target: list, repeat: false }),
    });
  });

  // habilidades interpessoais: entram em fila, com uma leve rotação aleatória
  safe("interpessoais-entrance", () => {
    const section = document.querySelector('[aria-labelledby="interpessoais-titulo"]');
    const items = section && section.querySelectorAll(".tag-list li");
    if (!items || !items.length) return;
    animate(items, {
      opacity: [0, 1],
      translateX: [-10, 0],
      rotate: [() => utils.random(-8, 8), 0],
      delay: stagger(80, { start: 150 }),
      duration: 550,
      ease: "outExpo",
      autoplay: onScroll({ target: section, repeat: false }),
    });
  });

  // idiomas: mesma fila, sem a rotação
  safe("idiomas-entrance", () => {
    const section = document.querySelector('[aria-labelledby="idiomas-titulo"]');
    const items = section && section.querySelectorAll(".tag-list li");
    if (!items || !items.length) return;
    animate(items, {
      opacity: [0, 1],
      translateX: [-10, 0],
      delay: stagger(80, { start: 150 }),
      duration: 500,
      ease: "outExpo",
      autoplay: onScroll({ target: section, repeat: false }),
    });
  });

  // lista de contato: fila com um pequeno atraso inicial
  safe("contact-entrance", () => {
    const list = document.querySelector(".contact-list");
    if (!list) return;
    animate(list.querySelectorAll("li"), {
      opacity: [0, 1],
      translateX: [-10, 0],
      delay: stagger(70, { start: 200 }),
      duration: 500,
      ease: "outExpo",
      autoplay: onScroll({ target: list, repeat: false }),
    });
  });

  // menu superior: entra ao carregar a página, da direita para a esquerda
  safe("nav-entrance", () => {
    const links = document.querySelectorAll(".nav-links a, .nav-cta");
    if (!links.length) return;
    animate(links, {
      opacity: [0, 1],
      translateY: [-6, 0],
      delay: stagger(80, { reversed: true }),
      duration: 500,
      ease: "outExpo",
    });
  });

  // divisória de quadrados: brilho pulsando do centro, em loop
  safe("divider-glow", () => {
    const squares = document.querySelectorAll(".divider-square");
    const row = document.querySelector(".divider-row");
    if (!squares.length || !row) return;
    animate(squares, {
      boxShadow: [
        { to: stagger([1, 0.25], {
            modifier: (v) => `0 0 ${v * 24}px ${v * 14}px currentColor`,
            from: "center",
          })
        },
        { to: 0 },
      ],
      delay: stagger(100, { from: "center" }),
      loop: true,
      autoplay: onScroll({ target: row, repeat: false }),
    });
  });
})();
