(function () {
  const loginPanel = document.getElementById("login-panel");
  const dashboardShell = document.getElementById("dashboard-shell");
  const loginForm = document.getElementById("login-form");
  const loginPassword = document.getElementById("login-password");
  const loginMessage = document.getElementById("login-message");
  const projectsList = document.getElementById("admin-project-list");
  const projectsCount = document.getElementById("projects-count");
  const currentIp = document.getElementById("current-ip");
  const settingsForm = document.getElementById("settings-form");
  const allowedIps = document.getElementById("allowed-ips");
  const newPassword = document.getElementById("new-password");
  const settingsMessage = document.getElementById("settings-message");
  const projectModal = document.getElementById("project-modal");
  const openProjectModal = document.getElementById("open-project-modal");
  const closeProjectModal = document.getElementById("close-project-modal");
  const cancelProject = document.getElementById("cancel-project");
  const projectForm = document.getElementById("project-form");
  const projectTitle = document.getElementById("project-title");
  const projectDescription = document.getElementById("project-description");
  const projectImage = document.getElementById("project-image");
  const projectMessage = document.getElementById("project-message");

  let sessionState = null;
  let editingProjectId = null;

  function openModal() {
    document.querySelector('#project-modal h2').textContent = "Add Project";
    editingProjectId = null;
    projectModal.classList.remove("hidden");
    projectModal.classList.add("flex");
  }

  function closeModal() {
    projectModal.classList.add("hidden");
    projectModal.classList.remove("flex");
    projectForm.reset();
    projectMessage.textContent = "";
    editingProjectId = null;
  }

  async function fetchSession() {
    const response = await fetch("/api/admin/session");
    return response.json();
  }

  function setVisible(authed) {
    loginPanel.classList.toggle("hidden", authed);
    dashboardShell.classList.toggle("hidden", !authed);
  }

  function renderProjects(projects) {
    projectsCount.textContent = `${projects.length} project cards`;
    projectsList.innerHTML = projects.map((project) => `
      <article class="bg-surface-container rounded-xl overflow-hidden border border-white/5">
        <div class="aspect-[4/3] overflow-hidden">
          <img class="w-full h-full object-cover" src="${project.image}" alt="${project.title}">
        </div>
        <div class="p-5 space-y-3">
          <h3 class="text-xl font-headline font-bold">${project.title}</h3>
          <p class="text-sm text-on-surface-variant leading-relaxed">${project.description}</p>
          <div class="flex justify-end gap-2">
            <button class="text-xs text-cyan-300 hover:text-cyan-200" data-edit-project="${project.id}">Edit</button>
            <button class="text-xs text-rose-300 hover:text-rose-200" data-delete-project="${project.id}">Delete</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  async function refreshDashboard() {
    const session = await fetchSession();
    sessionState = session;
    if (!session.authenticated) {
      setVisible(false);
      currentIp.textContent = `Current IP: ${session.clientIp}${session.allowed ? "" : " (not allowed)"}`;
      return;
    }

    setVisible(true);
    currentIp.textContent = `Current IP: ${session.clientIp}`;
    allowedIps.value = (session.config?.allowedIps || []).join("\n");

    const projectsResponse = await fetch("/api/admin/projects");
    const projectsPayload = await projectsResponse.json();
    renderProjects(projectsPayload.projects || []);
  }

  async function login(password) {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Login failed");
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.textContent = "";
    try {
      await login(loginPassword.value);
      await refreshDashboard();
    } catch (error) {
      loginMessage.textContent = error.message;
    }
  });

  openProjectModal.addEventListener("click", openModal);
  closeProjectModal.addEventListener("click", closeModal);
  cancelProject.addEventListener("click", closeModal);
  projectModal.addEventListener("click", (event) => {
    if (event.target === projectModal) closeModal();
  });

  projectsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    
    const projectId = target.getAttribute("data-delete-project");
    if (projectId) {
      const response = await fetch(`/api/admin/projects/${projectId}`, { method: "DELETE" });
      if (response.ok) {
        await refreshDashboard();
      }
      return;
    }
    
    const editProjectId = target.getAttribute("data-edit-project");
    if (editProjectId) {
      const project = sessionState?.projects?.find(p => p.id === editProjectId);
      if (project) {
        editingProjectId = editProjectId;
        projectTitle.value = project.title;
        projectDescription.value = project.description;
        projectImage.value = '';
        
        // Open modal first with edit title
        projectModal.classList.remove("hidden");
        projectModal.classList.add("flex");
        document.querySelector('#project-modal h2').textContent = `Edit: ${project.title}`;
      }
      return;
    }
  });

  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    projectMessage.textContent = "";

    const title = projectTitle.value.trim();
    const description = projectDescription.value.trim();
    
    if (!title || !description) {
      projectMessage.textContent = "Title and description are required.";
      return;
    }

    // If editing, image is optional; if creating, it's required
    const file = projectImage.files && projectImage.files[0];
    let imageData = null;
    
    if (file) {
      imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    } else if (!editingProjectId) {
      projectMessage.textContent = "Select an image first.";
      return;
    }

    const method = editingProjectId ? "PUT" : "POST";
    const url = editingProjectId 
      ? `/api/admin/projects/${editingProjectId}`
      : "/api/admin/projects";
    
    const body = { title, description };
    if (imageData) body.image = imageData;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      projectMessage.textContent = payload.error || "Failed to save project.";
      return;
    }

    closeModal();
    await refreshDashboard();
  });

  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    settingsMessage.textContent = "";
    const response = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowedIps: allowedIps.value.split("\n").map((value) => value.trim()).filter(Boolean),
        password: newPassword.value || undefined
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      settingsMessage.textContent = payload.error || "Unable to save settings.";
      return;
    }

    settingsMessage.textContent = "Settings updated.";
    newPassword.value = "";
    await refreshDashboard();
  });

  refreshDashboard().catch(() => {
    setVisible(false);
    currentIp.textContent = "Unable to load admin status. Start the local server first.";
  });
})();
