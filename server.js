const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { URL } = require("url");

// Security & Rate Limiting
const MAX_REQUEST_SIZE = 1024 * 100; // 100 KB max
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 requests per window per IP
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW = 10 * 60 * 1000; // 10 minutes

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const CONFIG_PATH = path.join(DATA_DIR, "admin-config.json");
const PROJECTS_PATH = path.join(DATA_DIR, "projects.json");
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "COL-Games-Admin!"; // Use env var if available
const sessions = new Map();
const rateLimitMap = new Map(); // Track request count per IP
const loginAttemptsMap = new Map(); // Track failed login attempts per IP

function normalizeIp(ip) {
  return (ip || "").replace(/^::ffff:/, "");
}

function getPrimaryIp() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }
  return "127.0.0.1";
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

function defaultProjects() {
  return [
    {
      id: "lumina-systems",
      title: "Lumina Systems",
      description: "Realtime data architecture for energy operations and command centers.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBVUbtyhqc1BlpBpp3ZXb5TST5F5Lt0dd_CpQvgthq3EcQ2AKFU3B1M5E9gP597NFKb20KCxK5Bfwaj038Fn-ta3lFVnePJuulaLLMvog30ofEzztRq6iMO9rqV9pOB3OVklKIQdr0tc2MW23sPb-TNWS76eDnajzcuYIVrl4dL7X01XNFimm3L7C5o-48CzPVij_XqHz3rA5kkwqOq-Eyd3s69bDRon_K-rKzJRD3VLPp2qp4hy4aBzVB3dzZofG8gqq7qGis3KVQ"
    },
    {
      id: "void-commerce",
      title: "Void Commerce",
      description: "High-end retail and commerce systems with immersive headless workflows.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgCFMzHlxwwqPEeWG-2FWGKWNRlZKmYHb-6HHXqkiLAZi7LxHU43Luehh8n7ISLKwdvxFyjmhxEMEJ7E4PUDuysC5fM8sQyAQIvDxf-fxXA-9QaGvuEnedMUntGr9w7NPcGjdrMnpJKQ73r98ERkRTWQM8ztFAEb5Zb1hTbzW9aqBUz69reut9LrotN2k-xiDC0xLIXod4ycXsVXy8BWQz90AH5nWUEo6OSoRL71onsySJPLVBqX4r7TeTSDTsFTOQbNgqFCyd_bkp"
    },
    {
      id: "atlas-protocol",
      title: "Atlas Protocol",
      description: "Geospatial tooling built for sub-100ms interaction and live operations.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNvKILnVyAmlLS_3bvO3vRwThMN21AiQhxq-yaWkFJjbXyJ_olMP-Wm2yZQZStCMvNOfpqSjVASN7X7k4JXJY3jyloDFE89g1vk5Eb60HtOUiOxafU_AMCwpc0UtGRE8-0duksVB-Z3fzLK8h8zS3ncXbhwPZZd0DHWKehSWyGnAlscv_XbxPqC3tFi9vG1X5_kEJllIdNxnGwdtYJ25VSUTRAtsIAXOfN5TVXg1Z7XWDua-khfT6t5hz_J9nOGDh4VTU2eqsY-Wb7"
    },
    {
      id: "neon-agents",
      title: "Neon Agents",
      description: "Agent orchestration for support, routing, and backend process automation.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjj4nvf10-b3MyQbcCEaEgDZCsY4cJQzmcQ_LpIn3twmU7NkWcLcB7ynroR5WSJYpR2MgkR9C4OnqtqlCzE9IdvR-CcTVA_icUte_qu4czqOvgnRfNSRpRvkzZAlZqlEEBTHOmpp-pe3_CtGkZALe4ZNuS0_AimGKppJQE_nO0MQbcwuZD3Dq6XeWST7kJJgQ75RpxoM0MRX5IzEDDHvZD5b2KEEa0f-yInJzyTqqDEClg77uaLTwRjUwK4qggjwDEX0kttVjHOBzo"
    },
    {
      id: "signal-lab",
      title: "Signal Lab",
      description: "A flexible experimentation layer for dashboards, reports, and analytics.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClF3AU25PMYFpiFeVSp4rYbXytFHKUJ01IrCUBororjW5e5LOP8hSI-3OnQf1bFxaL81wHv0040XBZX72LQmvNnd_G8j_jTWBTfzP9AhXhC5oiQ_iNzD7fGMbozj-klH9BlgpsownbFpi1qXyghjKon6iygUSiMMDMBUhzrNc5QhC5_tGvS3bWuPWfaAaxuQJ2Jq10AfB5h-IF8hLkz7crl0HJ4cds3jkeRq7N4uLf0tiADhF8-MXyePo_Mc-RJGm1Wp8zzsnWjddP"
    }
  ];
}

function ensureDataFiles() {
  ensureDir(DATA_DIR);

  if (!fs.existsSync(CONFIG_PATH)) {
    writeJson(CONFIG_PATH, {
      allowedIps: ["127.0.0.1", "::1", getPrimaryIp()],
      password: DEFAULT_PASSWORD
    });
  }

  if (!fs.existsSync(PROJECTS_PATH)) {
    writeJson(PROJECTS_PATH, defaultProjects());
  }
}

