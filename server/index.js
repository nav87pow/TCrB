import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/updates", (req, res) => {
  res.json({
    heroUpdate: {
      status: "estimated",
      estimated: { window: { type: "range", from: "2026May", to: "2027Sep" } },
    },
    articles: [
      {
        id: "demo-1",
        source: "web",
        dateLabel: "2026-01-07",
        title: "Demo update (backend wired)",
        excerpt: "Backend endpoint is live. Next step: Groq Analyzer + Search API.",
      },
    ],
  });
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
