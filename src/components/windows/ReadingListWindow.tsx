import { useState, useMemo } from "react";
import { parseBooks, type Book } from "@/data/books";

type SortField = keyof Book;
type SortOrder = "asc" | "desc";

// Helper function to get color for book types
const getTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    // Genre colors
    fiction: "bg-pink-200 text-pink-800",
    "sci-fi": "bg-purple-200 text-purple-800",
    poetry: "bg-rose-200 text-rose-800",
    comics: "bg-yellow-200 text-yellow-800",
    biography: "bg-orange-200 text-orange-800",
    autobiography: "bg-orange-100 text-orange-700",

    // Academic subjects
    philosophy: "bg-indigo-200 text-indigo-800",
    math: "bg-blue-200 text-blue-800",
    physics: "bg-cyan-200 text-cyan-800",
    biology: "bg-green-200 text-green-800",
    neuroscience: "bg-teal-200 text-teal-800",
    psychology: "bg-violet-200 text-violet-800",
    "computer-science": "bg-slate-200 text-slate-800",
    history: "bg-amber-200 text-amber-800",
    economics: "bg-emerald-200 text-emerald-800",
    anthropology: "bg-lime-200 text-lime-800",

    // Spiritual/Religious
    buddhism: "bg-yellow-100 text-yellow-700",
    christianity: "bg-blue-100 text-blue-700",
    islam: "bg-green-100 text-green-700",
    hinduism: "bg-orange-100 text-orange-700",
    magic: "bg-purple-100 text-purple-700",

    // Other categories
    art: "bg-fuchsia-200 text-fuchsia-800",
    games: "bg-red-200 text-red-800",
    education: "bg-sky-200 text-sky-800",
    governance: "bg-stone-200 text-stone-800",
    anarchism: "bg-red-300 text-red-900",
    climate: "bg-green-300 text-green-900",
    drugs: "bg-purple-300 text-purple-900",
  };

  const normalizedType = type.toLowerCase().trim();
  return typeColors[normalizedType] || "bg-gray-200 text-gray-800";
};

// Helper function to get color for status
const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    "read": "bg-green-200 text-green-800",
    "reading": "bg-blue-200 text-blue-800",
    "want to read": "bg-amber-200 text-amber-800",
    "stalled": "bg-gray-200 text-gray-800",
    "abandoned": "bg-red-200 text-red-800",
    "reference": "bg-purple-200 text-purple-800",
  };

  const normalizedStatus = status.toLowerCase().trim();
  return statusColors[normalizedStatus] || "bg-gray-200 text-gray-800";
};

export const ReadingListWindow = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookName, setBookName] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const books = useMemo(() => parseBooks(), []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedBooks = useMemo(() => {
    let result = books.filter(book =>
      Object.values(book).some(value =>
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
  }, [books, searchQuery, sortField, sortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName.trim()) return;

    setSubmitStatus("loading");

    try {
      const response = await fetch("https://formspree.io/f/xjvndedd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookName: bookName,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setBookName("");
        // Reset success message after 3 seconds
        setTimeout(() => setSubmitStatus("idle"), 3000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Recommend a book form */}
      <div className="win95-border bg-muted p-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center flex-wrap">
          <label htmlFor="bookName" className="text-sm font-bold">
            Recommend a book:
          </label>
          <input
            type="text"
            id="bookName"
            name="bookName"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="win95-border-inset bg-input px-2 py-1 text-sm flex-1 min-w-[200px]"
            placeholder="type..."
            disabled={submitStatus === "loading"}
          />
          <button
            type="submit"
            className="win95-border bg-card hover:bg-muted px-3 py-1 text-sm font-bold active:win95-border-inset disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitStatus === "loading"}
          >
            {submitStatus === "loading" ? "sending..." : "send"}
          </button>
        </form>
        {submitStatus === "success" && (
          <div className="mt-2 text-sm text-green-700 bg-green-100 border border-green-300 px-2 py-1 rounded">
            Thank you! Your book recommendation has been sent.
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mt-2 text-sm text-red-700 bg-red-100 border border-red-300 px-2 py-1 rounded">
            Oops! Something went wrong. Please try again.
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex justify-end flex-shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="win95-border-inset bg-input px-3 py-1 text-sm w-1/3"
          placeholder="search..."
        />
      </div>

      {/* Books table */}
      <div className="win95-border-inset bg-white p-2 overflow-y-auto flex-1 min-h-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-bold">
                Name{" "}
                <span className="cursor-pointer" onClick={() => handleSort("Name")}>
                  ↑
                </span>
                <span className="cursor-pointer" onClick={() => handleSort("Name")}>
                  ↓
                </span>
              </th>
              <th className="text-left py-2 px-2 font-bold">
                Status{" "}
                <span className="cursor-pointer" onClick={() => handleSort("Status")}>
                  ↑
                </span>
                <span className="cursor-pointer" onClick={() => handleSort("Status")}>
                  ↓
                </span>
              </th>
              <th className="text-left py-2 px-2 font-bold">
                Type{" "}
                <span className="cursor-pointer" onClick={() => handleSort("Type")}>
                  ↑
                </span>
                <span className="cursor-pointer" onClick={() => handleSort("Type")}>
                  ↓
                </span>
              </th>
              <th className="text-left py-2 px-2 font-bold">Author</th>
              <th className="text-left py-2 px-2 font-bold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBooks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted-foreground">
                  No books found
                </td>
              </tr>
            ) : (
              filteredAndSortedBooks.map((book, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-accent/10">
                  <td className="py-2 px-2">{book.Name}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-1 mb-1 ${getStatusColor(book.Status)}`}
                    >
                      {book.Status}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    {book.Type.split(';').map((type, i) => (
                      <span
                        key={i}
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-1 mb-1 ${getTypeColor(type.trim())}`}
                      >
                        {type.trim()}
                      </span>
                    ))}
                  </td>
                  <td className="py-2 px-2">{book.Author}</td>
                  <td className="py-2 px-2">{book.Notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
