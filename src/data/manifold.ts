// Text of "Unraveling the Manifold of Intelligences", shown on /principles-of-intelligence.
//
// Tiny markup used inside paragraphs:
//   [[key]]         citation, rendered as the reference's label and linked to it
//   [[key|text]]    citation with custom link text
//   [[#id|text]]    link to another section of this page, by its id
//   *text*          emphasis
//   **text**        bold
//   {{text}}        a draft note to self (rendered dim; hidden when SHOW_DRAFT_NOTES is false)

export const SHOW_DRAFT_NOTES = true;

export interface ManifoldSection {
  id: string;
  title: string;
  /** subsections render with a smaller heading and no number */
  sub?: boolean;
  paragraphs: string[];
}

export const manifoldTitle = "Unraveling the Manifold of Intelligences";
export const manifoldAuthor = "Mariana Meireles";

// the PDF of the agenda (the file lives in trusty_links/ in this repo)
export const manifoldPdf =
  "https://raw.githubusercontent.com/marimeireles/psychonautgirl/master/trusty_links/agenda-manifold-int.pdf";

// listed under the "Inspiration" button at the top of the page
export const manifoldInspiration = [
  "Michael Levin",
  "The information theory community",
  "Prokopenko",
  "Heidegger",
  "Bergson",
  "Prigogine",
];

// shown before the first section; same markup as the paragraphs
export const manifoldSummary =
  "This agenda charts the space of possible intelligent systems, its aim is to comprise all forms of intelligence: from gene regulatory networks and regenerating flatworms to sorting algorithms and large language models. Intelligence here is defined as *the competency to navigate a problem space, reaching the same goal by different means*. We start from information theory and causal inference as formalizing tools, while recognizing that these methods are insufficient on their own, i.e. complexity and integration do not add up to intelligence, and a fixed causal structure cannot describe a system that reaches one goal by many paths. Therefore, we propose formalizing measures of **agency**, how much control a system has over its world, and **understanding**, how much of the structure of its world a system has been able to capture, within the rich framework of causality and complexity. To understand the method of \"becoming of intelligence\" we draw heavily on nonlinear dynamics and philosophy. From this perspective, the current scientific debate is focused on the wrong principles to describe intelligence, particularly those based on optimization. We aim to develop a theory in which intelligence is rooted in the coupling between a system and its environment, and with it a theory of AI safety that shapes and grows the behavior of systems rather than enforces it.";

