// Load and render Web App projects dynamically
(async function() {
  const vibyxsProjectId = '73faf5da-39d3-4b23-bf67-dc57311c5347';
  
  try {
    const response = await fetch('/data/projects.json');
    const projects = await response.json();
    
    const vibyxs = projects.find(p => p.id === vibyxsProjectId);
    if (!vibyxs) return;
    
    // Find the first card (Fintech Mobile App) and replace it with Vibyxs
    const cardsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    if (!cardsContainer) return;
    
    const firstCard = cardsContainer.querySelector('.reveal.reveal-up.group');
    if (!firstCard) return;
    
    // Update image, title, and description
    const imgEl = firstCard.querySelector('img');
    const titleEl = firstCard.querySelector('h4');
    const descEl = firstCard.querySelector('p');
    
    if (imgEl) imgEl.src = vibyxs.image;
    if (imgEl) imgEl.alt = vibyxs.title;
    if (titleEl) titleEl.textContent = vibyxs.title;
    if (descEl) descEl.textContent = vibyxs.description;
  } catch (error) {
    console.error('Failed to load Vibyxs project:', error);
  }
})();
