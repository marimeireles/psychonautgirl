import { useState } from "react";

export const ReadingListWindow = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookName, setBookName] = useState("");

  // Sample books data - replace with your actual books.js data
  const books = [
    { name: "Example Book 1", status: "Reading", type: "Fiction", author: "Author Name", notes: "Great read!" },
    { name: "Example Book 2", status: "Completed", type: "Non-Fiction", author: "Another Author", notes: "Very informative" },
  ];

  const filteredBooks = books.filter(book =>
    Object.values(book).some(value =>
      value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName.trim()) return;
    // Handle book recommendation submission
    console.log("Recommended book:", bookName);
    setBookName("");
  };

  return (
    <div className="space-y-3">
      {/* Recommend a book form */}
      <div className="win95-border bg-muted p-3">
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
          />
          <button
            type="submit"
            className="win95-border bg-card hover:bg-muted px-3 py-1 text-sm font-bold active:win95-border-inset"
          >
            send
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="win95-border-inset bg-input px-3 py-1 text-sm w-1/3"
          placeholder="search..."
        />
      </div>

      {/* Books table */}
      <div className="win95-border-inset bg-white p-2 max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-bold">Name</th>
              <th className="text-left py-2 px-2 font-bold">Status</th>
              <th className="text-left py-2 px-2 font-bold">Type</th>
              <th className="text-left py-2 px-2 font-bold">Author</th>
              <th className="text-left py-2 px-2 font-bold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted-foreground">
                  No books found
                </td>
              </tr>
            ) : (
              filteredBooks.map((book, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-accent/10">
                  <td className="py-2 px-2">{book.name}</td>
                  <td className="py-2 px-2">{book.status}</td>
                  <td className="py-2 px-2">{book.type}</td>
                  <td className="py-2 px-2">{book.author}</td>
                  <td className="py-2 px-2">{book.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
