import { Github, Linkedin, Mail, Video, FileText, BookOpen } from "lucide-react";

export const AboutWindow = () => {
  return (
    <div className="win95-border-inset bg-white p-4 space-y-4 overflow-y-auto h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Mariana Meireles
        </h2>
      </div>

      <div className="win95-border bg-muted p-3 space-y-3 text-sm">
        <p>
          I strive to live poetically, compassionately and fearlessly.
        </p>
        <p>
          In my career, the ideal expression of this is to broadly improve the lives of all beings.
        </p>
        <p>
          Previously, I worked with software in the open-source and open-science ecosystems, contributing to projects like Firefox, Jupyter Notebooks, and Conda.
        </p>
        <p>
          As a researcher, I've worked at CHAI at UC Berkeley, the Max Planck and at the University of Bonn.
        </p>
      </div>

      <div className="win95-border bg-card p-3">
        <h3 className="font-bold text-sm mb-2">Connect</h3>
        <div className="grid grid-cols-2 gap-2">
          <a href="https://github.com/marimeireles/" target="_blank" rel="noopener noreferrer"
             className="win95-border bg-muted hover:bg-muted-foreground/10 p-2 flex items-center gap-2 text-xs">
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/mariana-meireles/" target="_blank" rel="noopener noreferrer"
             className="win95-border bg-muted hover:bg-muted-foreground/10 p-2 flex items-center gap-2 text-xs">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </a>
          <a href="mailto:marianameireles@protonmail.com"
             className="win95-border bg-muted hover:bg-muted-foreground/10 p-2 flex items-center gap-2 text-xs">
            <Mail className="w-4 h-4" />
            Email
          </a>
          <a href="https://calendar.app.google/TxR1iiyEriso6AqL9" target="_blank" rel="noopener noreferrer"
             className="win95-border bg-muted hover:bg-muted-foreground/10 p-2 flex items-center gap-2 text-xs">
            <Video className="w-4 h-4" />
            Book a Call
          </a>
        </div>
      </div>

      <div className="win95-border bg-card p-3">
        <h3 className="font-bold text-sm mb-2">Links</h3>
        <div className="space-y-1">
          <a href="https://marimeireles.com/cv.pdf" target="_blank" rel="noopener noreferrer"
             className="block text-xs text-primary hover:underline">
            <FileText className="w-3 h-3 inline mr-1" />
            CV
          </a>
        </div>
      </div>

    </div>
  );
};
