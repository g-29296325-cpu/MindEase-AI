import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// MindEase AI system instructions reflecting secondary school student support
const MINDEASE_SYSTEM_INSTRUCTION = `You are "MindEase AI", a friendly, warm, empathetic, and supportive grounding assistant designed to help secondary school students (teenagers) manage everyday stress, anxiety, and emotional overwhelm during school or home life.

Your core role is to:
- Guide students through evidence-based grounding techniques.
- Encourage self-awareness and emotional regulation.
- Provide positive, hopeful, and non-judgmental support.
- Use simple, positive, age-appropriate language suitable for teenagers.
- Promote resilience, self-belief, and healthy coping strategies.

You may suggest or guide them through these active techniques:
1. 5-4-3-2-1 Grounding Technique (5 see, 4 touch, 3 hear, 2 smell, 1 taste).
2. Box Breathing (breathe in 4s, hold 4s, breathe out 4s, hold 4s, repeat 4 times).
3. Positive Affirmations (e.g. \"I am capable of handling challenges\", \"I can take one step at a time\").
4. Mindful Observation (describing current surroundings gently).
5. Gratitude Reflection (spotting 3 things they appreciate today).

Strict constraints on your replies:
- Always respond with immense empathy, calm energy, and deep encouragement.
- Keep your responses very concise (approx 100–150 words). It must be easy and fast for a stressed student to read.
- Avoid diagnosing any mental health conditions. Do not issue medical advice under any circumstances.
- Encourage the student to reach out and seek support from trusted adults, school counselors, parents, or teachers if they are struggling significantly.

Safety Protocol:
If the user expresses thoughts of self-harm, suicide, or immediate danger:
- Respond immediately with calm, compassionate, and unwavering support.
- Explicitly encourage them to contact emergency services, a trusted adult, parent, school counselor, teacher, or local crisis lines (like 988 or kids helpline) right away.
- Emphasize heavily that they deserve support, are valuated, and do not have to tackle this alone.
- Never suggest, describe, or give instructions related to self-harm.

Your tone: Warm, supportive, encouraging, hopeful, and deeply calm.`;

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid request payload. 'messages' array is required." });
      return;
    }

    const key = process.env.GEMINI_API_KEY;
    const isKeyMissing = !key || key === "MY_GEMINI_API_KEY" || key.trim() === "";

    if (isKeyMissing) {
      // Return a beautiful, warm, smart rule-based supportive response as a direct fallback.
      const userMessageObj = messages[messages.length - 1];
      const userContent = userMessageObj && typeof userMessageObj.content === "string"
        ? userMessageObj.content.toLowerCase()
        : "";

      let reply = "";

      if (userContent.includes("stress") || userContent.includes("anxi") || userContent.includes("overwhelm") || userContent.includes("scared") || userContent.includes("panic") || userContent.includes("worry") || userContent.includes("nervous")) {
        reply = `I hear you, and it is completely okay to feel this way. Stress and anxiety can make your body feel tight and your mind feel like it is racing at a hundred miles an hour. 

You are safe right now, and you do not have to figure everything out this very second. Let's take a slow, gentle grounding pause together. 

I highly recommend clicking on the **Box Breathing** technique in your grounding toolbox. Let's do just one cycle together:
1. **Breathe in** slowly through your nose for 4 seconds...
2. **Gently hold** that air inside for 4 seconds...
3. **Let it out** through your mouth like a soft sigh for 4 seconds...
4. **Wait and rest** in the quiet for 4 seconds.

You are doing great. We are taking things one single step at a time. 🌸`;
      } else if (userContent.includes("grounding") || userContent.includes("5-4-3-2-1") || userContent.includes("54321") || userContent.includes("sense")) {
        reply = `The **5-4-3-2-1 Grounding Technique** is one of the most powerful tools to quiet a busy mind because it redirects your focus to the physical world. Let's try it right now wherever you are:

- 👁️ **5 things you can see**: Look around and name five things—like a pen, a clock, the texture of a desk, or a tree outside.
- 🖐️ **4 things you can feel**: Notice physical touches—the warm clothes on your back, the solid seat holding you, or your hands resting together.
- 👂 **3 things you can hear**: Close your eyes for a second. Can you spot three distant noises? A fan hum, some birds, or quiet breathing?
- 👃 **2 things you can smell**: Try to sniff the air. Maybe a hint of rain, fresh paper, or some tea.
- 👅 **1 thing you can taste**: Focus on your tongue—perhaps cool water, minty toothpaste, or just fresh air.

Try using the interactive **5-4-3-2-1 Grounding Space** tab to write these down. It's a wonderful, safe place to anchor yourself! 🧘`;
      } else if (userContent.includes("breath") || userContent.includes("box") || userContent.includes("inhale") || userContent.includes("lungs")) {
        reply = `Focusing on our breathing is like sending a direct signal to our nervous system saying, *"It's safe to rest now."* 🍃

I recommend using the interactive **Box Breathing** bubble above! It will guide you step-by-step with a beautiful pulsing indicator. 

If you prefer to breathe with me here in our chat, let's start a gentle loop:
- **Breathe in** slowly... 1... 2... 3... 4.
- **Hold** that gentle breath... 1... 2... 3... 4.
- **Exhale slowly** and release all tightness... 1... 2... 3... 4.
- **Rest** in the stillness... 1... 2... 3... 4.

You are doing wonderfully. Feel the ground beneath you and let your shoulders drop. ❤️`;
      } else if (userContent.includes("affirmation") || userContent.includes("positive") || userContent.includes("reminder") || userContent.includes("hope") || userContent.includes("cope")) {
        reply = `Here are three comforting, positive reminders to hold onto today. Read them slowly, and let them settle in your mind:

1. 🌸 **"I am capable of handling challenges and taking things one step at a time."**
2. 🌱 **"My worth is not defined by comparison, grades, or tough days. I am enough exactly as I am."**
3. 🍃 **"I give myself permission to rest, recharge, and breathe."**

Whenever you want to draw a cozy reminder card, try tapping the **Positive Affirmations** card deck!`;
      } else if (userContent.includes("appreciate") || userContent.includes("gratitude") || userContent.includes("thankful") || userContent.includes("happy") || userContent.includes("joy")) {
        reply = `Focusing on gratitude isn't about ignoring tough things—it's about finding tiny spark-points of warmth that remind us we are supported. 🌻

What are three small, simple joys in your day? It doesn't have to be anything massive! For example:
- The comfort of a super soft hoodie or socks.
- A funny joke or meme that made you smile today.
- The refreshing taste of a cold glass of cooling water.

Try planting these safe thoughts in our **Gratitude Garden** tab above so you can grow your list and read it whenever you need a lift! Let's reflect on one good thing together.`;
      } else if (userContent.includes("music") || userContent.includes("sound") || userContent.includes("song") || userContent.includes("rain") || userContent.includes("campfire") || userContent.includes("audio") || userContent.includes("listen") || userContent.includes("tune")) {
        reply = `Hearing constant, steady, and warm rhythms can naturally calm the body, lower your heart rate, and quiet a busy mind. 🎧

I highly recommend trying our interactive **Calming Soundscapes** tab! It allows you to play and mix beautiful, real-time synthesized soundscapes:
- 🌸 **Cozy Ambient Pad**: Smooth, warm chords that rise and fade in slow waves.
- 🌊 **Ocean Whispers**: Physical wave sweeps to sync your calm breathing with.
- 🌧️ **Summer Rain**: Continuous rain rustle with organic individual droplets.
- 🔥 **Cozy Campfire**: Gentle wood log rumbles and crackling spark pops.
- 🔔 **Singing Bowl Ritual**: Tap to strike a rich, warm, resonant acoustic bell.

You can layer these sounds together to create your perfect comforting background, and configure a sleep timer to fade out gracefully. Try turning on the **Start Ambiance** button in that tab! 🍃`;
      } else if (userContent.includes("bubble") || userContent.includes("pop") || userContent.includes("burst") || userContent.includes("game") || userContent.includes("fidget") || userContent.includes("click") || userContent.includes("worry")) {
        reply = `Popping bubbles is a deeply satisfying physical fidget that triggers sensory relief and helps redirect hyperactive thoughts. 🎈
        
I highly recommend checking out our interactive **Calming Bubbles** space! It includes two beautiful modes:
1. 🧼 **Bubble Wrap Sheet**: Pop columns of neat mechanical bubble wrap. Each pop has a distinct real-time synthesized acoustic click and visual flattening effect.
2. 🎐 **Worry Sanctuary Jar**: Type an anxious feeling (such as "exam stress" or "friend issues"), watch it float beautifully inside a calming glass jar, and tap to disintegrate it to set your mind at ease.
        
You can even toggle **Wind Chimes** or **Harmony Pads** to play soft background music alongside your popping sessions to deepen the calming atmosphere. Give it a try! 🌸`;
      } else {
        reply = `I am so glad you reached out. No matter what is on your mind—stress about upcoming exams, friendship worries, or just feeling a bit tired—your feelings are completely valid and you are not alone. 

Remember, choosing to navigate things slowly is a sign of immense courage. Take things one moment at a time.

Would you like us to practice a gentle exercise together?
- ✨ Try **Box Breathing**
- 👁️ Explore the **5-4-3-2-1 Grounding Space**
- 🌸 Draw a card from **Positive Affirmations**
- 🌻 Plant a seed in the **Gratitude Garden**
- 🎧 Mix **Calming Soundscapes**
- 🧼 Try **Calming Bubbles**

Whatever you choose, take your time. I am right here with you. ❤️`;
      }

      // Append helpful developer tips to let them know how to activate Gemini while maintaining clean UI
      reply += `\n\n*(Note: Running in offline/fallback mode. Configure **GEMINI_API_KEY** in your Settings' Secrets panel to enable full real-time Gemini AI chat!)*`;

      res.json({ reply });
      return;
    }

    const ai = getGeminiClient();

    // Map client-side message format to Gemini SDK parts format
    // The role in @google/genai must be 'user' or 'model'
    const formattedContents = messages.map((m: any) => {
      const role = m.role === "user" ? "user" : "model";
      return {
        role: role,
        parts: [{ text: m.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: MINDEASE_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I am here for you. How are you feeling right now?";

    res.json({ reply });
  } catch (err: any) {
    console.error("Error calling Gemini API:", err);
    res.status(500).json({
      error: err.message || "An error occurred while generating a supportive response.",
    });
  }
});

// Setup Vite or serve production build
async function start() {
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
    console.log(`MindEase AI Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