ensureDataFiles();

let config = readJson(CONFIG_PATH, null) || {
  allowedIps: ["127.0.0.1", "::1", getPrimaryIp()],
  password: DEFAULT_PASSWORD
};
let projects = readJson(PROJECTS_PATH, defaultProjects());

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

// ============================================
// SECURITY FUNCTIONS
// ============================================

// Input Sanitization - Prevent XSS & Injection
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, 2000) // Max 2000 chars
    .replace(/[<>"'`]/g, '') // Remove HTML/script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

function sanitizeProjectData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid project data');
  }
  return {
    id: String(data.id || '').slice(0, 100),
    title: sanitizeString(data.title),
    description: sanitizeString(data.description),
    image: sanitizeUrl(data.image),
    createdAt: data.createdAt || new Date().toISOString()
  };
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const sanitized = String(url).trim().slice(0, 2000);
  // Only allow http, https, and data URLs
  if (!sanitized.match(/^(https?:|data:)/i)) return '';
  return sanitized;
}

// Rate Limiting
function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  
  // Cleanup old entries
  if (recentRequests.length === 0) {
    rateLimitMap.delete(ip);
  }
  
  return true;
}

// Login Attempt Tracking
function trackLoginAttempt(ip, success) {
  const now = Date.now();
  const attempts = loginAttemptsMap.get(ip) || [];
  
  if (success) {
    loginAttemptsMap.delete(ip);
    return true;
  }
  
  // Filter out old attempts
  const recentAttempts = attempts.filter(time => now - time < LOGIN_ATTEMPT_WINDOW);
  recentAttempts.push(now);
  
  if (recentAttempts.length > MAX_LOGIN_ATTEMPTS) {
    return false; // Too many failed attempts
  }
  
  loginAttemptsMap.set(ip, recentAttempts);
  return true;
}

// Session Validation & Cleanup
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TIMEOUT) {
      sessions.delete(token);
    }
  }
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return normalizeIp(String(forwarded).split(",")[0].trim());
  return normalizeIp(req.socket.remoteAddress);
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((acc, item) => {
    const [name, ...rest] = item.trim().split("=");
    if (!name) return acc;
    acc[name] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_REQUEST_SIZE) {
        reject(new Error('Request body too large'));
        return;
      }
      chunks.push(chunk);
    });
    
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function send(res, statusCode, body, headers = {}) {
  const securityHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data:",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    ...headers
  };
  res.writeHead(statusCode, securityHeaders);
  res.end(JSON.stringify(body));
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8", headers = {}) {
  const securityHeaders = {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    ...headers
  };
  res.writeHead(statusCode, securityHeaders);
  res.end(text);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || "application/octet-stream";
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 404, "Not found");
      return;
    }
    const securityHeaders = {
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": ext === '.html' ? "no-cache" : "public, max-age=31536000"
    };
    res.writeHead(200, securityHeaders);
    res.end(data);
  });
}

function isAllowedIp(ip) {
  return Array.isArray(config.allowedIps) && config.allowedIps.includes(ip);
}

function createSession(ip) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { ip, createdAt: Date.now() });
  return token;
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies.admin_session;
  if (!token) return null;
  
  const session = sessions.get(token);
  if (!session) return null;
  
  // Check session timeout
  if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
    sessions.delete(token);
    return null;
  }
  
  const ip = getClientIp(req);
  if (session.ip !== ip || !isAllowedIp(ip)) return null;
  return { token, ...session };
}

function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    send(res, 401, { error: "Not authenticated" });
    return null;
  }
  return session;
}

function setAuthCookie(res, token) {
  res.setHeader("Set-Cookie", `admin_session=${token}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=1800`);
}

function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", "admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict");
}

function sanitizeProject(project) {
  return {
    id: project.id,
    title: String(project.title || "").trim(),
    description: String(project.description || "").trim(),
    image: String(project.image || "").trim(),
    createdAt: project.createdAt || new Date().toISOString()
  };
}

function loadProjects() {
  projects = readJson(PROJECTS_PATH, projects);
  return projects;
}

function saveProjects(nextProjects) {
  projects = nextProjects;
  writeJson(PROJECTS_PATH, projects);
}

function saveConfig(nextConfig) {
  config = nextConfig;
  writeJson(CONFIG_PATH, config);
}

function renderErrorPage(title, message) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family:system-ui;background:#0b1326;color:#dae2fd;display:grid;place-items:center;min-height:100vh;padding:24px;"><div style="max-width:640px;"><h1 style="font-size:2rem;margin:0 0 1rem;">${title}</h1><p style="color:#c7c4d8;line-height:1.6;">${message}</p></div></body></html>`;
}

