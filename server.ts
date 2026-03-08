import express from "express";
import { createServer as createViteServer } from "vite";
import { SystemNode, SystemEdge } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory session state
  let sessionState = {
    nodes: [] as SystemNode[],
    edges: [] as SystemEdge[],
    phase: 'PROBLEM_STATEMENT' as 'PROBLEM_STATEMENT' | 'DESIGN' | 'STRESS' | 'EVALUATION',
    scalingChallenge: '',
    signals: [] as string[]
  };

  // API routes
  app.get("/api/session", (req, res) => {
    res.json(sessionState);
  });

  app.post("/api/session/update", (req, res) => {
    const { nodes, edges, scalingChallenge, signals } = req.body;
    sessionState.nodes = nodes;
    sessionState.edges = edges;
    if (scalingChallenge !== undefined) {
      sessionState.scalingChallenge = scalingChallenge;
    }
    if (signals !== undefined) {
      sessionState.signals = signals;
    }
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
