(function () {
  const grid = document.getElementById("portfolio-grid");
  const status = document.getElementById("portfolio-status");

  function renderCard(project, index) {
    return `
      <article class="project-card-3d reveal reveal-up group perspective" style="transition-delay:${index * 70}ms">
        <div class="project-card-inner relative h-full transition-transform duration-500 transform group-hover:[transform:rotateY(5deg)_rotateX(-3deg)] [perspective:1000px]">
          <div class="relative bg-surface-container rounded-xl overflow-hidden border border-white/5 shadow-2xl h-full group-hover:shadow-2xl group-hover:shadow-primary/30 transition-all duration-500">
            <div class="aspect-[4/5] overflow-hidden relative">
              <img class="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" src="${project.image}" alt="${project.title}">
              <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/35 to-transparent"></div>
            </div>
            <div class="p-6 relative z-10">
              <h3 class="text-2xl font-headline font-bold text-on-surface mb-3 group-hover:text-cyan-300 transition-colors">${project.title}</h3>
              <p class="text-on-surface-variant text-sm leading-relaxed group-hover:text-on-surface transition-colors">${project.description}</p>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderFutureCard() {
    return `
      <article class="project-card-3d reveal reveal-up group perspective">
        <div class="project-card-inner relative h-full transition-transform duration-500 transform group-hover:[transform:rotateY(5deg)_rotateX(-3deg)]">
          <div class="border border-dashed border-outline-variant/40 bg-surface-container-low rounded-xl overflow-hidden h-full flex items-center justify-center min-h-[420px] group-hover:bg-surface-container/50 transition-colors duration-500">
            <div class="text-center p-8">
              <span class="material-symbols-outlined text-6xl text-secondary mb-4">add_circle</span>
              <h3 class="text-2xl font-headline font-bold mb-3">More Coming</h3>
              <p class="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto">Exciting new projects in the pipeline. Stay tuned!</p>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  async function loadProjects() {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("api unavailable");
      }
      const payload = await response.json();
      const projects = Array.isArray(payload.projects) && payload.projects.length ? payload.projects : [];
      if (projects.length === 0) throw new Error("no projects");
      grid.innerHTML = projects.map(renderCard).join("") + renderFutureCard();
      status.textContent = "";
    } catch {
      try {
        const response = await fetch("data/projects.json");
        if (!response.ok) throw new Error("data unavailable");
        const projects = await response.json();
        const safeProjects = Array.isArray(projects) && projects.length ? projects : [];
        if (safeProjects.length === 0) throw new Error("no projects");
        grid.innerHTML = safeProjects.map(renderCard).join("") + renderFutureCard();
        status.textContent = "";
      } catch {
        grid.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-on-surface-variant">No projects available</p></div>';
        status.textContent = "";
      }
    }
  }

  loadProjects();
})();
