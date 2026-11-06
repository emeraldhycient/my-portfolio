// Profile and display settings. Published migrations are managed in Sanity Studio.
export const profile = {
  name: "Jules Park",
  handle: "julespark",
  role: "Software engineer",
  location: "London, UK",
  email: "jules@example.com",
  intro: "I build tools for developers, from queues that recover after a dropped request to interfaces that work from a keyboard.",
  aside: "I keep a branch for experiments, too. One of those started with a hand-drawn curve and became a browser instrument.",
  social: { github: "", linkedin: "" },
  about: [
    "I like software that makes a complicated job feel small. Most of my work sits between systems and interfaces: queues that recover quietly, components that work from a keyboard, and tools that tell you what went wrong.",
    "I keep a branch for experiments. Drawing a sound wave or taking a map off the grid often teaches me something I can bring back to the tools I ship.",
  ],
  focus: ["Developer tools", "Interface engineering", "Distributed systems"],
  sample: true,
};

export const branches = [
  { id: "main", label: "main", description: "Shipped projects" },
  { id: "systems", label: "systems", description: "Tools and infrastructure" },
  { id: "lab", label: "lab", description: "Experiments" },
];

// Tools in these groups appear when at least one project uses them. New,
// uncategorized tools from a project's stack are listed under “Other”.
export const stackGroups = [
  { label: "Languages", tools: ["TypeScript", "JavaScript", "Go"] },
  { label: "Interfaces", tools: ["React", "CSS", "Canvas", "SVG", "Web Audio", "MapLibre"] },
  { label: "Data & tools", tools: ["PostgreSQL", "Redis", "IndexedDB", "OpenTelemetry", "Service Worker", "Markdown"] },
];
