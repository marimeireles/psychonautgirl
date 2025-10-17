export const GalleryWindow: React.FC = () => {
  const links = {
    behance: "https://www.behance.net/marianameireles",
    deviantart: "https://www.deviantart.com/marimeireles/gallery",
    toes: "https://github.com/marimeireles/touchdesigner-toes/tree/master",
  } as const;

  const artPieces = [
    {
      id: 1,
      title: "Tattoo Art",
      description: "",
      color: "bg-gradient-to-br from-orange-400 to-pink-500",
      url: links.deviantart,
    },
    {
      id: 2,
      title: "VJ",
      description: "",
      color: "bg-gradient-to-br from-blue-400 to-cyan-300",
      url: links.toes,
    },
    // {
    //   id: 3,
    //   title: "VJ",
    //   description: "",
    //   color: "bg-gradient-to-br from-green-600 to-emerald-400",
    //   url: links.toes,
    // },
    // {
    //   id: 4,
    //   title: "Starry Night",
    //   description: "Digital art",
    //   color: "bg-gradient-to-br from-purple-900 to-indigo-600",
    //   url: links.behance, // duplicate intentionally; adjust if you want a different mapping
    // },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="win95-border bg-muted p-2 text-sm font-bold flex items-center justify-between">
        <span>🎨 My Art Gallery</span>
{/*        <nav className="flex gap-3 text-xs font-normal">
          <a
            href={links.behance}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Behance
          </a>
          <a
            href={links.deviantart}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            DeviantArt
          </a>
          <a
            href={links.toes}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            TOES
          </a>
        </nav>*/}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {artPieces.map((piece) => (
          <a
            key={piece.id}
            href={piece.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${piece.title} — opens external link`}
            className="win95-border bg-white p-2 hover:bg-muted/50 cursor-pointer group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <div
              className={`${piece.color} w-full h-24 win95-border-inset mb-2 transition-transform group-hover:scale-105`}
            />
            <div className="text-xs">
              <p className="font-bold underline group-hover:no-underline">{piece.title}</p>
              <p className="text-muted-foreground">{piece.description || "\u00A0"}</p>
            </div>
          </a>
        ))}
      </div>

    </div>
  );
};