export const manifoldSections: ManifoldSection[] = [
  {
    id: "motivation",
    title: "Motivation",
    paragraphs: [
      "This agenda aims to stay at the frontier of what may be the next large jump in AI capabilities. Several industry leaders now say that scaling current models will not be enough on its own and that one or two further breakthroughs on the scale of the transformer are still needed to reach AGI: Sam Altman ([[decoder2023]]; [[marcus2026]]), Demis Hassabis ([[axios2025]]), Ilya Sutskever ([[dwarkesh2025]]) and Yann LeCun ([[decoder2026]]). Foundational architectures of AI were largely shaped by neuroscience, e.g. the perceptron was proposed as a model of the brain ([[rosenblatt1958]]), Hopfield's recurrent networks ([[hopfield1982]]), convolutional networks ([[fukushima1980]]), etc. Though the biological substrate proved to be a fruitful means for the development of models of intelligence, we believe that there's a much more fundamental space to be explored in order to understand the underlying characteristics that make systems intelligent. Transformers are a great example of how moving away from biological systems yielded a better result for generalizing intelligence ([[vaswani2017]]).",
    ],
  },
  {
    id: "charting",
    title: "Charting the Space of Intelligent Systems",
    paragraphs: [
      "Rather than choosing between computational and biologically inspired approaches, we propose to chart the space of possible intelligent systems. In opposition to Penrose's theory that intelligence requires a mind or consciousness ([[penrose1994]]; [[penrose2022]]), we believe that it requires neither, though we do agree that understanding its principles calls for much broader explorations than the ones currently being considered. In order to conduct such explorations we intend to use tools from information theory and causal inference, as well as a myriad of tools from intersecting areas that are exploring what intelligence is in their own domain.",
      "In this context it is also important to define intelligence; here we use Levin's definition: *intelligence is competency in navigating a problem space, reaching the same goal by different means* ([[levin2022]]; [[fields2022]], after [[james1890]]). Intelligence is therefore a multi-dimensional spectrum. It might range from models of gene regulatory networks that learn by Pavlovian conditioning ([[biswas2021]]), to adult human airway cells that, with no genetic change, assemble themselves into moving bodies that help neural tissue repair ([[gumuskaya2024]]), to sorting algorithms that step away from their goal in order to get around a broken element ([[zhang2025]]), to the resolution of nearly 100-year-old problems through in silico computation ([[openai2026]]).",
    ],
  },
  {
    id: "information-theory",
    title: "Information-Theoretic Tools",
    paragraphs: [
      "To begin mapping the landscape we intend to use information-theoretic tools, though by its end this work will probably draw on many areas of knowledge, including ones not yet developed. We start with information theory because it offers a mathematical grounding for measuring complexification, the process by which biological intelligence developed ([[prokopenko2025]]). The main author of this agenda (Mariana Meireles) is currently working on the problem of defining the relationship between entropy and the development of capabilities within LLMs. Urbina-Rodriguez et al. ([[urbina2026|2026]]) show a relationship between model capability and synergy, the information that a set of units carries jointly but none of them carries alone ([[williams2010]]), the same kind of information processing that the brain relies on for complex cognition ([[luppi2022]]; [[proca2024]]). In work-in-progress, unpublished research she extended their result and found that the correlation also seems to hold at a neuron level of granularity. Though, as noted, we don't believe that intelligence is present only in biology or in silico, we use these substrata as convenient model organisms to explore the space of intelligence.",
    ],
  },
  {
    id: "limits-information-theory",
    title: "Limits of Information Theory",
    sub: true,
    paragraphs: [
      "Information theory on its own is clearly not enough of an explanation when defining intelligence. It lacks many nuances that are broadly contested, for example by the critics of the strong version of Integrated Information Theory (IIT) ([[aaronson2014]]; [[doerig2019]]). Even weak versions of IIT ([[mediano2022]]; [[barrett2026]]) do not address all the criticisms satisfactorily ([[leung2023]]). The reason is that information theory is intrinsically missing the tools to explain such a broad concept as intelligence.",
      "In biology and computation one has many examples of how complexification and integratedness don't explain the whole picture. Some extremely simple systems have very complex behavior. Rule 110, a one-dimensional cellular automaton defined by eight rules, can compute anything a Turing machine can ([[cook2004]]). Distilled models are another example of regression of complexity but maintenance of intelligence ([[hinton2015]]).",
      "We do not have a full answer to these limits. We hint that part of the solution might lie in a science of how agency and understanding develop, which we sketch in [[#agency-and-understanding|Section 5]].",
    ],
  },
  {
    id: "causal-inference",
    title: "Causal Inference",
    paragraphs: [
      "We believe that including causal inference in the exploration of intelligence is fundamental to this framework. We don't only want to have an abstract measurement of emergence, we also want to capture the observable effects of these capabilities in the world. Hoel & Levin ([[hoel2020|2020]]) have done this for gene regulatory networks and play an important inspirational role, as does Barnett's work, which shows that Granger causality is equivalent to transfer entropy for Gaussian variables ([[barnett2009]]) and uses related measures to identify emergent macroscopic processes ([[barnett2023]]), but we believe that the current state of the art is not enough.",
    ],
  },
  {
    id: "limits-causal-inference",
    title: "Limits of Causal Inference",
    sub: true,
    paragraphs: [
      "The current state of the art in causal inference assumes a fixed causal structure between variables ([[pearl2009]]). It is not well suited to systems that reach the same outcome through different paths, which is exactly our definition of intelligence. When many paths lead to the same goal, the paths then seem epiphenomenal, and intervening on the path a system happened to take tells us very little about the capability we observe. Biologists call this *degeneracy* ([[edelman2001]]). One example is so-called junk DNA. Ohno ([[ohno1972|1972]]) used the term for the large part of the genome that does not code for proteins and seemed to have no function. We now know that much of it is regulatory ([[encode2012]]), although how much is still debated ([[graur2013]]). Some of these non-coding regions are necessary for genes to be expressed where and when they should. Deleting elements of the junk or epiphenomenal DNA destroys capabilities we are able to observe ([[sagai2005]]). Here, promising research avenues are in the spirit of causal abstraction and causal emergence ([[beckers2019]]; [[geiger2025]]; [[hoel2013]]), which describe a system at a higher level where many different low-level paths count as the same cause, while taking into account the caution raised by Barnett & Seth ([[barnett2023|2023]]) about causal emergence: it compares a system against every state it could possibly be in, all treated as equally likely, and that artificial space can dwarf the contribution of what the system actually does.",
    ],
  },
  {
    id: "agency-and-understanding",
    title: "Agency and Understanding",
    paragraphs: [
      "Causal tools ask which path produced an outcome, and information-theoretic tools ask how integrated or complex a system is. As noted before, though important to the understanding of the full picture, these tools do not suffice to explain intelligence. One can build highly integrated, causally rich systems that are not intelligent.",
      "In this agenda, we seek new avenues to supply the missing pieces of what makes systems intelligent. One important clue is redundancy, or what stays the same across paths. Here the measure of redundancy given by information theory ([[williams2010]]) is again not enough, as it conflates two things: the redundancy of having many copies of the same answer, and the redundancy that leads to robustness. What we are interested in is the latter, of which the degeneracy introduced above is an example ([[edelman2001]]). For Levin, this robustness seems to be related to goal-directedness: his research shows again and again that living systems are not following a fixed sequence of steps but navigating towards a target, which they still reach from various starting points ([[levin2022]]).",
      "We propose two candidate quantities for what a robust system has. One is agency: how much control a system has over its world. Empowerment by ([[klyubin2005]]) might be the beginning of an answer to formalize agency as it has a meaningful relationship with the environment and redundancy.",
      "The other is important missing piece seems to be understanding, or how much of the structure of its world has a system been able to capture. Shannon information and Kolmogorov complexity ([[kolmogorov1965]]) do not serve well here, because neither was designed to measure the information in our world in a way that is meaningful for intelligence: both score pure noise highest, although there is nothing in it to learn. Epiplexity, the structural information a computationally bounded observer can extract from data ([[finzi2026]]), is one candidate measure, though it is defined for a passive observer of a fixed dataset and we do not yet know whether it carries over to systems that act and evolve over time.",
    ],
  },
  {
    id: "beyond-optimization",
    title: "Beyond Optimization",
    paragraphs: [
      "Finally, we are also wary of the optimization framing that has lately dominated scientific thinking. When talking about the development of intelligence one might think of gradient descent, or of theories such as the free energy principle ([[friston2010]]) and reward maximization ([[silver2021]]), which cast behavior as the minimization or maximization of a fixed objective.",
      "We do not build on these theories, which many others have criticized before us ([[aguilera2022]]; [[vamplew2022]]), because they do not seem to express fundamentals from which the complexity of life can be built. Living systems seem to us better described by exploration and by the ongoing construction of their own problem space than by convergence to an optimum. Here it is enlightening to look at the work of Harutyunyan, Dabney & Precup ([[harutyunyan2026|2026]]), who make a related argument within reinforcement learning: when the world is not Markovian, reward maximization alone does not explain actions that reorganize the agent's relation to its environment. They propose *coherence*, a coupling between agent and environment that makes goal-directed behavior possible and is not itself a means to reward.",
      "Where our definition of intelligence speaks of a goal, we therefore do not mean an objective to be maximized. We mean a coherent relation between a system and its environment, one that the system re-establishes by different means each time it is disturbed. We take from this that agency and understanding may be properties of the coupling between a system and its environment, not of the system alone. One formal step in this direction defines plasticity, how much the environment shapes the agent, with the same measure as empowerment but in the opposite direction, and shows that the two trade off ([[abel2025]]). Inspired by Prigogine ([[prigogine1980|1980]]) we believe that physics systems far from equilibrium offer an incredible opportunity to model the becoming.",
    ],
  },
  {
    id: "ai-safety",
    title: "Relevance to AI Safety",
    paragraphs: [
      "We see understanding the principles of intelligence as one of the most valuable moonshot projects for AI safety. Today we build systems whose capabilities we discover only after they appear, and we try to align them without knowing what it is that we are aligning. What we understand we can measure, and what we can measure we can change. If agency and understanding can be quantified, we can ask how much control a system has over its world, and how much of that world it has grasped, this would contribute to answering pressing questions about safety and AI welfare.",
      "This agenda also changes what safety might mean. Many of the failures that we currently explore are purely failures of optimization. If this is then the wrong way of looking at intelligence, it means we're defining alignment over the wrong assumptions. If alignment is better described as the coherence between a system and its environment, one that is re-established by different means each time it is disturbed, then alignment need not be a constraint imposed on theories of utility maximization.",
      "We aim to develop a theory of AI Safety in which intelligence is rooted in the coupling between a system and its environment, and with it a theory that shapes and grows the behavior of systems rather than enforces it.",
    ],
  },
];

