const API_URL = import.meta.env.VITE_API_URL || "https://api.singgah.site";

async function read(pathname) {
  const response = await fetch(`${API_URL}${pathname}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  return payload?.data ?? payload;
}

export function registerAgentTools() {
  if (typeof navigator === "undefined") return;

  const modelContext = navigator.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== "function") return;

  const limitSchema = {
    type: "object",
    properties: {
      limit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
    },
    additionalProperties: false,
  };

  const tools = [
    {
      name: "list_news",
      description: "Ambil daftar berita terbaru SINGGAH.",
      inputSchema: limitSchema,
      execute: async ({ limit = 5 } = {}) => read(`/api/news?limit=${limit}`),
    },
    {
      name: "list_projects",
      description: "Ambil daftar karya mahasiswa yang dipublikasikan di SINGGAH.",
      inputSchema: limitSchema,
      execute: async ({ limit = 5 } = {}) => read(`/api/projects?limit=${limit}`),
    },
    {
      name: "list_categories",
      description: "Ambil daftar kategori karya di SINGGAH.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: async () => read("/api/categories"),
    },
    {
      name: "get_site_stats",
      description: "Ambil statistik publik SINGGAH.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: async () => read("/api/stats"),
    },
  ];

  for (const tool of tools) {
    try {
      modelContext.registerTool(tool);
    } catch (error) {
      void error;
    }
  }
}
