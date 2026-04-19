# COL Games Session Feature Log

## Source / Scope

- Baseline project imported and extended in this session.
- Keep this file updated after **every future change** in this repository.

## Site features now present

### Shared site behavior

- Local language selector for: IT, EN, ES, RU, ZH-CN, AR, JA, FI, SV, NO, PL
- Intro presentation shown only once per browser storage scope
- Intro can be skipped with any key
- Intro skip hint shown low on the screen so it does not cover the animation
- Intro visibility is skipped on back/forward navigation so it does not replay when returning from inner pages
- Intro presentation restored to the original AI Agents & Workflows copy
- Restored the page reveal observer so section text animates back in after the intro
- Re-enabled the final intro chatbox scene by making the prompt box visible before typing the closing line
- Protected header labels so technical nav words do not get translated badly
- Translation layer keeps technical English terms intact
- Protected technical terms include frontier design, web, web app, workflows, AI agents, About, Privacy Policy, and Terms of Service

### Pages

- Landing page with animated intro and service cards
- Portfolio page with 3D project cards
- Admin page for project management
- Existing service/detail pages kept in the same visual style

### Portfolio content

- 8 main project cards (5 default + 3 new projects: Vibyxs, PDFlow, Video Generator Agent)
- 1 future-project placeholder card
- Data-driven rendering from local project storage
- Portfolio now falls back to local `data/projects.json` when the backend API is not available

### Project pages with dynamic content

- **AI & Automation detail page** - Updated with PDFlow and Video Generator Agent projects
  - Removed "Automated Trading Floor" card
  - Added "Other Projects" placeholder card linking to portfolio
- **Web & App detail page** - Updated with Vibyxs project
  - Replaced "Fintech Mobile App" with Vibyxs music platform
  - Dynamic content loading via `web-app-projects.js`
- **Dynamic project loading** via new JavaScript files:
  - `assets/js/ai-projects.js` - Loads project data from `/data/projects.json` 
  - `assets/js/web-app-projects.js` - Replaces first card with Vibyxs data

### Admin dashboard

- IP-restricted access
- Password-protected login
- Allowed IPs editable from the dashboard
- Project creation with title, description, and image upload
- **Project editing** - Modify any existing project (title, description, image)
- Delete project support
- Add-new-project button in the dashboard
- Edit button on each project card

## Admin access

- URL: `http://localhost:3000/admin.html`
- Allowed IPs: `127.0.0.1`, `::1`, `192.168.56.1`, `192.168.1.129`
- Default password: `COL-Games-Admin!`

### Intro animation replay

- Added "Replay" button on landing page only (top-right, smart positioned)
- Button allows users to re-trigger the intro animation anytime
- Button not visible on other pages
- localStorage flag ensures intro shows only on first visit unless replayed

### Improved translation system

- Expanded protected technical terms list to include 40+ terms  
- All protected terms remain in English across all languages (prevents mistranslations)
- Protected terms include: Digital Frontier, Web, App, AI Agents, Workflows, Mobile & Web, Portfolio, Replay, etc.
- Translation uses Google Translate API with smart term protection via token replacement
- **Fixed all spacing issues** - articles correctly separated from protected terms (e.g., "il Digital Frontier" not "ilDigital")
- **All tokens properly resolved** - no `__COL_KEEP_X__` visible in translations
- Non-technical content properly translated in all 11 languages
- "Services" and common words are translated for natural language flow
- Tested and verified working in Italian, Spanish, and all supported languages

## Maintenance flag

- After any future edit or addition, append a short note here describing what changed.
- If a feature is modified, update the relevant section above instead of creating a second log file.
