// ML researcher interview prep: topic checklists, grouped the way the prep notes group them.
// Progress is stored in ukiepc_progress under the key `ml:<section-id>:<topic-slug>`.
// The slug comes from the title, so renaming a topic loses its check — tweak wording with care.
// ⭐ important = the themes to prioritise. Links point into "How to Scale Your Model"
// (the JAX scaling book, https://jax-ml.github.io/scaling-book/) where a chapter is relevant.

export interface MlLink {
  label: string;
  url: string;
  /** full chapter title, shown as the link's tooltip */
  tip?: string;
}

export interface MlTopic {
  id: string;
  title: string;
  important?: boolean;
  links?: MlLink[];
}

export interface MlSection {
  id: string;
  name: string;
  blurb?: string;
  topics: MlTopic[];
}

// chapters of the JAX scaling book
const bookChapters: Record<number, { slug: string; title: string }> = {
  1: { slug: "roofline", title: "A Brief Intro to Roofline Analysis" },
  2: { slug: "tpus", title: "How to Think About TPUs" },
  3: { slug: "sharding", title: "Sharded Matrices and How to Multiply Them" },
  4: { slug: "transformers", title: "All the Transformer Math You Need to Know" },
  5: { slug: "training", title: "How to Parallelize a Transformer for Training" },
  6: { slug: "applied-training", title: "Training LLaMA 3 on TPUs" },
  7: { slug: "inference", title: "All About Transformer Inference" },
  9: { slug: "profiling", title: "How to Profile TPU Code" },
  10: { slug: "jax-stuff", title: "Programming TPUs in JAX" },
  12: { slug: "gpus", title: "How to Think About GPUs" },
};

const book = (n: number): MlLink => ({
  label: `book ch. ${n}`,
  url: `https://jax-ml.github.io/scaling-book/${bookChapters[n].slug}`,
  tip: `${bookChapters[n].title} — How to Scale Your Model`,
});

// chapters of Designing Machine Learning Systems (Chip Huyen), early-release PDF.
// `page` is each chapter's start page in that PDF; #page= makes the browser jump there.
export const dmlsPdfUrl = "https://18636251.s21i.faiusr.com/61/ABUIABA9GAAghIK0ugYowM2h3QY.pdf";
const dmlsChapters: Record<number, { page: number; title: string }> = {
  1: { page: 5, title: "Machine Learning Systems in Production" },
  2: { page: 54, title: "Data Engineering Fundamentals" },
  3: { page: 99, title: "Training Data" },
  4: { page: 143, title: "Feature Engineering" },
  5: { page: 172, title: "Model Development" },
  6: { page: 261, title: "Model Deployment" },
  7: { page: 317, title: "Why Machine Learning Systems Fail in Production" },
};

const dmls = (n: number): MlLink => ({
  label: `DMLS ch. ${n}`,
  url: `${dmlsPdfUrl}#page=${dmlsChapters[n].page}`,
  tip: `${dmlsChapters[n].title} — Designing Machine Learning Systems (Chip Huyen)`,
});

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type TopicInput = string | { title: string; important?: boolean; links?: MlLink[] };

const section = (id: string, name: string, titles: TopicInput[], blurb?: string): MlSection => ({
  id,
  name,
  blurb,
  topics: titles.map((t) => {
    const o = typeof t === "string" ? { title: t } : t;
    return { ...o, id: `ml:${id}:${slug(o.title)}` };
  }),
});

