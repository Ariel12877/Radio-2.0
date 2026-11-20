/* Radio Argentina — efectos mágicos WebGL 100 % offline (overlay no interactivo) */
(function () {
  "use strict";
  const canvas = document.getElementById("magicFx");
  const stage = document.getElementById("stage");
  if (!canvas || !stage || typeof window.THREE === "undefined") return;

  try {
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(1536, 1024, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    // Coordenadas de pantalla (Y = 0 arriba, Y = 1024 abajo), sin inversión vertical
    const camera = new THREE.OrthographicCamera(0, 1536, 0, 1024, -100, 100);
    camera.position.z = 10;

    const clock = new THREE.Clock();
    const particleCount = 190;
    const positions = new Float32Array(particleCount * 3);
    const speeds = [], phases = [], anchors = [];

    // 5 zonas exactas en 1536 x 1024: búho, estela, sombrero, varita y poción
    const zones = [
      { name: "buho",     x: 420,  y: 145, r: 115 },
      { name: "estela",   x: 390,  y: 390, r: 95  },
      { name: "sombrero", x: 1165, y: 550, r: 125 },
      { name: "varita",   x: 575,  y: 948, r: 110 },
      { name: "pocion",   x: 1118, y: 810, r: 85  }
    ];

    for (let i = 0; i < particleCount; i++) {
      const z = zones[i % zones.length];
      anchors.push(z);
      positions[i * 3]     = z.x + (Math.random() - 0.5) * z.r * 1.8;
      positions[i * 3 + 1] = z.y + (Math.random() - 0.5) * z.r * 1.8;
      positions[i * 3 + 2] = 0;
      speeds.push(0.25 + Math.random() * 0.75);
      phases.push(Math.random() * Math.PI * 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffd17a,
      size: 7.5,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(geo, material);
    scene.add(particles);

    // Halos y pulsos de luz en las 5 zonas (AdditiveBlending evita manchas oscuras)
    const haloGroup = new THREE.Group();
    scene.add(haloGroup);
    zones.forEach((z, j) => {
      const col = z.name === "pocion" ? 0x4cc9ff : (j % 2 === 0 ? 0xffd985 : 0xffb84d);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(z.r * 0.52, 1.8, 8, 72),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      ring.position.set(z.x, z.y, 0);
      haloGroup.add(ring);
    });

    let frame = 0;
    function animate() {
      if (!document.body.contains(canvas)) return;
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      for (let i = 0; i < particleCount; i++) {
        const a = anchors[i], k = i * 3;
        positions[k]     += Math.sin(t * 0.55 + phases[i]) * 0.16 * speeds[i];
        positions[k + 1] += Math.cos(t * 0.70 + phases[i]) * 0.24 * speeds[i];
        const dx = positions[k] - a.x, dy = positions[k + 1] - a.y;
        if (Math.abs(dx) > a.r || Math.abs(dy) > a.r) {
          positions[k]     = a.x + (Math.random() - 0.5) * a.r;
          positions[k + 1] = a.y + (Math.random() - 0.5) * a.r;
        }
      }
      geo.attributes.position.needsUpdate = true;
      material.opacity = 0.45 + 0.30 * (0.5 + 0.5 * Math.sin(t * 1.7));
      haloGroup.children.forEach((ring, j) => {
        ring.rotation.z = t * (j % 2 ? -0.14 : 0.11);
        ring.scale.setScalar(1 + 0.04 * Math.sin(t * 1.3 + j));
        ring.material.opacity = 0.12 + 0.10 * (0.5 + 0.5 * Math.sin(t * 1.5 + j));
      });
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(frame);
      geo.dispose();
      material.dispose();
      renderer.dispose();
    }, { once: true });
  } catch (e) {
    canvas.style.display = "none";
    console.warn("Efectos WebGL no disponibles; la radio continúa funcionando.", e);
  }
})();
