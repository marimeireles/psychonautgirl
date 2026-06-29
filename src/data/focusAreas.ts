export interface FocusAreaLink {
  label: string;
  url: string;
}

export interface ResearchCard {
  caption: string;
  image?: string;
  summary?: string;
  links: FocusAreaLink[];
  tags: string[];
}

export interface FocusArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const focusAreas: FocusArea[] = [
  {
    id: "cooperation",
    name: "Cooperation and Theoretical Evolutionary Biology",
    icon: "🤝",
    color: "#8B5CF6",
    description:
      "Cooperation seems to be foundational in the development and complexification of life. Cooperative systems seem to thrive to the extent that their members recognize themselves as part of the whole. One can notice this at the cellular scale, where the extreme of such recognition is symbiogenesis. However the same pattern appears at more levels: in well-adjusted organizations or among thriving communities with pro-social members, the degree to which individuals see themselves as taking part in the benefit of the whole seems central to their success. To me this notion extends across systems and institutions, being at the heart of how we interact with one another and the extent to which we cultivate compassion and come closer to understand our place in the whole. Though not always central to my work, fostering cooperation among living beings and intelligent collective structures is at the heart of it.",
  },
  {
    id: "theoretical-neuroscience",
    name: "Theoretical Neuroscience",
    icon: "🧠",
    color: "#EC4899",
    description:
      "I'm interested in applying neuroscience methods to study and understand artificial neural networks, as I believe they're an extremely useful model to understand the development of higher-order intelligence and behavior. Using information-theoretic measures of synergy and tools from causal emergence, I intend to characterize how these systems grow in complexity. My conjecture (largely borrowed from the Biological Arrow of Time) is that these Turing-jumps are what allow a system to overcome otherwise insurmountable barriers of knowledge and break through the intrinsic limits that Gödelian undecidability exposes.",
  },
  {
    id: "complex-systems",
    name: "Complex Systems",
    icon: "🕸️",
    color: "#F59E0B",
    description:
      "I'm interested in complex systems insofar as they describe the underlying mathematics of life. I'm drawn in particular to edge-of-chaos behavior in learning, and especially in cooperation: when does learning actually happen, and can these transition functions be understood as Turing-jumps? In the past I've analyzed the dynamics of cooperation among heterogeneous RL agents in simple general-sum games. My main interest now lies in the realm of synchrony. I've recently used the HKB (Haken–Kelso–Bunz) equations and CFE (Collective Forecasting Error) to model phase-coupling between LLM agents in social dilemmas, shaping a coordination dynamics in a RLVR environment that helps them cooperate more robustly with one another in general settings.",
  },
  {
    id: "ethics",
    name: "Ethics and Phenomenology",
    icon: "⚖️",
    color: "#A855F7",
    description:
      "Phenomenology and moral theory are inseparable: as the former informs what it means to be in the world, the latter how one ought to be. I'm broadly drawn to the wisdom traditions, and favor virtue ethics above all other schools. In the context of AI research, I believe these are the areas most worth mastering by those working at the technology's frontier.",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    icon: "🔒",
    color: "#2496ED",
    description:
      "As AI agents pervasivaly move through our digital and analog lives, I worry about what happens to privacy, security, and the shared commons of the web. Therefore, I'm interested in building defenses for that future. Collaborating with Mozilla, I'm developing open, interoperable protocols for a web where AI agents can operate safely, and methods to mitigate prompt injection and data leakage in agentic browsers. This means pairing foundation models with non-ML symbolic components and native web standards, so an agent can be genuinely useful without users having to trust it with their secrets by default. I also help build open-source infrastructure for testing these systems rigorously before they reach real users.",
  },
  {
    id: "democracy",
    name: "Democracy",
    icon: "🗳️",
    color: "#14B8A6",
    description:
      "AI could help us build a freer, more just world, mirroring ancient anarchist traditions, but now scaled across the whole of it. Or it could become the most complete instrument of subjugation ever made. I want my work to serve the former.This work is inspired by sheaves and probabilistic dependency graphs to distinguish shallow consensus from genuine convergence, making the landscape of disagreement legible while leaving the synthesis itself in human hands. Scaling democracy should not mean scaling the production of consensus, but scaling the legibility of disagreement.",
  },
];

