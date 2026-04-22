import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
}));

app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Debug check
console.log("API KEY:", GROQ_API_KEY ? "Loaded" : "Missing");

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be array" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // safer model
          messages: messages,
          temperature: 0.7,
          max_tokens: 512,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("GROQ ERROR:", JSON.stringify(data, null, 2));
      return res.status(response.status).json({
        error: data?.error?.message || "Groq API error",
      });
    }

    res.json(data);

  } catch (error) {
    console.log("SERVER ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