export const mlSections: MlSection[] = [
  section(
    "implement",
    "Implement from scratch",
    [
      { title: "Implement a transformer end-to-end", important: true },
      { title: "Implement causal, cross, and self attention", important: true },
      { title: "Implement flash attention", links: [book(4)] },
      { title: "Implement the attention backward pass", important: true, links: [book(4)] },
      "Implement an MLP forward and backward pass",
      { title: "Implement a simple training loop with SGD in PyTorch or JAX", links: [book(10)] },
    ],
    "The coding round: be able to write these with an empty editor and no imports beyond the framework.",
  ),
  section("llms", "LLMs", [
    { title: "Flash Attention", important: true, links: [book(4)] },
    "LoRA",
    "TransformerXL",
    "Griffin",
    "Perceiver",
    { title: "Scaling Laws", important: true, links: [book(4)] },
    { title: "Mixture of Experts", important: true },
    "LLM scaling factor",
    { title: "RoPE", important: true },
    "Sinusoidal embeddings",
    "Relative positional embeddings",
    "LLM vs RNN vs S4",
    "Tokenisation",
    { title: "Pretraining", important: true, links: [book(5), book(6)] },
    "Finetuning",
    { title: "RLHF", important: true },
    { title: "Decoding techniques", links: [book(7)] },
    { title: "Causal Attention", important: true },
    "Cross Attention",
  ]),
  section(
    "rl",
    "RL essentials",
    [
      "Markov Decision Process",
      "Markov Property",
      { title: "Bellman Equations", important: true },
      "Q-Learning / TD Learning",
      "Monte Carlo vs TD",
      { title: "Policy Gradient Theorem", important: true },
      "Actor Critic",
      { title: "PPO", important: true },
      "GRPO",
      { title: "DPO (Direct Preference Optimisation)", important: true },
      "On-Policy vs Off-Policy",
      "Exploration vs Exploitation Dilemma",
      "Credit Assignment Problem",
      "World Models / Dreamer",
    ],
    "Trimmed to the fundamentals since RL is not the focus for Paradigms of Intelligence. Shaved off: GAE, variance reduction, MuZero, AlphaGo, SAC, SARSA, importance sampling, model-based vs model-free, curriculum learning.",
  ),
  section("generative", "Generative models", [
    "GANs",
    { title: "VAEs and VAE ELBO", important: true },
    "Score Function",
    { title: "Diffusion Forward Process", important: true },
    { title: "Diffusion Reverse Process (DDIM / DDPM)", important: true },
    "Diffusion Forward / Reverse SDE",
    "Flow Matching ODE",
    "Classifier Free Guidance",
  ]),
  section("applied", "Applied ML", [
    { title: "Tensor Parallelism", important: true, links: [book(3), book(5)] },
    { title: "FSDP", important: true, links: [book(5)] },
    { title: "DDP", links: [book(5), dmls(5)] },
    { title: "Pipeline Parallelism", links: [book(5), dmls(5)] },
    { title: "Communication Primitives", links: [book(3), book(12)] },
    { title: "Mixed precision training", important: true, links: [book(2)] },
    { title: "Gradient checkpointing", important: true },
    "Gradient accumulation",
    { title: "Profiling", links: [book(1), book(9)] },
    "Gradient clipping",
    { title: "Numerical precision tricks", links: [dmls(6)] },
    "Exploding / vanishing gradients",
    "Floating point representation",
    { title: "JIT compiling", links: [book(10), dmls(6)] },
    { title: "JAX, PyTorch, TensorFlow", links: [book(10)] },
  ]),
  section("general", "General ML", [
    "Curse of dimensionality",
    "S4",
    "CNNs",
    "RNNs / LSTMs",
    "Autoencoders",
    "Gumbel-Softmax",
    "MLE vs MAP",
    "Newton's Method",
    "Linear Regression",
    "Activation Functions",
    "Loss Functions",
    "No Free Lunch Theorem",
    { title: "BatchNorm / LayerNorm / RMSNorm", important: true },
    "Variance and Covariance",
    { title: "Adam / AdamW / Adagrad", important: true },
    { title: "Bias-Variance Tradeoff", important: true },
    { title: "Backprop", important: true, links: [book(4)] },
    "Regularisation Methods",
    { title: "Unsupervised vs Supervised", links: [dmls(3)] },
    "Clustering Algorithms (e.g. k-means)",
    "K-Nearest Neighbours",
    "SVMs",
    { title: "Boosting", links: [dmls(5)] },
    { title: "Bagging", links: [dmls(5)] },
    "Decision Trees",
    { title: "Ensembles", links: [dmls(5)] },
    "Bayes Theorem",
    { title: "Precision / Recall / F1 / AUC-ROC", links: [dmls(5)] },
    { title: "KL Divergence", important: true },
    "Jensen-Shannon Divergence",
    "Weight initialisation",
    "Gradient Descent / SGD",
    "Overfitting / Underfitting",
    "Cross validation",
    { title: "Data Whitening", links: [dmls(4)] },
    "Convex functions",
    "Early Stopping",
    { title: "Domain Adaptation", links: [dmls(7)] },
    "Dimensionality Reduction",
    "Transfer Learning",
    "Few shot / Zero shot learning",
    "Second Order Methods",
    "Expectation",
    "Entropy",
    "PDF / PMF",
    "Confidence Intervals",
  ]),
  section("maths", "Linear algebra", [
    "Positive Semi-Definite",
    { title: "Jacobian", important: true },
    { title: "Eigenvectors / Eigenvalues", important: true },
    "Hessian",
    "Inverse of a matrix",
    "Dot product",
    "Null space / Image space",
    "Orthogonality",
    "Linear independence",
    "Singular matrices",
    "Rank / Span",
    "Determinant",
  ]),
];

export const mlTopicCount = mlSections.reduce((n, s) => n + s.topics.length, 0);
