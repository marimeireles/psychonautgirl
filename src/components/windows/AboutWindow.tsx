import { Github, Linkedin, Mail, Video, FileText, Sparkles } from "lucide-react";

export const AboutWindow = () => {
  return (
    <div className="win95-border-inset bg-white h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 win95-border-bottom">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Mariana Meireles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              I strive to live poetically, compassionately and fearlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-primary mb-4">About</h2>
          <div className="win95-border bg-muted p-4 space-y-3 text-sm">
            <p>
              In my career, the ideal expression of this is to broadly improve the lives of all beings.
            </p>
            <p>
              Previously, I worked with software in the open-source and open-science ecosystems, contributing to projects like Firefox, Jupyter Notebooks, and Conda.
            </p>
            <p>
              As a researcher, I've worked at CHAI (UC Berkeley), Jinesis (University of Toronto), the Max Planck Institute, and the Barfuss Lab (University of Bonn); my work has been supported by grants from Impact Academy and the Foresight Institute.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-4">Connect</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="https://github.com/marimeireles/" target="_blank" rel="noopener noreferrer"
               className="win95-border bg-card hover:bg-muted/50 p-3 flex items-center gap-3 text-sm transition-all duration-200">
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/mariana-meireles/" target="_blank" rel="noopener noreferrer"
               className="win95-border bg-card hover:bg-muted/50 p-3 flex items-center gap-3 text-sm transition-all duration-200">
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
            <a href="mailto:marianameireles@protonmail.com"
               className="win95-border bg-card hover:bg-muted/50 p-3 flex items-center gap-3 text-sm transition-all duration-200">
              <Mail className="w-5 h-5" />
              Email
            </a>
            <a href="https://calendar.app.google/TxR1iiyEriso6AqL9" target="_blank" rel="noopener noreferrer"
               className="win95-border bg-card hover:bg-muted/50 p-3 flex items-center gap-3 text-sm transition-all duration-200">
              <Video className="w-5 h-5" />
              Book a Call
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-4">Links</h2>
          <div className="space-y-2">
            <a href="https://marimeireles.com/cv.pdf" target="_blank" rel="noopener noreferrer"
               className="win95-border bg-card hover:bg-muted/50 p-3 flex items-center gap-3 text-sm transition-all duration-200 inline-flex">
              <FileText className="w-5 h-5" />
              CV
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