export interface ManifoldRef {
  key: string;
  /** in-text label, e.g. "Rosenblatt 1958" */
  label: string;
  /** full entry; *text* is emphasis */
  text: string;
  url?: string;
}

export const manifoldRefs: ManifoldRef[] = [
  { key: "aaronson2014", label: "Aaronson 2014", text: "Aaronson, S. (2014). Why I am not an integrated information theorist (or, the unconscious expander). *Shtetl-Optimized* (blog).", url: "https://scottaaronson.blog/?p=1799" },
  { key: "abel2025", label: "Abel et al. 2025", text: "Abel, D., Bowling, M., Barreto, A., Dabney, W., Dong, S., Hansen, S., Harutyunyan, A., Khetarpal, C., Lyle, C., Pascanu, R., et al. (2025). Plasticity as the mirror of empowerment. arXiv:2505.10361 [preprint]." },
  { key: "aguilera2022", label: "Aguilera et al. 2022", text: "Aguilera, M., Millidge, B., Tschantz, A., & Buckley, C. L. (2022). How particular is the physics of the free energy principle? *Physics of Life Reviews*, 40, 24–50." },
  { key: "axios2025", label: "Axios 2025", text: "Axios (2025, 5 December). Transformative AI is coming, and so are the risks [M. Allen's interview with D. Hassabis, Axios AI+ SF Summit].", url: "https://www.axios.com/2025/12/05/ai-deepmind-hassabis-gemini" },
  { key: "barnett2009", label: "Barnett, Barrett & Seth 2009", text: "Barnett, L., Barrett, A. B., & Seth, A. K. (2009). Granger causality and transfer entropy are equivalent for Gaussian variables. *Physical Review Letters*, 103(23), 238701." },
  { key: "barnett2023", label: "Barnett & Seth 2023", text: "Barnett, L., & Seth, A. K. (2023). Dynamical independence: Discovering emergent macroscopic processes in complex dynamical systems. *Physical Review E*, 108(1), 014304." },
  { key: "barrett2026", label: "Barrett et al. 2026", text: "Barrett, A. B., Milinkovic, B., Mediano, P. A. M., Rosas, F. E., Bor, D., Barnett, L., & Seth, A. K. (2026). Integrated information theory: The good, the bad and the misunderstood. arXiv:2604.11482 [preprint]." },
  { key: "beckers2019", label: "Beckers & Halpern 2019", text: "Beckers, S., & Halpern, J. Y. (2019). Abstracting causal models. *Proceedings of the AAAI Conference on Artificial Intelligence*, 33(1), 2678–2685." },
  { key: "biswas2021", label: "Biswas et al. 2021", text: "Biswas, S., Manicka, S., Hoel, E., & Levin, M. (2021). Gene regulatory networks exhibit several kinds of memory: Quantification of memory in biological and random transcriptional networks. *iScience*, 24(3), 102131." },
  { key: "cook2004", label: "Cook 2004", text: "Cook, M. (2004). Universality in elementary cellular automata. *Complex Systems*, 15(1), 1–40." },
  { key: "doerig2019", label: "Doerig et al. 2019", text: "Doerig, A., Schurger, A., Hess, K., & Herzog, M. H. (2019). The unfolding argument: Why IIT and other causal structure theories cannot explain consciousness. *Consciousness and Cognition*, 72, 49–59." },
  { key: "dwarkesh2025", label: "Dwarkesh Podcast 2025", text: "Dwarkesh Podcast (2025, 25 November). Ilya Sutskever: We're moving from the age of scaling to the age of research [D. Patel's interview with I. Sutskever].", url: "https://www.dwarkesh.com" },
  { key: "edelman2001", label: "Edelman & Gally 2001", text: "Edelman, G. M., & Gally, J. A. (2001). Degeneracy and complexity in biological systems. *PNAS*, 98(24), 13763–13768." },
  { key: "encode2012", label: "ENCODE Project Consortium 2012", text: "ENCODE Project Consortium (2012). An integrated encyclopedia of DNA elements in the human genome. *Nature*, 489(7414), 57–74." },
  { key: "fields2022", label: "Fields & Levin 2022", text: "Fields, C., & Levin, M. (2022). Competency in navigating arbitrary spaces as an invariant for analyzing cognition in diverse embodiments. *Entropy*, 24(6), 819." },
  { key: "finzi2026", label: "Finzi et al. 2026", text: "Finzi, M., Qiu, S., Jiang, Y., Izmailov, P., Kolter, J. Z., & Wilson, A. G. (2026). From entropy to epiplexity: Rethinking information for computationally bounded intelligence. arXiv:2601.03220 [preprint]." },
  { key: "friston2010", label: "Friston 2010", text: "Friston, K. J. (2010). The free-energy principle: A unified brain theory? *Nature Reviews Neuroscience*, 11(2), 127–138." },
  { key: "fukushima1980", label: "Fukushima 1980", text: "Fukushima, K. (1980). Neocognitron: A self-organizing neural network model for a mechanism of pattern recognition unaffected by shift in position. *Biological Cybernetics*, 36(4), 193–202." },
  { key: "geiger2025", label: "Geiger et al. 2025", text: "Geiger, A., Ibeling, D., Zur, A., Chaudhary, M., Chauhan, S., Huang, J., Arora, A., Wu, Z., Goodman, N., Potts, C., & Icard, T. (2025). Causal abstraction: A theoretical foundation for mechanistic interpretability. *Journal of Machine Learning Research*, 26(83), 1–64." },
  { key: "graur2013", label: "Graur et al. 2013", text: "Graur, D., Zheng, Y., Price, N., Azevedo, R. B. R., Zufall, R. A., & Elhaik, E. (2013). On the immortality of television sets: “Function” in the human genome according to the evolution-free gospel of ENCODE. *Genome Biology and Evolution*, 5(3), 578–590." },
  { key: "gumuskaya2024", label: "Gumuskaya et al. 2024", text: "Gumuskaya, G., Srivastava, P., Cooper, B. G., Lesser, H., Semegran, B., Garnier, S., & Levin, M. (2024). Motile living biobots self-construct from adult human somatic progenitor seed cells. *Advanced Science*, 11(4), 2303575." },
  { key: "harutyunyan2026", label: "Harutyunyan, Dabney & Precup 2026", text: "Harutyunyan, A., Dabney, W., & Precup, D. (2026). Cohering reinforcement learning. *Reinforcement Learning Journal*." },
  { key: "hinton2015", label: "Hinton, Vinyals & Dean 2015", text: "Hinton, G., Vinyals, O., & Dean, J. (2015). Distilling the knowledge in a neural network. arXiv:1503.02531." },
  { key: "hoel2013", label: "Hoel, Albantakis & Tononi 2013", text: "Hoel, E. P., Albantakis, L., & Tononi, G. (2013). Quantifying causal emergence shows that macro can beat micro. *PNAS*, 110(49), 19790–19795." },
  { key: "hoel2020", label: "Hoel & Levin 2020", text: "Hoel, E., & Levin, M. (2020). Emergence of informative higher scales in biological systems: A computational toolkit for optimal prediction and control. *Communicative & Integrative Biology*, 13(1), 108–118." },
  { key: "hopfield1982", label: "Hopfield 1982", text: "Hopfield, J. J. (1982). Neural networks and physical systems with emergent collective computational abilities. *PNAS*, 79(8), 2554–2558." },
  { key: "james1890", label: "James 1890", text: "James, W. (1890). *The Principles of Psychology*. Henry Holt." },
  { key: "klyubin2005", label: "Klyubin, Polani & Nehaniv 2005", text: "Klyubin, A. S., Polani, D., & Nehaniv, C. L. (2005). Empowerment: A universal agent-centric measure of control. *2005 IEEE Congress on Evolutionary Computation*, 1, 128–135." },
  { key: "kolmogorov1965", label: "Kolmogorov 1965", text: "Kolmogorov, A. N. (1965). Three approaches to the quantitative definition of information. *Problems of Information Transmission*, 1(1), 1–7." },
  { key: "leung2023", label: "Leung & Tsuchiya 2023", text: "Leung, A., & Tsuchiya, N. (2023). Separating weak integrated information theory into inspired and aspirational approaches. *Neuroscience of Consciousness*, 2023(1), niad012." },
  { key: "levin2022", label: "Levin 2022", text: "Levin, M. (2022). Technological Approach to Mind Everywhere: An experimentally-grounded framework for understanding diverse bodies and minds. *Frontiers in Systems Neuroscience*, 16, 768201." },
  { key: "luppi2022", label: "Luppi et al. 2022", text: "Luppi, A. I., Mediano, P. A. M., Rosas, F. E., Holland, N., Fryer, T. D., O'Brien, J. T., Rowe, J. B., Menon, D. K., Bor, D., & Stamatakis, E. A. (2022). A synergistic core for human brain evolution and cognition. *Nature Neuroscience*, 25(6), 771–782." },
  { key: "marcus2026", label: "Marcus 2026", text: "Marcus, G. (2026, 16 March). Sam Altman concedes that we need major breakthroughs beyond mere scaling to get to AGI. *Marcus on AI* (Substack).", url: "https://garymarcus.substack.com/p/breaking-sam-altman-concedes-that" },
  { key: "mediano2022", label: "Mediano et al. 2022", text: "Mediano, P. A. M., Rosas, F. E., Bor, D., Seth, A. K., & Barrett, A. B. (2022). The strength of weak integrated information theory. *Trends in Cognitive Sciences*, 26(8), 646–655." },
  { key: "ohno1972", label: "Ohno 1972", text: "Ohno, S. (1972). So much “junk” DNA in our genome. *Brookhaven Symposia in Biology*, 23, 366–370." },
  { key: "openai2026", label: "OpenAI 2026", text: "OpenAI (2026, 8 September). On the Navier–Stokes Millennium Prize Problem.", url: "https://openai.com/index/navier-stokes-solution/" },
  { key: "pearl2009", label: "Pearl 2009", text: "Pearl, J. (2009). *Causality: Models, Reasoning, and Inference* (2nd ed.). Cambridge University Press." },
  { key: "penrose1994", label: "Penrose 1994", text: "Penrose, R. (1994). *Shadows of the Mind: A Search for the Missing Science of Consciousness*. Oxford University Press." },
  { key: "penrose2022", label: "Penrose 2022", text: "Penrose, R., Severino, E., et al. (2022). *Artificial Intelligence Versus Natural Intelligence* (F. Scardigli, Ed.). Springer." },
  { key: "prigogine1980", label: "Prigogine 1980", text: "Prigogine, I. (1980). *From Being to Becoming: Time and Complexity in the Physical Sciences*. W. H. Freeman." },
  { key: "proca2024", label: "Proca et al. 2024", text: "Proca, A. M., Rosas, F. E., Luppi, A. I., Bor, D., Crosby, M., & Mediano, P. A. M. (2024). Synergistic information supports modality integration and flexible learning in neural networks solving multiple tasks. *PLOS Computational Biology*, 20(6), e1012178." },
  { key: "prokopenko2025", label: "Prokopenko et al. 2025", text: "Prokopenko, M., Davies, P. C. W., Harré, M., Heisler, M. G., Kuncic, Z., Lewis, G. F., Livson, O., Lizier, J. T., & Rosas, F. E. (2025). Biological arrow of time: Emergence of tangled information hierarchies and self-modelling dynamics. *Journal of Physics: Complexity*, 6(1), 015006." },
  { key: "rosenblatt1958", label: "Rosenblatt 1958", text: "Rosenblatt, F. (1958). The perceptron: A probabilistic model for information storage and organization in the brain. *Psychological Review*, 65(6), 386–408." },
  { key: "sagai2005", label: "Sagai et al. 2005", text: "Sagai, T., Hosoya, M., Mizushina, Y., Tamura, M., & Shiroishi, T. (2005). Elimination of a long-range cis-regulatory module causes complete loss of limb-specific Shh expression and truncation of the mouse limb. *Development*, 132(4), 797–803." },
  { key: "silver2021", label: "Silver et al. 2021", text: "Silver, D., Singh, S., Precup, D., & Sutton, R. S. (2021). Reward is enough. *Artificial Intelligence*, 299, 103535." },
  { key: "decoder2023", label: "The Decoder 2023", text: "The Decoder (2023, 17 November). Sam Altman on AGI: Scaling large language models is not enough [M. Schreiner, on Altman's Cambridge Union Q&A].", url: "https://the-decoder.com/sam-altman-on-agi-scaling-large-language-models-is-not-enough/" },
  { key: "decoder2026", label: "The Decoder 2026", text: "The Decoder (2026, 3 January). “You certainly don't tell a researcher like me what to do,” says LeCun as he exits Meta for his own startup.", url: "https://the-decoder.com/you-certainly-dont-tell-a-researcher-like-me-what-to-do-says-lecun-as-he-exits-meta-for-his-own-startup/" },
  { key: "urbina2026", label: "Urbina-Rodriguez et al. 2026", text: "Urbina-Rodriguez, P., Fountas, Z., Rosas, F. E., Wang, J., Luppi, A. I., Bou-Ammar, H., Shanahan, M., & Mediano, P. A. M. (2026). A brain-like synergistic core in LLMs drives behaviour and learning. arXiv:2601.06851 [preprint]." },
  { key: "vamplew2022", label: "Vamplew et al. 2022", text: "Vamplew, P., Smith, B. J., Källström, J., Ramos, G., Rădulescu, R., Roijers, D. M., Hayes, C. F., Heintz, F., Mannion, P., Libin, P. J. K., et al. (2022). Scalar reward is not enough: A response to Silver, Singh, Precup and Sutton (2021). *Autonomous Agents and Multi-Agent Systems*, 36(2), 41." },
  { key: "vaswani2017", label: "Vaswani et al. 2017", text: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. *Advances in Neural Information Processing Systems*, 30." },
  { key: "williams2010", label: "Williams & Beer 2010", text: "Williams, P. L., & Beer, R. D. (2010). Nonnegative decomposition of multivariate information. arXiv:1004.2515." },
  { key: "zhang2025", label: "Zhang, Goldstein & Levin 2025", text: "Zhang, T., Goldstein, A., & Levin, M. (2025). Classical sorting algorithms as a model of morphogenesis: Self-sorting arrays reveal unexpected competencies in a minimal model of basal intelligence. *Adaptive Behavior*, 33(1), 25–54." },
];
