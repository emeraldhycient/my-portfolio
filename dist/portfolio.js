// Profile and display settings. Published migrations are managed in Sanity Studio.
export const profile = {
  name: "Hycient Igweze",
  handle: "emeraldhycient",
  role: "Senior Full-Stack & ML Engineer",
  location: "London, UK",
  email: "igwezehycient86@gmail.com",
  intro: "I build AI products that hold up in production: national skills and education platforms for the UAE, payment systems processing $30M+ a month, and LLM agents where the model proposes and deterministic code decides.",
  aside: "I keep an ml branch too: small, carefully evaluated models on African data, from malaria blood smears to credit risk.",
  social: {
    github: "https://github.com/emeraldhycient",
    linkedin: "https://www.linkedin.com/in/igweze-hycient",
  },
  // Served from dist/. Replaces the generated text résumé when set.
  resume: { url: "/Hycient-Igweze-CV.pdf", file: "Hycient-Igweze-CV.pdf" },
  about: [
    "I'm a full-stack engineer with 7+ years across fintech, payments, health and government. At Whiteshield I work on AI-powered platforms for governments, including UAE Skills and the EduHub admissions portal, where I also wrote the skills and course recommendation model. Before that I built payment infrastructure for PayS at Sahara Group and led mobile for a multi-currency crypto exchange.",
    "Most of my work sits where models meet real consequences: money, health data, public services. I care about evaluation that doesn't flatter the model, boundaries that limit what a bad output can do, and shipping the boring parts properly. Outside the day job I run PlumAutomate, my software and automation studio, and co-founded Moving Man Logistics in Kigali and EcoRed in Nigeria.",
  ],
  focus: ["AI product engineering", "ML & data pipelines", "Fintech & payments"],
  sample: false,
};

export const branches = [
  { id: "main", label: "main", description: "Shipped products" },
  { id: "work", label: "work", description: "Roles and employers" },
  { id: "ml", label: "ml", description: "Models and data pipelines" },
  { id: "ventures", label: "ventures", description: "Companies I started" },
];

// Every tool listed here appears in the tech stack. Tools a project uses link to
// its filtered log; uncategorized tools from a project's stack go under “Other”.
export const stackGroups = [
  { label: "Languages", tools: ["TypeScript", "JavaScript", "Python", "C#", "Dart"] },
  { label: "Interfaces", tools: ["React", "Next.js", "React Native", "Flutter", "Vite", "Tailwind CSS", "three.js"] },
  { label: "Back end & data", tools: ["Node.js", "NestJS", ".NET", "Prisma", "PostgreSQL", "MongoDB", "Laravel", "Zod"] },
  { label: "ML & AI", tools: ["LangGraph", "Claude API", "ChatGPT API", "Embeddings", "scikit-learn", "TensorFlow", "Keras", "NumPy", "joblib", "TensorBoard", "Weights & Biases"] },
  { label: "Cloud", tools: ["AWS", "Azure", "Railway", "Cloudflare"] },
];
