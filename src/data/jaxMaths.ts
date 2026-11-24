// JAX + maths-for-AI tracker: what you need from JAX to implement the ML-coding baseline
// (transformer, attention variants, flash attention, backward passes, SGD loop), the maths
// behind it, and the marimo notebooks in ~/dev/classes/maths that teach it.
// The LLM / RL / generative / general-ML topic lists already live on the Competitive
// Programming page (src/data/mlResearcher.ts), so they are not repeated here.
// Progress is stored in localStorage under `jax_done_<item-id>`.

export type JaxKind = "jax" | "build" | "maths" | "notebook";

export interface JaxItem {
  id: string;
  title: string;
  note?: string; // what "learned" means for this item
  url?: string;
  kind: JaxKind;
  key?: boolean; // the ones you cannot skip
}

export interface JaxSection {
  id: string;
  name: string;
  items: JaxItem[];
}

const jaxdoc = (p: string) => `https://docs.jax.dev/en/latest/${p}`;
const nb = (n: string, title: string, note: string): JaxItem => ({ id: `nb-${n}`, title, note, kind: "notebook" });

export const jaxSections: JaxSection[] = [
  {
    id: "notebooks",
    name: "0 · Your marimo notebooks (classes/maths)",
    items: [
      nb("2", "2_iterators_and_first_jax.py", "iterables, iterators, lambdas; first jnp arrays; conditions become masks"),
      nb("4", "4_matrix_equations_jax.py", "64-bit floats, matmul, vmap with in_axes, jnp.linalg, loops that fill arrays, inverses/determinants/rank"),
      nb("5", "5_probability_jax.py", "distributions as functions, sampling with explicit keys, estimating expectations and entropy, CDFs"),
      nb("6", "6_derivatives_autodiff_jax.py", "sympy vs autodiff, grad as an operator, several/vector inputs, vmap over grad"),
      nb("7", "7_optimisation_companion_jax.py", "building matrices from vectors, scipy solvers, gradient cross-sections, grids, the Hessian"),
    ],
  },
  {
    id: "jax-core",
    name: "1 · JAX core: the functional toolkit",
    items: [
      { id: "jnp", title: "jax.numpy arrays, dtypes, and the x64 flag", note: "jnp mirrors numpy; float32 by default; jax.config.update('jax_enable_x64', True) when you need doubles", url: jaxdoc("notebooks/thinking_in_jax.html"), kind: "jax", key: true },
      { id: "immutability", title: "Immutability and .at[idx].set() / .add()", note: "no in-place writes; functional updates return new arrays", url: jaxdoc("notebooks/Common_Gotchas_in_JAX.html"), kind: "jax", key: true },
      { id: "masks", title: "Masks instead of conditionals", note: "jnp.where and boolean arrays replace if/else inside traced code; the causal mask is just this", kind: "jax", key: true },
      { id: "jit", title: "jax.jit: tracing, static_argnums, shapes must be static", note: "understand what happens on first call, why Python ifs on traced values fail, when to mark args static", url: jaxdoc("jit-compilation.html"), kind: "jax", key: true },
      { id: "grad", title: "jax.grad / value_and_grad, argnums, has_aux", note: "gradient of a scalar loss w.r.t. a pytree of params; return the loss too; carry aux outputs", url: jaxdoc("automatic-differentiation.html"), kind: "jax", key: true },
      { id: "vmap", title: "jax.vmap with in_axes / out_axes, and nesting", note: "batch a per-example function; attention over heads = vmap over the head axis", url: jaxdoc("automatic-vectorization.html"), kind: "jax", key: true },
      { id: "random", title: "jax.random: PRNGKey, split, explicit keys everywhere", note: "no global RNG; split before every use; dropout and init take a key", url: jaxdoc("random-numbers.html"), kind: "jax", key: true },
      { id: "pytrees", title: "Pytrees: params as nested dicts, jax.tree.map", note: "SGD is one tree_map over (params, grads)", url: jaxdoc("working-with-pytrees.html"), kind: "jax", key: true },
      { id: "einsum", title: "jnp.einsum for attention and batched matmul", note: "write q·kᵀ as 'bhqd,bhkd->bhqk' without transposes", kind: "jax", key: true },
      { id: "scan", title: "lax.scan for loops with carries", note: "RNNs, autoregressive decoding, and stacking identical transformer layers without unrolling", url: jaxdoc("control-flow.html"), kind: "jax", key: true },
      { id: "cond-fori", title: "lax.cond / lax.fori_loop / lax.while_loop", note: "control flow that survives jit; know when a Python loop is fine (static trip count) and when it is not", url: jaxdoc("control-flow.html"), kind: "jax" },
      { id: "jacobians", title: "jacfwd / jacrev / jax.hessian", note: "forward vs reverse mode and when each is cheaper; the Hessian from the optimisation notebook", url: jaxdoc("automatic-differentiation.html"), kind: "jax" },
      { id: "custom-vjp", title: "jax.custom_vjp", note: "define your own backward pass; how you would wire a hand-written attention backward or flash-attention backward", url: jaxdoc("notebooks/Custom_derivative_rules_for_Python_code.html"), kind: "jax" },
      { id: "remat", title: "jax.checkpoint (remat) for gradient checkpointing", note: "trade recompute for memory on long sequences", url: jaxdoc("gradient-checkpointing.html"), kind: "jax" },
      { id: "dtypes-bf16", title: "bfloat16 / mixed precision and numerical stability", note: "softmax in float32, subtract the max, log-sum-exp; where bf16 bites", kind: "jax" },
      { id: "stop-gradient", title: "lax.stop_gradient", note: "target networks, straight-through estimators, Gumbel-softmax", kind: "jax" },
      { id: "debugging", title: "Debugging traced code: jax.debug.print, jax.disable_jit, shape errors", note: "read a tracer error and know what it means", url: jaxdoc("debugging/index.html"), kind: "jax" },
      { id: "optax", title: "optax: sgd, adam/adamw, clip_by_global_norm, apply_updates", note: "the standard optimiser library; also be able to write SGD and Adam by hand with tree_map", url: "https://optax.readthedocs.io/en/latest/", kind: "jax" },
      { id: "flax-nnx", title: "flax (nnx or linen) module basics, or pure functional params", note: "know one way to organise params; interviews accept pure dicts", url: "https://flax.readthedocs.io/en/latest/", kind: "jax" },
      { id: "sharding", title: "Sharding: jax.sharding, shard_map, pmap (legacy)", note: "how data/tensor/FSDP parallelism is expressed in JAX; the Scaling Book covers the why", url: jaxdoc("sharded-computation.html"), kind: "jax" },
      { id: "profiler", title: "jax.profiler and reading a trace", note: "where the time goes: compile vs compute vs transfer", url: jaxdoc("profiling.html"), kind: "jax" },
    ],
  },
  {
    id: "build",
    name: "2 · Build from scratch, in JAX, under time pressure",
    items: [
      { id: "b-mlp", title: "MLP forward and backward by hand", note: "manual chain rule for a 2-layer MLP, then check against jax.grad", kind: "build", key: true },
      { id: "b-sgd", title: "Training loop with SGD", note: "init with keys, loss fn, jit(value_and_grad), tree_map update, minibatches; MNIST or a toy regression", kind: "build", key: true },
      { id: "b-self-attn", title: "Self attention (single head, then multi-head with vmap)", note: "q/k/v projections, scaled dot product, softmax, output projection", kind: "build", key: true },
      { id: "b-causal", title: "Causal attention", note: "jnp.tril mask with -inf before softmax", kind: "build", key: true },
      { id: "b-cross", title: "Cross attention", note: "queries from one sequence, keys/values from another; where it sits in an encoder–decoder", kind: "build", key: true },
      { id: "b-transformer", title: "Transformer end-to-end", note: "token + positional embeddings (sinusoidal and RoPE), pre-LN blocks, residuals, MLP, lax.scan over layers, logits, greedy/sampling decode loop", kind: "build", key: true },
      { id: "b-attn-backward", title: "Attention backward pass by hand", note: "dV, dP, dS via softmax Jacobian, dQ, dK; wire it through custom_vjp and compare", kind: "build", key: true },
      { id: "b-flash", title: "Flash attention", note: "tiled online softmax with running max and sum; a lax.scan over KV blocks; then the backward with recomputation", url: "https://jax-ml.github.io/scaling-book/transformers/", kind: "build", key: true },
      { id: "b-layernorm", title: "LayerNorm / RMSNorm", note: "and why RMSNorm drops the mean", kind: "build" },
      { id: "b-lora", title: "LoRA", note: "low-rank A·B added to a frozen weight; freeze with stop_gradient or by excluding from the param tree", kind: "build" },
      { id: "b-kl", title: "Forward vs reverse KL between two Gaussians, in code", note: "mean-covering vs mode-seeking; the question from the guide that is worth never fumbling", kind: "build" },
      { id: "b-adam", title: "Adam / AdamW by hand", note: "moments, bias correction, decoupled weight decay, as a tree_map", kind: "build" },
      { id: "b-tensor-puzzles", title: "Tensor Puzzles (srush)", note: "broadcasting fluency without loops; also tracked on the Competitive Programming page", url: "https://github.com/srush/Tensor-Puzzles", kind: "build" },
      { id: "b-deepml", title: "DeepML problems (the good ones)", note: "pick the attention, normalisation and backprop problems; skip the filler", url: "https://www.deep-ml.com/problems", kind: "build" },
      { id: "b-debug", title: "Debugging a buggy training loop", note: "practise on your own old code: wrong axis in softmax, mask applied after softmax, lr too high, missing key split, shape silently broadcast", kind: "build" },
    ],
  },
  {
    id: "linalg",
    name: "3 · Linear algebra",
    items: [
      { id: "la-strang", title: "Gilbert Strang's MIT 18.06 lectures", note: "the whole course at 2× in a day, per the guide", url: "https://www.youtube.com/watch?v=7UJ4CFRGd-U&list=PLE7DDD91010BC51F8", kind: "maths", key: true },
      { id: "la-dot", title: "Dot product, norms, projections", note: "cosine similarity and why attention scores are dot products", kind: "maths", key: true },
      { id: "la-matmul", title: "Matrix products as compositions of linear maps", note: "shapes, associativity, cost of chained products", kind: "maths", key: true },
      { id: "la-independence", title: "Linear independence, span, rank", kind: "maths", key: true },
      { id: "la-null", title: "Null space and image (column space)", note: "rank–nullity", kind: "maths" },
      { id: "la-inverse", title: "Inverse of a matrix, singular matrices, determinant", note: "when a system has no / one / many solutions (notebook 4)", kind: "maths", key: true },
      { id: "la-orthogonality", title: "Orthogonality, orthonormal bases, QR", kind: "maths" },
      { id: "la-eigen", title: "Eigenvectors and eigenvalues", note: "diagonalisation, powers of a matrix, PCA", kind: "maths", key: true },
      { id: "la-psd", title: "Positive (semi-)definite matrices", note: "xᵀAx ≥ 0, covariance matrices, Hessians at minima", kind: "maths", key: true },
      { id: "la-svd", title: "SVD and low-rank approximation", note: "the maths behind LoRA", kind: "maths" },
      { id: "la-jacobian", title: "Jacobian", note: "the matrix of a vector-valued derivative; jacfwd/jacrev compute it", kind: "maths", key: true },
      { id: "la-hessian", title: "Hessian", note: "second derivatives, curvature, convexity test (optimisation notebook)", kind: "maths", key: true },
    ],
  },
  {
    id: "prob",
    name: "4 · Probability and information",
    items: [
      { id: "p-pdf", title: "PDF / PMF / CDF", note: "distributions as functions (notebook 5)", kind: "maths", key: true },
      { id: "p-expectation", title: "Expectation, variance, covariance", note: "estimate them from samples; Monte Carlo", kind: "maths", key: true },
      { id: "p-bayes", title: "Bayes' theorem, MLE vs MAP", note: "MAP = MLE + log prior; L2 regularisation as a Gaussian prior", kind: "maths", key: true },
      { id: "p-entropy", title: "Entropy and the maximum-entropy principle", note: "why the uniform / Gaussian / exponential are max-entropy under constraints (notebook 5)", kind: "maths", key: true },
      { id: "p-kl", title: "KL divergence: forward vs reverse", note: "mean-covering vs mode-seeking; cross-entropy = entropy + KL", kind: "maths", key: true },
      { id: "p-js", title: "Jensen–Shannon divergence", kind: "maths" },
      { id: "p-importance", title: "Importance sampling", note: "reweighting samples from the wrong distribution; off-policy RL", kind: "maths" },
      { id: "p-softmax", title: "Softmax as a Boltzmann distribution; temperature; log-sum-exp", kind: "maths", key: true },
      { id: "p-ci", title: "Confidence intervals and standard error", note: "reporting a benchmark number honestly", kind: "maths" },
      { id: "p-gumbel", title: "Gumbel-max trick and Gumbel-softmax", kind: "maths" },
    ],
  },
  {
    id: "calc",
    name: "5 · Calculus and optimisation",
    items: [
      { id: "c-chain", title: "Chain rule in vector form; backprop as reverse-mode autodiff", note: "why reverse mode is cheap for scalar losses with many params", kind: "maths", key: true },
      { id: "c-autodiff", title: "Automatic vs symbolic vs numerical differentiation", note: "notebook 6", kind: "maths", key: true },
      { id: "c-gd", title: "Gradient descent / SGD, learning rate, momentum", kind: "maths", key: true },
      { id: "c-adam", title: "Adam / AdamW / Adagrad: what each moment estimate does", kind: "maths", key: true },
      { id: "c-convex", title: "Convex functions, local vs global minima, saddle points", kind: "maths" },
      { id: "c-newton", title: "Newton's method and second-order methods", note: "why the Hessian is too expensive at scale; quasi-Newton", kind: "maths" },
      { id: "c-vanishing", title: "Exploding / vanishing gradients; gradient clipping", note: "and the role of residuals and normalisation", kind: "maths", key: true },
      { id: "c-init", title: "Weight initialisation (Xavier / He)", note: "keeping variance constant across layers", kind: "maths" },
      { id: "c-float", title: "Floating point: fp32 / bf16 / fp16, ulps, catastrophic cancellation", kind: "maths" },
      { id: "c-lagrange", title: "Lagrange multipliers and constrained optimisation", note: "the max-entropy derivations; optimisation companion", kind: "maths" },
    ],
  },
  {
    id: "scale",
    name: "6 · Scaling and systems (JAX Scaling Book)",
    items: [
      { id: "s-book", title: "How to Scale Your Model (the JAX Scaling Book)", note: "the guide's one regret was not finding it before interviews", url: "https://jax-ml.github.io/scaling-book/", kind: "maths", key: true },
      { id: "s-roofline", title: "Rooflines: FLOPs vs bytes, arithmetic intensity", url: "https://jax-ml.github.io/scaling-book/roofline/", kind: "maths", key: true },
      { id: "s-tpu", title: "How a TPU / GPU executes a matmul", url: "https://jax-ml.github.io/scaling-book/tpus/", kind: "maths" },
      { id: "s-sharding", title: "Sharding matmuls: data, tensor, pipeline, FSDP", url: "https://jax-ml.github.io/scaling-book/sharding/", kind: "maths", key: true },
      { id: "s-transformer-math", title: "Transformer FLOPs and parameter counting", note: "6ND, KV-cache size, attention cost vs MLP cost", url: "https://jax-ml.github.io/scaling-book/transformers/", kind: "maths", key: true },
      { id: "s-training", title: "Training at scale: collectives, communication primitives", url: "https://jax-ml.github.io/scaling-book/training/", kind: "maths" },
      { id: "s-inference", title: "Inference: prefill vs decode, batching, latency vs throughput", url: "https://jax-ml.github.io/scaling-book/inference/", kind: "maths" },
      { id: "s-jax-practice", title: "Programming TPUs in JAX (the book's applied chapter)", url: "https://jax-ml.github.io/scaling-book/applied-training/", kind: "maths" },
    ],
  },
];

export const jaxCount = jaxSections.reduce((n, s) => n + s.items.length, 0);
export const jaxKey = (id: string) => `jax_done_${id}`;
