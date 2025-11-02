"use client";

import React from "react";
import { ExternalLink, GraduationCap } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogleScholar, faOrcid, faDocker } from "@fortawesome/free-brands-svg-icons";
import { faBrain, faNetworkWired, faRobot } from "@fortawesome/free-solid-svg-icons";

// Small helper to robustly open external links in a new tab.
const openInNewTab = (url: string) => {
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) w.opener = null; // extra guard in some browsers
  } catch {
    // noop; if the popup is blocked, default anchor behavior remains a fallback
  }
};

// Reusable props for cards that act like links.
type LinkCardProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

/**
 * LinkCard:
 * - Uses an <a> for semantics/SEO.
 * - Stops propagation on mouse/touch so parents (drag/overlay) don't swallow the click.
 * - Calls window.open to guarantee a new tab even if default is prevented upstream.
 * - Supports middle-click via onAuxClick and keyboard (Enter/Space).
 */
const LinkCard = ({ href, className = "", children, ariaLabel }: LinkCardProps) => {
  const handleOpen = () => openInNewTab(href);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      draggable={false}
      className={className}
      // Prevent parent draggable/overlay handlers from canceling the click
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleOpen();
      }}
      onAuxClick={(e) => {
        // Support middle-click (mouse button 1)
        if (e.button === 1) {
          e.preventDefault();
          e.stopPropagation();
          handleOpen();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          handleOpen();
        }
      }}
    >
      {children}
    </a>
  );
};

export const AcademicWorkWindow = () => {
  const academicProfiles = [
    {
      name: "Google Scholar",
      description: "View all my publications and citations",
      url: "https://scholar.google.com/citations?user=oTW1oIEAAAAJ&hl=en",
      icon: faGoogleScholar,
      color: "#4285f4",
    },
    {
      name: "ORCID",
      description: "My ORCID researcher profile",
      url: "https://orcid.org/my-orcid?orcid=0000-0001-9227-9798",
      icon: faOrcid,
      color: "#a6ce39",
    },
  ];

  const academicRepos = [
    {
      name: "The Zoo",
      description: "Reproducible simulated web environment for LLM agent end-to-end testing",
      url: "https://github.com/bgrins/the_zoo",
      preview: "https://placehold.co/600x400/e0d5ff/6b5b95?text=The+Zoo",
      icon: faDocker,
      iconColor: "#2496ED",
    },
    {
      name: "Heterogeneous LLM Collab Overcooked",
      description: "Multi-agent LLM scaffolding for the Overcooked game environment",
      url: "https://github.com/marimeireles/Collab-Overcooked",
      preview: "https://placehold.co/600x400/e0d5ff/6b5b95?text=Collab+Overcooked",
      icon: faBrain,
      iconColor: "#8B5CF6",
    },
    {
      name: "pyCRLD with Heterogeneous Agents",
      description: "Multi-agent RL environments supporting heterogeneous agents through dynamic interactions",
      url: "https://github.com/marimeireles/MARL-mixed",
      preview: "https://placehold.co/600x400/e0d5ff/6b5b95?text=MARL+Mixed",
      icon: faNetworkWired,
      iconColor: "#10B981",
    },
    {
      name: "Conan meltingpot",
      description: "Multi-agent RL test suite with agent elimination mechanics in shared pool of resource games",
      url: "https://github.com/marimeireles/meltingpot",
      preview: "https://placehold.co/600x400/e0d5ff/6b5b95?text=Meltingpot",
      icon: faRobot,
      iconColor: "#F59E0B",
    },
  ];

  const ProfileCard = ({
    name,
    description,
    url,
    icon,
    color,
  }: {
    name: string;
    description: string;
    url: string;
    icon: any;
    color: string;
  }) => (
    <LinkCard
      href={url}
      ariaLabel={`${name} – ${description}`}
      className="win95-border bg-card hover:bg-muted/50 p-4 flex items-start justify-between gap-3 transition-all duration-200 block cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <FontAwesomeIcon icon={icon} className="text-2xl" style={{ color }} />
        </div>
        <div>
          <div className="text-base font-semibold hover:text-primary transition-colors">
            {name}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </LinkCard>
  );

  const ProjectCard = ({
    title,
    description,
    url,
    preview,
    icon,
    iconColor,
  }: {
    title: string;
    description: string;
    url: string;
    preview: string;
    icon?: any;
    iconColor?: string;
  }) => (
    <LinkCard
      href={url}
      ariaLabel={`${title} – ${description}`}
      className="win95-border bg-card hover:bg-muted/50 overflow-hidden max-w-[200px] transition-all duration-200 block cursor-pointer"
    >
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img src={preview} alt={title} className="w-full h-full object-cover pointer-events-none" />
        {icon && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <FontAwesomeIcon
              icon={icon}
              className="text-lg"
              style={{ color: iconColor || "#6b5b95" }}
            />
          </div>
        )}
      </div>
      <div className="pb-2 pt-1.5 px-2">
        <div className="text-sm font-semibold flex items-center justify-between">
          <span className="hover:text-primary transition-colors">{title}</span>
          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        </div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </LinkCard>
  );

  return (
    <div className="win95-border-inset bg-white h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 win95-border-bottom">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Academic Work</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Research, publications, and scholarly contributions
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Academic Profiles Section */}
        <section>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
            Academic Profiles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {academicProfiles.map((profile, index) => (
              <ProfileCard
                key={index}
                name={profile.name}
                description={profile.description}
                url={profile.url}
                icon={profile.icon}
                color={profile.color}
              />
            ))}
          </div>
        </section>

        {/* Academic Repositories */}
        <section>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
            Research Code & Projects
          </h2>
          <div className="flex flex-wrap gap-1">
            {academicRepos.map((repo, index) => (
              <ProjectCard
                key={index}
                title={repo.name}
                description={repo.description}
                url={repo.url}
                preview={repo.preview}
                icon={repo.icon}
                iconColor={repo.iconColor}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
