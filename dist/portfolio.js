// Replace the sample profile and migrations here when the real work is ready.
// Migrations may be in any order. Parents and branch names drive both graphs.
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

export const migrations = [
  {
    id: "relay", number: 6, hash: "e8f2a61", date: "2026-10-14", branch: "main",
    parents: ["wayfinder", "formwork", "oscillator"], title: "Relay",
    kind: "Event infrastructure", art: "relay",
    summary: "A webhook delivery engine that picks up where a failed request left off.",
    stack: ["TypeScript", "PostgreSQL", "Redis"],
    before: "A slow receiver could hold up a whole batch. When someone retried the batch manually, endpoints that had already succeeded saw the same event twice.",
    after: "Each receiver gets its own durable delivery record. A worker retries just that record, using a stable event ID so the receiver can recognize a replay.",
    notes: [
      "Write the event and its outbox record in one database transaction.",
      "Back off on repeated failures and expose the next attempt time in the delivery log.",
      "Keep the original payload on manual replay so a retry is easy to audit.",
    ],
  },
  {
    id: "formwork", number: 5, hash: "b46d09c", date: "2026-07-28", branch: "systems",
    parents: ["tracekit"], title: "Formwork", kind: "Interface system", art: "formwork",
    summary: "A small component system for interfaces that work from the keyboard up.",
    stack: ["React", "TypeScript", "CSS"],
    before: "Every product screen had its own version of a menu. The styles looked similar, but arrow keys, focus return, and dismissal behaved differently.",
    after: "Menus, popovers, and dialogs share the same focus rules. Each primitive ships with an unstyled surface and a small set of tokens for the visual layer.",
    notes: [
      "Treat focus movement and keyboard intent as part of the component API.",
      "Test the behavior with real keyboard sequences before adding visual variants.",
      "Document examples by task, so a designer can find a pattern without knowing its component name.",
    ],
  },
  {
    id: "oscillator", number: 4, hash: "cf2b890", date: "2026-04-09", branch: "lab",
    parents: ["wayfinder"], title: "Oscillator", kind: "Audio experiment", art: "oscillator",
    summary: "A browser instrument that turns a hand-drawn curve into a playable waveform.",
    stack: ["Web Audio", "Canvas", "JavaScript"],
    before: "A standard oscillator offers a handful of fixed shapes. I wanted to hear what an imperfect curve would sound like without exporting it to another tool.",
    after: "The instrument samples a drawing into a periodic wave. The same drawing becomes the display and the sound source, so a small edit has an audible effect.",
    notes: [
      "Resample the drawing at equal intervals before building its frequency table.",
      "Crossfade between wave tables to avoid clicks during edits.",
      "Start the audio context only after an explicit play gesture.",
    ],
  },
  {
    id: "wayfinder", number: 3, hash: "a71d56e", date: "2025-11-17", branch: "main",
    parents: ["scratchpad"], title: "Wayfinder", kind: "Mapping application", art: "wayfinder",
    summary: "A field map that keeps a saved trail readable beyond the last bar of signal.",
    stack: ["MapLibre", "IndexedDB", "Service Worker"],
    before: "A trail link worked at the kitchen table but often opened onto an empty map at the trailhead. A path without its surrounding landmarks was hard to use.",
    after: "Saving a walk stores the route, its nearby tiles, and the turn notes together. The map can tell you whether that complete region is ready offline.",
    notes: [
      "Bundle a route with a bounded tile region rather than caching a whole city.",
      "Finish writing the new bundle before replacing the previous one.",
      "Expose the last saved date and the extent of offline coverage.",
    ],
  },
  {
    id: "tracekit", number: 2, hash: "d903f4b", date: "2025-06-06", branch: "systems",
    parents: ["scratchpad"], title: "Tracekit", kind: "Observability tool", art: "tracekit",
    summary: "A compact trace viewer for following a single request across services.",
    stack: ["Go", "OpenTelemetry", "SVG"],
    before: "A single failed checkout meant moving between log streams and guessing which timestamps belonged to the same request.",
    after: "A request carries its trace context across service boundaries. The viewer lays out the spans on one time axis and links a failed span to its log event.",
    notes: [
      "Propagate context across HTTP and background jobs.",
      "Keep gaps visible so waiting time is distinguishable from execution.",
      "Allow spans to arrive out of order without losing the parent relationship.",
    ],
  },
  {
    id: "scratchpad", number: 1, hash: "13a89fc", date: "2025-02-12", branch: "main",
    parents: [], title: "Scratchpad", kind: "Local-first notebook", art: "scratchpad",
    summary: "A pocket notebook for the snippets and half-finished ideas between projects.",
    stack: ["TypeScript", "IndexedDB", "Markdown"],
    before: "Useful snippets lived in terminal history, temporary files, and messages to myself. Finding a piece later depended on remembering where I had put it.",
    after: "One shortcut opens a local notebook with plain-text search. Each entry can be exported as Markdown, so the notes never depend on the app.",
    notes: [
      "Save to the device first and show when the write has finished.",
      "Index the title and code together so either can retrieve a note.",
      "Use portable text for export rather than a private backup format.",
    ],
  },
];
