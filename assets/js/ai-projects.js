// Load and render AI projects dynamically
(async function() {
  const projectIds = ['61d2a07b-0fd2-4345-9ac8-d16b8882b06f', '415d03e3-f6e7-4443-8472-a354aed689fe', null];
  const customProjects = [
    {
      title: 'PDFlow',
      description: 'Automated pipeline who reads data from PDF\'s and creates tables on excel with all the data you need'
    },
    {
      title: 'Video Generator Agent',
      description: 'Automated pipeline who creates ready-to-post videos starting from a prompt'
    },
    {
      title: 'Other Projects',
      description: 'Explore a range of custom AI solutions tailored to your business needs',
      isPlaceholder: true
    }
  ];

  try {
    const response = await fetch('/data/projects.json');
    const projects = await response.json();
    
    const cardsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    if (!cardsContainer) return;

    // Replace the first 3 cards
    const existingCards = cardsContainer.querySelectorAll('.group.relative.bg-surface-container-highest');
    
    for (let i = 0; i < 3 && i < existingCards.length; i++) {
      const card = existingCards[i];
      const projData = customProjects[i];
      const proj = projectIds[i] ? projects.find(p => p.id === projectIds[i]) : null;
      
      if (proj) {
        // Update with data from projects.json
        const imgEl = card.querySelector('img');
        const titleEl = card.querySelector('h4');
        const descEl = card.querySelector('p');
        
        if (imgEl) imgEl.src = proj.image;
        if (titleEl) titleEl.textContent = proj.title;
        if (descEl) descEl.textContent = proj.description;
      } else if (projData) {
        // Use custom project data
        const titleEl = card.querySelector('h4');
        const descEl = card.querySelector('p');
        
        if (titleEl) titleEl.textContent = projData.title;
        if (descEl) descEl.textContent = projData.description;
        
        if (projData.isPlaceholder) {
          card.classList.add('opacity-75');
        }
      }
    }
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
})();