const server = http.createServer(async (req, res) => {
  const ip = getClientIp(req);
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/projects" && req.method === "GET") {
      send(res, 200, { projects: loadProjects() });
      return;
    }

    if (pathname === "/api/admin/session" && req.method === "GET") {
      const session = getSession(req);
      send(res, 200, {
        authenticated: Boolean(session),
        clientIp: ip,
        allowed: isAllowedIp(ip),
        config: session ? { allowedIps: config.allowedIps } : null,
        projects: session ? loadProjects() : null
      });
      return;
    }

    if (pathname === "/api/admin/login" && req.method === "POST") {
      if (!isAllowedIp(ip)) {
        send(res, 403, { error: "IP not allowed" });
        return;
      }
      
      // Rate limiting on login attempts
      if (!trackLoginAttempt(ip, false)) {
        send(res, 429, { error: "Too many login attempts. Please try again later." });
        return;
      }
      
      try {
        const body = await readBody(req);
        const passwordMatch = String(body.password || "") === String(config.password || "");
        
        if (!passwordMatch) {
          send(res, 401, { error: "Invalid credentials" });
          return;
        }
        
        // Clear failed attempts on successful login
        trackLoginAttempt(ip, true);
        
        const token = createSession(ip);
        setAuthCookie(res, token);
        send(res, 200, { ok: true, clientIp: ip });
      } catch (error) {
        send(res, 400, { error: "Invalid request" });
      }
      return;
    }

    if (pathname === "/api/admin/logout" && req.method === "POST") {
      const session = getSession(req);
      if (session) sessions.delete(session.token);
      clearAuthCookie(res);
      send(res, 200, { ok: true });
      return;
    }

    if (pathname === "/api/admin/config" && req.method === "GET") {
      const session = requireSession(req, res);
      if (!session) return;
      send(res, 200, {
        allowedIps: config.allowedIps,
        clientIp: ip
      });
      return;
    }

    if (pathname === "/api/admin/config" && req.method === "PUT") {
      const session = requireSession(req, res);
      if (!session) return;
      const body = await readBody(req);
      const allowedIps = Array.isArray(body.allowedIps)
        ? body.allowedIps.map((item) => normalizeIp(String(item).trim())).filter(Boolean)
        : config.allowedIps;
      const nextConfig = {
        allowedIps: [...new Set(allowedIps)],
        password: body.password ? String(body.password) : config.password
      };
      saveConfig(nextConfig);
      send(res, 200, { ok: true, allowedIps: nextConfig.allowedIps, clientIp: ip });
      return;
    }

    if (pathname === "/api/admin/projects" && req.method === "GET") {
      const session = requireSession(req, res);
      if (!session) return;
      send(res, 200, { projects: loadProjects() });
      return;
    }

    if (pathname === "/api/admin/projects" && req.method === "POST") {
      const session = requireSession(req, res);
      if (!session) return;
      
      try {
        const body = await readBody(req);
        
        // Validate required fields
        if (!body.title || !body.description || !body.image) {
          send(res, 400, { error: "Missing required fields" });
          return;
        }
        
        // Sanitize and validate input
        const sanitized = sanitizeProjectData({
          id: crypto.randomUUID(),
          title: body.title,
          description: body.description,
          image: body.image,
          createdAt: new Date().toISOString()
        });
        
        const next = [sanitized, ...loadProjects()];
        saveProjects(next);
        send(res, 201, { ok: true, projects: next });
      } catch (error) {
        send(res, 400, { error: "Invalid project data" });
      }
      return;

    const projectMatch = pathname.match(/^\/api\/admin\/projects\/([a-f0-9\-]+)$/i);
    if (projectMatch && req.method === "PUT") {
      const session = requireSession(req, res);
      if (!session) return;
      
      try {
        const body = await readBody(req);
        const projectId = projectMatch[1];
        
        const nextProjects = loadProjects().map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            title: body.title ? sanitizeString(body.title) : project.title,
            description: body.description ? sanitizeString(body.description) : project.description,
            image: body.image ? sanitizeUrl(body.image) : project.image
          };
        });
        
        saveProjects(nextProjects);
        send(res, 200, { ok: true, projects: nextProjects });
      } catch (error) {
        send(res, 400, { error: "Invalid request" });
      }
      return;
    }

    if (projectMatch && req.method === "DELETE") {
      const session = requireSession(req, res);
      if (!session) return;
      const projectId = projectMatch[1];
      const nextProjects = loadProjects().filter((project) => project.id !== projectId);
      saveProjects(nextProjects);
      send(res, 200, { ok: true, projects: nextProjects });
      return;
    }

    send(res, 404, { error: "Not found" });
    return;
  }

  if (pathname === "/admin.html" && !isAllowedIp(ip)) {
    res.writeHead(403, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderErrorPage("Access denied", "This admin page is only available from the allowed IP addresses configured in the dashboard."));
    return;
  }

  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
    sendText(res, 400, "Invalid path");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  sendText(res, 404, "Not found");
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`COL Games server running on http://localhost:${port}`);
  console.log(`Allowed IPs: ${config.allowedIps.join(", ")}`);
});
