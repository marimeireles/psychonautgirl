export const GalleryWindow = () => {
  const artPieces = [
    { id: 1, title: "Sunset Dreams", description: "Digital painting", color: "bg-gradient-to-br from-orange-400 to-pink-500" },
    { id: 2, title: "Ocean Waves", description: "Watercolor", color: "bg-gradient-to-br from-blue-400 to-cyan-300" },
    { id: 3, title: "Forest Path", description: "Acrylic on canvas", color: "bg-gradient-to-br from-green-600 to-emerald-400" },
    { id: 4, title: "Starry Night", description: "Digital art", color: "bg-gradient-to-br from-purple-900 to-indigo-600" },
  ];

  return (
    <div className="space-y-3">
      <div className="win95-border bg-muted p-2 text-sm font-bold">
        🎨 My Art Gallery
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {artPieces.map((piece) => (
          <div key={piece.id} className="win95-border bg-white p-2 hover:bg-muted/50 cursor-pointer group">
            <div className={`${piece.color} w-full h-24 win95-border-inset mb-2 transition-transform group-hover:scale-105`} />
            <div className="text-xs">
              <p className="font-bold">{piece.title}</p>
              <p className="text-muted-foreground">{piece.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="win95-border-inset bg-white p-2 text-xs text-muted-foreground">
        Click on any piece to view details (coming soon!)
      </div>
    </div>
  );
};
