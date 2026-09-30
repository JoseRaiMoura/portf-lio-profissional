// grade de cubos 3D (Three.js); se falhar, as partículas 2D continuam
(async () => {
  "use strict";

  const stage = document.getElementById("cubeStage");
  const particles = document.getElementById("particles");
  const reduceMotion = !!window.__reduceMotion;

  if (!stage || reduceMotion) return;

  if (window.innerWidth < 760) return;

  function supportsWebGL(){
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch (err){
      return false;
    }
  }

  if (!supportsWebGL()) return;

  try {
    const [{ animate, createTimer, stagger, utils }, THREE] = await Promise.all([
      import("https://cdn.jsdelivr.net/npm/animejs/+esm"),
      import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"),
    ]);

    await import("https://cdn.jsdelivr.net/npm/animejs/adapters/three/+esm");

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;

    const color = utils.get(stage, "color") || "#A78BFA";

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5;
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0xffffff, 6, 20, 0.4);
    scene.add(pointLight);

    const gridSize = 3;
    const cellSize = 1.6 / gridSize;
    const spread = ((gridSize - 1) / 2) * cellSize;
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.InstancedMesh(geometry, material, gridSize ** 3);
    scene.add(mesh);

    const { getInstances } = await import("https://cdn.jsdelivr.net/npm/animejs/adapters/three/+esm");
    const instances = getInstances(mesh);

    utils.set(instances, {
      x: stagger([-spread, spread], { grid: [gridSize, gridSize, gridSize], axis: "x" }),
      y: stagger([-spread, spread], { grid: [gridSize, gridSize, gridSize], axis: "y" }),
      z: stagger([-spread, spread], { grid: [gridSize, gridSize, gridSize], axis: "z" }),
    });

    animate(mesh, {
      rotateY: { to: 360, duration: 14000 },
      rotateX: { to: 360, duration: 18000 },
      loop: true,
      ease: "inOutQuad",
    });

    animate(pointLight, {
      intensity: [18, 0],
      duration: 2600,
      loop: true,
      loopDelay: 600,
      alternate: true,
      ease: "out(3)",
    });

    animate(instances, {
      x: (instance) => instance.x * 1.6,
      y: (instance) => instance.y * 1.6,
      z: (instance) => instance.z * 1.6,
      duration: 2400,
      delay: stagger([0, 400], { grid: true, from: "center", reversed: true, ease: "in(3)" }),
      loop: true,
      loopDelay: 700,
      alternate: true,
      ease: "inOutExpo",
    });

    let rafId;
    const timer = createTimer({
      onUpdate: () => { renderer.render(scene, camera); },
    });

    stage.classList.add("is-ready");
    if (particles) particles.style.opacity = "0";

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }, 200);
    });

  } catch (err){
    console.error("[cubo 3D] não foi possível iniciar, mantendo o fundo padrão:", err);
    stage.remove();
  }
})();
