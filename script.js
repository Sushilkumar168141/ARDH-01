const state = {
  projects: [],
  currentProject: null,
  currentIndex: 0
};

const els = {
  homeView: document.getElementById("homeView"),
  galleryView: document.getElementById("galleryView"),
  projectGrid: document.getElementById("projectGrid"),
  backButton: document.getElementById("backButton"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  galleryEyebrow: document.getElementById("galleryEyebrow"),
  galleryTitle: document.getElementById("galleryTitle"),
  galleryDescription: document.getElementById("galleryDescription"),
  imageCounter: document.getElementById("imageCounter"),
  thumbnailPanel: document.getElementById("thumbnailPanel"),
  imageStage: document.getElementById("imageStage"),
  mainImage: document.getElementById("mainImage"),
  imageLoading: document.getElementById("imageLoading"),
  emptyState: document.getElementById("emptyState"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxCounter: document.getElementById("lightboxCounter"),
  closeLightbox: document.getElementById("closeLightbox"),
  lightboxPrev: document.getElementById("lightboxPrev"),
  lightboxNext: document.getElementById("lightboxNext")
};

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.projects = await response.json();
    renderProjects();
    routeFromHash();
  } catch (error) {
    console.error(error);
    els.projectGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h2>Could not load projects</h2>
        <p>Make sure <code>data/projects.json</code> exists and you are viewing the site through GitHub Pages or a local web server.</p>
      </div>`;
  }
}

function renderProjects() {
  els.projectGrid.innerHTML = "";

  state.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.tabIndex = 0;

    card.innerHTML = `
      <img class="project-cover" src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.name)} cover" loading="lazy">
      <div class="project-card-info">
        <h2 class="project-card-title">${escapeHtml(project.name)}</h2>
        <p class="project-card-description">${escapeHtml(project.description || "")}</p>
      </div>
    `;

    card.addEventListener("click", () => openProject(project.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProject(project.id);
      }
    });

    els.projectGrid.appendChild(card);
  });
}

function openProject(projectId, imageIndex = 0) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  state.currentProject = project;
  state.currentIndex = Math.max(0, Math.min(imageIndex, (project.images || []).length - 1));

  history.replaceState(null, "", `#${encodeURIComponent(project.id)}`);

  els.homeView.classList.add("hidden");
  els.galleryView.classList.remove("hidden");
  els.backButton.classList.remove("hidden");
  els.fullscreenButton.classList.remove("hidden");

  els.pageSubtitle.textContent = project.name;
  els.galleryEyebrow.textContent = "PROJECT";
  els.galleryTitle.textContent = project.name;
  els.galleryDescription.textContent = project.description || "";

  renderThumbnails();
  updateMainImage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  state.currentProject = null;
  state.currentIndex = 0;

  history.replaceState(null, "", window.location.pathname + window.location.search);

  els.galleryView.classList.add("hidden");
  els.homeView.classList.remove("hidden");
  els.backButton.classList.add("hidden");
  els.fullscreenButton.classList.add("hidden");
  els.pageSubtitle.textContent = "Explore projects";

  closeLightbox();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderThumbnails() {
  const images = state.currentProject?.images || [];
  els.thumbnailPanel.innerHTML = "";

  if (!images.length) {
    els.emptyState.classList.remove("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");

  images.forEach((src, index) => {
    const button = document.createElement("button");
    button.className = `thumbnail ${index === state.currentIndex ? "active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Open image ${index + 1}`);

    button.innerHTML = `
      <img src="${escapeHtml(src)}" alt="" loading="lazy">
      <span class="thumbnail-number">${index + 1}</span>
    `;

    button.addEventListener("click", () => {
      state.currentIndex = index;
      updateMainImage();
    });

    els.thumbnailPanel.appendChild(button);
  });
}

function updateMainImage() {
  const images = state.currentProject?.images || [];
  const total = images.length;

  els.imageCounter.textContent = total ? `${state.currentIndex + 1} / ${total}` : "0 / 0";
  els.prevButton.disabled = total <= 1;
  els.nextButton.disabled = total <= 1;

  if (!total) {
    els.mainImage.classList.add("hidden");
    els.emptyState.classList.remove("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");
  els.mainImage.classList.remove("hidden");
  els.imageLoading.classList.remove("hidden");

  const src = images[state.currentIndex];
  els.mainImage.src = src;
  els.mainImage.alt = `${state.currentProject.name} image ${state.currentIndex + 1}`;

  els.mainImage.onload = () => {
    els.imageLoading.classList.add("hidden");
  };

  document.querySelectorAll(".thumbnail").forEach((thumb, index) => {
    thumb.classList.toggle("active", index === state.currentIndex);
  });

  const active = document.querySelector(".thumbnail.active");
  active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
}

function nextImage() {
  const total = state.currentProject?.images?.length || 0;
  if (total < 2) return;
  state.currentIndex = (state.currentIndex + 1) % total;
  updateMainImage();
  if (!els.lightbox.classList.contains("hidden")) updateLightbox();
}

function previousImage() {
  const total = state.currentProject?.images?.length || 0;
  if (total < 2) return;
  state.currentIndex = (state.currentIndex - 1 + total) % total;
  updateMainImage();
  if (!els.lightbox.classList.contains("hidden")) updateLightbox();
}

function openLightbox() {
  if (!state.currentProject?.images?.length) return;
  updateLightbox();
  els.lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  els.lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

function updateLightbox() {
  const src = state.currentProject.images[state.currentIndex];
  els.lightboxImage.src = src;
  els.lightboxImage.alt = `${state.currentProject.name} image ${state.currentIndex + 1}`;
  els.lightboxCounter.textContent =
    `${state.currentIndex + 1} / ${state.currentProject.images.length}`;
}

async function toggleFullscreen() {
  const target = els.galleryView;
  try {
    if (!document.fullscreenElement) {
      await target.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen is not available:", error);
  }
}

function routeFromHash() {
  const id = decodeURIComponent(window.location.hash.replace("#", ""));
  if (!id) return;
  const project = state.projects.find((item) => item.id === id);
  if (project) openProject(project.id);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.backButton.addEventListener("click", showHome);
els.prevButton.addEventListener("click", previousImage);
els.nextButton.addEventListener("click", nextImage);
els.mainImage.addEventListener("click", openLightbox);
els.fullscreenButton.addEventListener("click", toggleFullscreen);

els.closeLightbox.addEventListener("click", closeLightbox);
els.lightboxPrev.addEventListener("click", previousImage);
els.lightboxNext.addEventListener("click", nextImage);

els.lightbox.addEventListener("click", (event) => {
  if (event.target === els.lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!state.currentProject) return;

  if (!els.lightbox.classList.contains("hidden")) {
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "ArrowRight") nextImage();
    return;
  }

  if (event.key === "ArrowLeft") previousImage();
  if (event.key === "ArrowRight") nextImage();
  if (event.key === "Escape") showHome();
});

window.addEventListener("hashchange", routeFromHash);

loadProjects();
