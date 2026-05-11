import { useState, useMemo } from "react";
import { parseProjects, type Project } from "@/data/projects";

type SortField = keyof Project;
type SortOrder = "asc" | "desc";

const tagPalette = [
  "bg-pink-200 text-pink-800",
  "bg-violet-200 text-violet-800",
  "bg-sky-200 text-sky-800",
  "bg-emerald-200 text-emerald-800",
  "bg-amber-200 text-amber-800",
  "bg-rose-200 text-rose-800",
  "bg-cyan-200 text-cyan-800",
  "bg-indigo-200 text-indigo-800",
  "bg-lime-200 text-lime-800",
  "bg-fuchsia-200 text-fuchsia-800",
  "bg-orange-200 text-orange-800",
  "bg-teal-200 text-teal-800",
  "bg-purple-200 text-purple-800",
  "bg-blue-200 text-blue-800",
];

const getTagColor = (tag: string): string => {
  const normalized = tag.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tagPalette[Math.abs(hash) % tagPalette.length];
};

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    "to-do": "bg-pink-200 text-pink-800",
    "in progress": "bg-amber-200 text-amber-800",
    active: "bg-green-200 text-green-800",
    complete: "bg-blue-200 text-blue-800",
    "on hold": "bg-orange-200 text-orange-800",
    archived: "bg-stone-200 text-stone-800",
  };

  const normalized = status.toLowerCase().trim();
  return statusColors[normalized] || "bg-gray-200 text-gray-800";
};

export const ProjectsWindow = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const projects = useMemo(() => parseProjects(), []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter(project =>
      Object.values(project).some(value =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField].toLowerCase();
        const bVal = b[sortField].toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [projects, searchQuery, sortField, sortOrder]);

  return (
    <div className="flex flex-col h-full gap-3 overflow-y-auto relative">
      {/* Search */}
      <div className="flex justify-end flex-shrink-0 relative z-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="win95-border-inset bg-input px-3 py-1 text-sm w-1/3"
          placeholder="search..."
        />
      </div>

      {/* Projects table */}
      <div className="win95-border-inset bg-white p-2 overflow-y-auto flex-1 min-h-0 relative z-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-bold">Name</th>
              <th className="text-left py-2 px-2 font-bold">Description</th>
              <th className="text-left py-2 px-2 font-bold">Status</th>
              <th className="text-left py-2 px-2 font-bold">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted-foreground">
                  No projects found
                </td>
              </tr>
            ) : (
              filteredAndSortedProjects.map((project, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-accent/10">
                  <td className="py-2 px-2 font-medium">{project.Name}</td>
                  <td className="py-2 px-2">{project.Description}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.Status)}`}
                    >
                      {project.Status}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    {project.Tags.split(';').map((tag, i) => (
                      <span
                        key={i}
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-1 mb-1 ${getTagColor(tag.trim())}`}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
