// Profile and display settings. Published migrations are managed in Sanity Studio.
export const profile = {
  name: "Hycient Igweze",
  handle: "emeraldhycient",
  role: "Senior Full-Stack & ML Engineer",
  location: "London, UK",
  email: "igwezehycient86@gmail.com",
  intro: "Full-stack and ML engineer with ~a decade of experience across fintech, payments, health and government. I design and ship web, mobile and back-end systems end to end, build ML models and the data pipelines behind them, and put LLMs into products with guardrails that hold.",
  aside: "Most of my work sits where software meets real consequences: money, health data and public services. I care about honest evaluation, clear boundaries and shipping the unglamorous parts properly.",
  social: {
    github: "https://github.com/emeraldhycient",
    linkedin: "https://www.linkedin.com/in/igweze-hycient",
  },
  // Served from dist/. Replaces the generated text résumé when set.
  resume: { url: "/Hycient-Igweze-CV.pdf", file: "Hycient-Igweze-CV.pdf" },
  // A second CV, shown as its own cell after Résumé.
  altResume: { label: "AI/ML CV", url: "/Hycient-Igweze-CV-AI-ML.pdf", file: "Hycient-Igweze-CV-AI-ML.pdf" },
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
  { label: "Languages", tools: ["TypeScript", "JavaScript", "Python", "C#", "Dart", "PHP", "SQL"] },
  { label: "Front end & mobile", tools: ["React", "Next.js", "React Native", "Flutter", "Vite", "Tailwind CSS", "three.js"] },
  { label: "Back end & APIs", tools: ["Node.js", "NestJS", "Express", ".NET", "Laravel", "GraphQL", "REST APIs", "Zod"] },
  { label: "Data", tools: ["PostgreSQL", "MongoDB", "MySQL", "Prisma", "Data pipelines"] },
  { label: "ML & AI", tools: ["LLM agents", "LangGraph", "Claude API", "ChatGPT API", "Embeddings", "Recommendation systems", "Computer vision", "scikit-learn", "TensorFlow", "Keras", "NumPy", "joblib", "TensorBoard", "Weights & Biases"] },
  { label: "Cloud & delivery", tools: ["AWS", "Azure", "Vercel", "Railway", "Cloudflare", "CI/CD", "TDD"] },
  { label: "Leadership", tools: ["System architecture", "Technical leadership", "Mentoring", "Stakeholder management"] },
];
