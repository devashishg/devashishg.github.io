(() => {
  const canvas = document.getElementById("universe");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const rings = [100, 150, 210, 280, 360, 450, 550, 660, 780];
  let stars = [];
  let planets = [];
  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  const ringSquash = 0.72;
  const rotationAngle = (-20 * Math.PI) / 180;
  let lastTime = 0;
  let rafId = null;

  const defaultData = {
    projects: [
      {
        tag: "Distributed Systems",
        title: "Event Mesh Gateway",
        summary: "Low-latency gateway routing multi-tenant event streams with schema enforcement, dead-lettering, and first-class observability.",
        stack: "Go · NATS · Envoy · OpenTelemetry · Kubernetes",
      },
      {
        tag: "Data Infra",
        title: "Real-time Metrics Lake",
        summary: "Streaming ingestion service fanning out into OLAP and hot caches with retention-aware compaction and predictable p99s.",
        stack: "Java · Kafka · Flink · ClickHouse · Redis",
      },
      {
        tag: "Platform Reliability",
        title: "Resilience Control Plane",
        summary: "Progressive delivery controller managing canaries, circuit breakers, and feature gates with blast-radius aware rollbacks.",
        stack: "TypeScript · Kubernetes · Argo Rollouts · Postgres · gRPC",
      },
      {
        tag: "Developer Experience",
        title: "Service Template Kit",
        summary: "Opinionated starter for backend services with auth, tracing, CI pipelines, and golden-path docs for faster delivery.",
        stack: "Node.js · TypeScript · Docker · GitHub Actions · Terraform",
      },
    ],
    skills: [
      { group: "Languages & Frameworks", items: ["Go", "Java", "TypeScript", "React", "Node.js"] },
      { group: "Distributed Systems", items: ["Kafka", "NATS", "gRPC", "REST", "Event Sourcing"] },
      { group: "Data & Storage", items: ["Postgres", "ClickHouse", "Redis", "S3", "Elasticsearch"] },
      { group: "Reliability & Infra", items: ["Kubernetes", "Helm", "Terraform", "Prometheus", "Grafana"] },
    ],
    experience: [
      {
        role: "Senior Software Engineer · Platform",
        org: "Scaling ingestion, observability, and developer velocity for multi-region services.",
        meta: "Kubernetes · Go · Kafka · OpenTelemetry",
      },
      {
        role: "Backend Engineer",
        org: "Built API gateways, data pipelines, and SLO-driven dashboards for customer-facing products.",
        meta: "Java · Spring · Postgres · Redis · ArgoCD",
      },
      {
        role: "Full-stack Engineer",
        org: "Delivered product experiences with React + TypeScript atop service-oriented backends.",
        meta: "React · TypeScript · Node.js · CI/CD",
      },
    ],
    contact: [
      { label: "Email", href: "mailto:devashishgupta60@gmail.com", variant: "primary" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/devashishg/", variant: "ghost" },
      { label: "Resume", href: "media/devashish_gupta.pdf", variant: "ghost" },
      { label: "GitHub", href: "https://github.com/devashishg", variant: "ghost" },
    ],
  };

  const dataSources = {
    projects: "data/projects.json",
    skills: "data/skills.json",
    experience: "data/experience.json",
    contact: "data/contact.json",
  };
  const stackSource = "https://api.stackexchange.com/2.3/users/8504438?site=stackoverflow";
  const githubSource = "https://api.github.com/users/devashishg";

  const pointer = { x: 0, y: 0, active: false };
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionAllowed = !motionQuery.matches;

  async function fetchJSON(path, fallback) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("Bad status");
      return await res.json();
    } catch (err) {
      console.warn(`Falling back to inline data for ${path}`, err);
      return fallback;
    }
  }

  function renderProjects(projects) {
    const container = document.getElementById("projects-grid");
    if (!container) return;
    container.innerHTML = "";
    projects.forEach((proj) => {
      const article = document.createElement("article");
      article.className = "project-card";
      article.innerHTML = `
        <div>
          <p class="project-tag">${proj.tag || ""}</p>
          <h3>${proj.title || ""}</h3>
          <p class="project-summary">${proj.summary || ""}</p>
          <p class="project-stack">${proj.stack || ""}</p>
        </div>
        <div class="constellation" aria-hidden="true"></div>
      `;
      container.appendChild(article);
    });
  }

  function renderSkills(skills) {
    const container = document.getElementById("skills-grid");
    if (!container) return;
    container.innerHTML = "";
    skills.forEach((group) => {
      const wrapper = document.createElement("div");
      wrapper.className = "skill-group";
      wrapper.innerHTML = `
        <h3>${group.group || ""}</h3>
        <div class="skill-list">
          ${(group.items || [])
            .map((item) => `<span>${item}</span>`)
            .join("")}
        </div>
      `;
      container.appendChild(wrapper);
    });
  }

  function renderExperience(experience) {
    const container = document.getElementById("experience-list");
    if (!container) return;
    container.innerHTML = "";
    experience.forEach((exp) => {
      const article = document.createElement("article");
      article.className = "experience";
      article.innerHTML = `
        <div>
          <p class="exp-role">${exp.role || ""}</p>
          <p class="exp-org">${exp.org || ""}</p>
        </div>
        <p class="exp-meta">${exp.meta || ""}</p>
      `;
      container.appendChild(article);
    });
  }

  function renderContact(contact) {
    const container = document.getElementById("contact-actions");
    if (!container) return;
    container.innerHTML = "";
    contact.forEach((action) => {
      const anchor = document.createElement("a");
      anchor.className = `btn ${action.variant === "primary" ? "primary" : "ghost"}`;
      anchor.href = action.href;
      anchor.textContent = action.label;
      anchor.rel = "noreferrer";
      if (action.href.startsWith("http")) {
        anchor.target = "_blank";
      }
      container.appendChild(anchor);
    });
  }

  async function loadContent() {
    const [projects, skills, experience, contact] = await Promise.all([
      fetchJSON(dataSources.projects, defaultData.projects),
      fetchJSON(dataSources.skills, defaultData.skills),
      fetchJSON(dataSources.experience, defaultData.experience),
      fetchJSON(dataSources.contact, defaultData.contact),
    ]);

    renderProjects(projects);
    renderSkills(skills);
    renderExperience(experience);
    renderContact(contact);
    setupConstellations();
    loadStackOverflow();
    loadGithub();
  }

  function resizeCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    centerX = width / 2;
    centerY = height / 2;
    initStars();
    initPlanets();
    drawFrame(0, true);
  }

  async function loadStackOverflow() {
    const repEl = document.querySelector('[data-stack="rep"]');
    const goldEl = document.querySelector('[data-stack="gold"]');
    const silverEl = document.querySelector('[data-stack="silver"]');
    const bronzeEl = document.querySelector('[data-stack="bronze"]');
    if (!repEl || !goldEl || !silverEl || !bronzeEl) return;
    try {
      const res = await fetch(stackSource, { cache: "no-store" });
      const payload = await res.json();
      const user = payload.items && payload.items[0];
      if (!user) return;
      repEl.textContent = user.reputation?.toLocaleString?.() || user.reputation || "—";
      goldEl.textContent = user.badge_counts?.gold ?? "0";
      silverEl.textContent = user.badge_counts?.silver ?? "0";
      bronzeEl.textContent = user.badge_counts?.bronze ?? "0";
    } catch (err) {
      console.warn("StackOverflow fetch failed", err);
    }
  }

  async function loadGithub() {
    const repoEl = document.querySelector('[data-github="repos"]');
    if (!repoEl) return;
    try {
      const res = await fetch(githubSource, { cache: "no-store" });
      const user = await res.json();
      if (!user) return;
      repoEl.textContent = user.public_repos ?? "0";
    } catch (err) {
      console.warn("GitHub fetch failed", err);
    }
  }

  function initStars() {
    const count = Math.min(240, Math.floor((width * height) / 6000));
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      depth: 0.35 + Math.random() * 0.65,
      baseAlpha: 0.04 + Math.random() * 0.12,
      size: Math.random() > 0.7 ? 1.5 : 1,
    }));
  }

  function initPlanets() {
    planets = rings.map((radius, index) => ({
      radius,
      angle: Math.random() * Math.PI * 2,
      speed: 0.00006 * (index + 1),
    }));
  }

  function drawStars() {
    const parallaxEnabled = motionAllowed && pointer.active;
    const parallaxScale = parallaxEnabled ? 0.04 : 0;
    const hoverRadius = 90;
    ctx.fillStyle = "#c4d8ff";

    stars.forEach((star) => {
      const offsetX = parallaxScale * (pointer.x - width / 2) * star.depth;
      const offsetY = parallaxScale * (pointer.y - height / 2) * star.depth;
      const x = star.x + offsetX;
      const y = star.y + offsetY;
      let alpha = star.baseAlpha;

      if (parallaxEnabled) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hoverRadius) {
          alpha += (hoverRadius - dist) / hoverRadius * 0.08;
        }
      }

      ctx.globalAlpha = Math.min(alpha, 0.25);
      ctx.fillRect(x, y, star.size, star.size);
    });

    ctx.globalAlpha = 1;
  }

  function drawRings() {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);
    ctx.translate(-centerX, -centerY);
    ctx.lineWidth = 1;
    rings.forEach((radius) => {
      // back half
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * ringSquash, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      // front half
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * ringSquash, 0, 0, Math.PI);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSun() {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);
    ctx.scale(1, ringSquash);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
    gradient.addColorStop(0, "rgba(255, 204, 102, 0.42)");
    gradient.addColorStop(0.32, "rgba(255, 175, 89, 0.24)");
    gradient.addColorStop(1, "rgba(255, 160, 82, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlanets(delta, staticFrame) {
    planets.forEach((planet, index) => {
      if (motionAllowed && !staticFrame) {
        planet.angle += planet.speed * delta;
        if (planet.angle > Math.PI * 2) planet.angle -= Math.PI * 2;
      }

      const cos = Math.cos(planet.angle);
      const sin = Math.sin(planet.angle);
      const rx = planet.radius * cos;
      const ry = planet.radius * sin * ringSquash;
      const tiltX = rx * Math.cos(rotationAngle) - ry * Math.sin(rotationAngle);
      const tiltY = rx * Math.sin(rotationAngle) + ry * Math.cos(rotationAngle);
      const x = centerX + tiltX;
      const y = centerY + tiltY;
      const depth = Math.sin(planet.angle); // front/back defined by vertical arc, not left/right
      const alpha = depth > 0 ? 0.65 + 0.22 * depth : 0.1;

      ctx.beginPath();
      ctx.fillStyle = `rgba(103, 224, 255, ${alpha})`;
      ctx.arc(x, y, 3 + index * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawFrame(delta, staticFrame = false) {
    ctx.clearRect(0, 0, width, height);
    drawSun();
    drawStars();
    drawRings();
    drawPlanets(delta, staticFrame);
  }

  function animate(timestamp) {
    if (!motionAllowed) {
      rafId = null;
      return;
    }
    const delta = lastTime ? timestamp - lastTime : 16;
    lastTime = timestamp;
    drawFrame(delta);
    rafId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (rafId !== null || !motionAllowed) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function handlePointerMove(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function handlePointerLeave() {
    pointer.active = false;
  }

  function setupConstellations() {
    const cards = document.querySelectorAll(".project-card");
    cards.forEach((card) => {
      const layer = card.querySelector(".constellation");
      if (!layer) return;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      layer.appendChild(svg);
      let fadeTimeout;

      function drawConstellation() {
        const rect = card.getBoundingClientRect();
        svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
        svg.innerHTML = "";

        const nodeCount = 6 + Math.floor(Math.random() * 3);
        const padding = 18;
        const nodes = Array.from({ length: nodeCount }, () => ({
          x: padding + Math.random() * (rect.width - padding * 2),
          y: padding + Math.random() * (rect.height - padding * 2),
        }));

        const connections = [];
        for (let i = 0; i < nodeCount - 1; i++) {
          connections.push([i, i + 1]);
        }
        nodes.forEach((_, idx) => {
          const target = (idx + 2 + Math.floor(Math.random() * 3)) % nodeCount;
          connections.push([idx, target]);
        });

        connections.slice(0, nodeCount + 2).forEach(([a, b]) => {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", nodes[a].x);
          line.setAttribute("y1", nodes[a].y);
          line.setAttribute("x2", nodes[b].x);
          line.setAttribute("y2", nodes[b].y);
          line.setAttribute("stroke", "rgba(103,224,255,0.28)");
          line.setAttribute("stroke-width", "0.8");
          line.setAttribute("stroke-linecap", "round");
          line.style.transition = "opacity 600ms ease";
          line.style.opacity = "1";
          svg.appendChild(line);
        });

        nodes.forEach((node) => {
          const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          point.setAttribute("cx", node.x);
          point.setAttribute("cy", node.y);
          point.setAttribute("r", 2);
          point.setAttribute("fill", "rgba(103,224,255,0.55)");
          point.style.transition = "opacity 600ms ease";
          point.style.opacity = "1";
          svg.appendChild(point);
        });
      }

      function handleEnter() {
        clearTimeout(fadeTimeout);
        layer.style.opacity = "1";
        drawConstellation();
      }

      function handleLeave() {
        layer.style.opacity = "0";
        fadeTimeout = setTimeout(() => {
          svg.innerHTML = "";
        }, 320);
      }

      card.addEventListener("mouseenter", handleEnter);
      card.addEventListener("mouseleave", handleLeave);
      window.addEventListener("resize", () => {
        if (layer.style.opacity === "1") {
          drawConstellation();
        }
      });
    });
  }

  motionQuery.addEventListener("change", (event) => {
    motionAllowed = !event.matches;
    if (motionAllowed) {
      startAnimation();
    } else {
      stopAnimation();
      drawFrame(0, true);
    }
  });

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", handlePointerLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else if (motionAllowed) {
      startAnimation();
    }
  });

  resizeCanvas();
  loadContent();
  if (motionAllowed) {
    startAnimation();
  } else {
    drawFrame(0, true);
  }
})();