// Flat list of all research cards. `tags` lists the focus-area ids this card
// should appear under — a card can have multiple tags to show in multiple
// focus area windows.
export const researchCards: ResearchCard[] = [
  {
    caption: "The Influence of Scaffolds on Coordination Scaling Laws in LLM Agents",
    // image: "https://raw.githubusercontent.com/marimeireles/psychonautgirl/master/images/Collab_overcooked_env.png",
    // summary: "Short blurb — venue, focus, etc.",
    links: [
      {
        label: "Poster",
        url: "https://docs.google.com/presentation/d/1sONqwAGmN1d8xspgUHmqgTEzmHyDh1j16zNTEWB6z3E/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168",
      },
      {
        label: "Paper",
        url: "https://openreview.net/pdf?id=E9whrbtgUA",
      },
    ],
    tags: ["cooperation"],
  },
  {
    caption: "Synergistic organisation in large language models",
    // image: "https://i.imgur.com/oRZ788J.png",
    links: [
      {
        label: "Poster",
        url: "https://docs.google.com/presentation/d/1EVvv3vadOcvRphoX2rXmXPZ-C6omAOlZbLuYF__XuTU/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168",
      },
    ],
    tags: ["theoretical-neuroscience"],
  },
  {
    caption: "Deliberation beyond shallow consensus",
    // image: "https://i.imgur.com/oRZ788J.png",
    links: [
      {
        label: "Research agenda",
        url: "https://docs.google.com/document/d/1Ax2jLREn0p7dRd-rjSA43ieDvubL0kMDpmnm3H4sqZ8/edit?tab=t.0",
      },
    ],
    tags: ["democracy"],
  },
  {
    caption: "Toward collective intelligence: evolutionary pressures for cooperation among language models",
    // image: "",
    // summary: "Short blurb — venue, focus, etc.",
    links: [
      { label: "Paper (WIP)", url: "https://..." },
      {
        label: "Poster",
        url: "https://docs.google.com/presentation/d/1zWLlQwXBzwCVEY8UFYCmLxaLEG9RzTfwsD_UsSqzpsc/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168",
      },
    ],
    tags: ["complex-systems", "cooperation"],
  },
  {
    caption: "The Edge of Cooperation",
    // image: "https://i.imgur.com/UTI3xbF.jpeg",
    links: [
      {
        label: "Presentation",
        url: "https://docs.google.com/presentation/d/116e8PSrHBYI6iv6EWcn3nhtltfuvmSeg9uRgLRzCU-k/edit?slide=id.p#slide=id.pa",
      },
    ],
    tags: ["complex-systems", "cooperation"],
  },
  {
    caption: "From the Wild Web to the Zoo: Benchmarking Web Agents with a Realistic Simulator",
    image: "",
    links: [
      {
        label: "Paper",
        url: "https://openreview.net/pdf?id=XPV8VrLw14",
      },
      {
        label: "Poster",
        url: "https://docs.google.com/presentation/d/1MqvMDw-nVAXcT1YUAP8NAzEz44lK-LMVS7DPrXXb4y8/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168",
      },
      {
        label: "Code",
        url: "https://github.com/bgrins/the_zoo",
      },
      {
        label: "Website",
        url: "https://zoo-eval.github.io/zoo_website/",
      },
    ],
    tags: ["cybersecurity"],
  },
  {
    caption: "A Realistic Environment for Evaluating Web Agents",
    image: "",
    links: [
      {
        label: "Paper",
        url: "https://camallen.net/files/zoo_madweb.pdf",
      },
      {
        label: "Code",
        url: "https://github.com/bgrins/the_zoo",
      },
    ],
    tags: ["cybersecurity"],
  },
  {
    caption: "Symbolic AI and Native Web Standards Solutions for Safe Agentic Browser",
    image: "",
    links: [
      {
        label: "Paper (WIP)",
        url: "",
      },
    ],
    tags: ["cybersecurity"],
  },
  {
    caption: "Alignment Through Being",
    // image: "https://substackcdn.com/image/fetch/$s_!U0RE!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc96df73d-0bfb-4ca3-8995-90ef0f82ebf0_3840x2959.jpeg",
    links: [
      {
        label: "Blog",
        url: "https://aretetelos.substack.com/p/alignment-through-being",
      },
    ],
    tags: ["ethics"],
  },
  {
    caption: "Observability, Memory, and the Dynamics of Cooperation in\\ Heterogeneous Multi-Agent Reinforcement Learning",
    // image: "https://substackcdn.com/image/fetch/$s_!U0RE!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc96df73d-0bfb-4ca3-8995-90ef0f82ebf0_3840x2959.jpeg",
    links: [
      {
        label: "Paper",
        url: "https://drive.google.com/file/d/1NlT456TDFa_XjDUQdAL652CUonrThKgx/view?usp=sharing",
      },
    ],
    tags: ["complex-systems", "cooperation"],
  },
];

export const getFocusArea = (id: string): FocusArea | undefined =>
  focusAreas.find((area) => area.id === id);

export const getCardsForFocusArea = (areaId: string): ResearchCard[] =>
  researchCards.filter((card) => card.tags.includes(areaId));
