// Projects synchronization - Loads projects from API and populates detail pages dynamically
(function() {
  // Load from local fallback first (instant, hardcoded projects)
  async function loadProjectsLocal() {
    try {
      const response = await fetch('/assets/data/projects.json');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.warn('Failed to load local projects fallback:', error);
      return [];
    }
  }

  // Load from Render backend (updates fallback data)
  async function loadProjectsFromRender() {
    try {
      const response = await fetch('https://sito-web-backend.onrender.com/api/projects');
      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.warn('Failed to load projects from Render:', error);
      return null; // null = use local fallback
    }
  }

  async function loadProjects() {
    // Load local fallback immediately
    const localProjects = await loadProjectsLocal();
    
    // Try to fetch from Render with 3 second timeout
    const renderPromise = Promise.race([
      loadProjectsFromRender(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]);

    try {
      const renderProjects = await renderPromise;
      if (renderProjects && renderProjects.length > 0) {
        return renderProjects; // Use Render data if available
      }
    } catch (error) {
      console.warn('Render fetch timeout or error, using local fallback');
    }

    return localProjects || []; // Fallback to local
  }

  function findProjectInList(projects, searchTitle) {
    return projects.find(p => p.title.toLowerCase().includes(searchTitle.toLowerCase()));
  }

  function getProjectStatus(projectTitle) {
    return (projectTitle === 'Catch&Dodge' || projectTitle === 'COL Games') ? 'LIVE' : 'In Development';
  }

  function getStatusColor(status) {
    return status === 'LIVE' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  }

  function updateProjectCard(container, project) {
    if (!container || !project) return;
    
    const status = getProjectStatus(project.title);
    const statusColor = getStatusColor(status);
    
    // Update image src
    const img = container.querySelector('img');
    if (img) {
      img.src = project.image;
      img.alt = project.title;
    }
    
    // Update h4 title
    const h4 = container.querySelector('h4');
    if (h4) {
      h4.textContent = project.title;
    }
    
    // Add status badge before h4 if not already present
    if (h4 && !h4.previousElementSibling?.classList.contains('status-badge')) {
      const badge = document.createElement('div');
      badge.className = `status-badge inline-block px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${statusColor}`;
      badge.textContent = status;
      h4.parentElement.insertBefore(badge, h4);
    }
    
    // Update description paragraph
    const p = container.querySelector('p.text-on-surface-variant');
    if (p) {
      p.textContent = project.description;
    }
    
    // Update link
    const link = container.querySelector('a');
    if (link) {
      if (project.title === 'Catch&Dodge') {
        link.href = 'https://ollysss.github.io/first-game/';
        link.target = '_blank';
        link.innerHTML = 'PLAY GAME <span class="material-symbols-outlined ml-2 text-sm">arrow_outward</span>';
      } else if (project.title === 'COL Games') {
        link.href = 'index.html';
        link.target = '';
        link.innerHTML = 'Visit Site <span class="material-symbols-outlined text-sm">arrow_forward</span>';
      } else {
        link.href = `portfolio.html#project-${project.title.toLowerCase().replace(/[&\s]/g, '-')}`;
        link.target = '';
        link.innerHTML = 'View in Portfolio <span class="material-symbols-outlined text-sm">arrow_forward</span>';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const projects = await loadProjects();
    if (!projects.length) return;

    const currentPath = window.location.pathname;
    
    // Website Detail - Update first card with COL Games
    if (currentPath.includes('website-detail')) {
      const colGamesProject = findProjectInList(projects, 'COL Games');
      if (colGamesProject) {
        const detailCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3 > div.group');
        if (detailCards[0]) {
          updateProjectCard(detailCards[0], colGamesProject);
        }
      }
    }

    // Web App Detail - Update first two cards with Catch&Dodge and Vibyxs
    if (currentPath.includes('web-app-detail')) {
      const catchDodgeProject = findProjectInList(projects, 'Catch&Dodge');
      const vibyxsProject = findProjectInList(projects, 'Vibyxs');
      const detailCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3 > div.group');
      
      if (catchDodgeProject && detailCards[0]) {
        updateProjectCard(detailCards[0], catchDodgeProject);
      }
      
      if (vibyxsProject && detailCards[1]) {
        updateProjectCard(detailCards[1], vibyxsProject);
      }
    }

    // AI Automation Detail - Update first two cards with PDFlow and Video Generator Agent
    if (currentPath.includes('ai-automation-detail')) {
      const pdflowProject = findProjectInList(projects, 'PDFlow');
      const videoGenProject = findProjectInList(projects, 'Video Generator Agent');
      const detailCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3 > div.group');
      
      if (pdflowProject && detailCards[0]) {
        updateProjectCard(detailCards[0], pdflowProject);
      }
      
      if (videoGenProject && detailCards[1]) {
        updateProjectCard(detailCards[1], videoGenProject);
      }
    }

    // Portfolio - Populate with all projects
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid) {
      portfolioGrid.innerHTML = projects.map(project => {
        const status = getProjectStatus(project.title);
        const statusColor = getStatusColor(status);
        const projectLink = project.title === 'Catch&Dodge' 
          ? 'https://ollysss.github.io/first-game/' 
          : `#project-${project.title.toLowerCase().replace(/[&\s]/g, '-')}`;
        const isExternal = project.title === 'Catch&Dodge';
        const targetAttr = isExternal ? 'target="_blank"' : '';
        
        return `
        <a href="${projectLink}" ${targetAttr} id="project-${project.title.toLowerCase().replace(/[&\s]/g, '-')}">
          <div class="group relative card-3d preserve-3d transition-transform duration-500 ease-out">
            <div class="bg-surface-container rounded-xl overflow-hidden shadow-2xl p-px group-hover:bg-gradient-to-br group-hover:from-secondary/30 group-hover:to-transparent">
              <div class="bg-surface-container rounded-[inherit] overflow-hidden">
                <div class="relative h-64 overflow-hidden">
                  <img alt="${project.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${project.image}"/>
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent opacity-60"></div>
                </div>
                <div class="p-8">
                  <div class="inline-block px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${statusColor}">
                    ${status}
                  </div>
                  <h3 class="text-2xl font-headline font-bold text-on-surface mb-3 tracking-tight">${project.title}</h3>
                  <p class="text-on-surface-variant text-sm leading-relaxed mb-6">${project.description}</p>
                  ${isExternal ? '<div class="flex items-center text-primary font-bold text-sm gap-2 cursor-pointer hover:translate-x-1 transition-transform">PLAY GAME <span class="material-symbols-outlined text-sm">arrow_outward</span></div>' : ''}
                </div>
              </div>
            </div>
          </div>
        </a>
      `
      }).join('');
    }
  });
})();
