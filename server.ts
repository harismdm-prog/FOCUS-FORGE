import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    users: [],
    sessions: [],
    blockedSites: [],
    blockedApps: [],
    blockedMobileApps: []
  }, null, 2));
}

function readData() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  // Ensure all keys exist
  return {
    users: [],
    sessions: [],
    blockedSites: [],
    blockedApps: [],
    blockedMobileApps: [],
    ...data
  };
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path}`, req.body);
    }
    next();
  });

  // API Routes
  app.get("/api/user/:email", (req, res) => {
    const { email } = req.params;
    const data = readData();
    let user = data.users.find((u: any) => u.email === email);
    
    if (!user) {
      user = {
        id: Date.now().toString(),
        email,
        name: email.split("@")[0],
        xp: 0,
        level: 1,
        streak: 0,
        lastSessionDate: null
      };
      data.users.push(user);
      writeData(data);
    }
    
    res.json(user);
  });

  app.post("/api/sessions", (req, res) => {
    const { userId, duration, completed } = req.body;
    const data = readData();
    
    const session = {
      id: Date.now().toString(),
      userId,
      duration,
      completed,
      date: new Date().toISOString()
    };
    
    data.sessions.push(session);
    
    // Update user XP and streak
    const user = data.users.find((u: any) => u.id === userId);
    if (user && completed) {
      user.xp += Math.floor(duration / 60) * 10; // 10 XP per minute
      user.level = Math.floor(user.xp / 1000) + 1;
      
      const today = new Date().toISOString().split("T")[0];
      if (user.lastSessionDate !== today) {
        user.streak += 1;
        user.lastSessionDate = today;
      }
    }
    
    writeData(data);
    res.json({ session, user });
  });

  app.get("/api/stats/:userId", (req, res) => {
    const { userId } = req.params;
    const data = readData();
    const userSessions = data.sessions.filter((s: any) => s.userId === userId);
    res.json(userSessions);
  });

  app.delete("/api/stats/:userId", (req, res) => {
    const { userId } = req.params;
    const data = readData();
    
    // Remove sessions
    data.sessions = data.sessions.filter((s: any) => s.userId !== userId);
    
    // Reset user stats
    const user = data.users.find((u: any) => u.id === userId);
    if (user) {
      user.xp = 0;
      user.level = 1;
      user.streak = 0;
      user.lastSessionDate = null;
    }
    
    writeData(data);
    res.sendStatus(204);
  });

  app.get("/api/blocked-sites/:userId", (req, res) => {
    const { userId } = req.params;
    const data = readData();
    const sites = data.blockedSites.filter((s: any) => s.userId === userId);
    res.json(sites);
  });

  app.post("/api/blocked-sites", (req, res) => {
    const { userId, url } = req.body;
    console.log("POST /api/blocked-sites", { userId, url });
    const data = readData();
    
    const existing = data.blockedSites.find((s: any) => s.userId === userId && s.url === url);
    if (!existing) {
      data.blockedSites.push({ id: Date.now().toString(), userId, url });
      writeData(data);
    }
    
    res.json(data.blockedSites.filter((s: any) => s.userId === userId));
  });

  app.get("/api/blocked-apps/:userId", (req, res) => {
    const { userId } = req.params;
    const data = readData();
    const apps = data.blockedApps.filter((a: any) => a.userId === userId);
    res.json(apps);
  });

  app.post("/api/blocked-apps", (req, res) => {
    const { userId, name } = req.body;
    console.log("POST /api/blocked-apps", { userId, name });
    const data = readData();
    
    const existing = data.blockedApps.find((a: any) => a.userId === userId && a.name === name);
    if (!existing) {
      data.blockedApps.push({ id: Date.now().toString(), userId, name });
      writeData(data);
    }
    
    res.json(data.blockedApps.filter((a: any) => a.userId === userId));
  });

  app.delete("/api/blocked-apps/:id", (req, res) => {
    const { id } = req.params;
    const data = readData();
    data.blockedApps = data.blockedApps.filter((a: any) => a.id !== id);
    writeData(data);
    res.sendStatus(204);
  });

  app.get("/api/blocked-mobile-apps/:userId", (req, res) => {
    const { userId } = req.params;
    const data = readData();
    const apps = data.blockedMobileApps.filter((a: any) => a.userId === userId);
    res.json(apps);
  });

  app.post("/api/blocked-mobile-apps", (req, res) => {
    const { userId, name } = req.body;
    console.log("POST /api/blocked-mobile-apps", { userId, name });
    const data = readData();
    
    const existing = data.blockedMobileApps.find((a: any) => a.userId === userId && a.name === name);
    if (!existing) {
      data.blockedMobileApps.push({ id: Date.now().toString(), userId, name });
      writeData(data);
    }
    
    res.json(data.blockedMobileApps.filter((a: any) => a.userId === userId));
  });

  app.delete("/api/blocked-mobile-apps/:id", (req, res) => {
    const { id } = req.params;
    const data = readData();
    data.blockedMobileApps = data.blockedMobileApps.filter((a: any) => a.id !== id);
    writeData(data);
    res.sendStatus(204);
  });

  app.patch("/api/user/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const data = readData();
    
    const userIndex = data.users.findIndex((u: any) => u.id === id);
    if (userIndex !== -1) {
      data.users[userIndex] = { ...data.users[userIndex], ...updates };
      writeData(data);
      res.json(data.users[userIndex]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/blocked-sites/:id", (req, res) => {
    const { id } = req.params;
    const data = readData();
    data.blockedSites = data.blockedSites.filter((s: any) => s.id !== id);
    writeData(data);
    res.sendStatus(204);
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
