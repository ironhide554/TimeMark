export interface Chapter {
  timestamp: number; // seconds
  title: string;
  description: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface DemoPreset {
  id: string;
  title: string;
  creator: string;
  duration: string;
  badge: string;
  youtubeUrl: string;
  summary: string;
  chapters: Chapter[];
  transcript: TranscriptSegment[];
  suggestedQuestions: string[];
  sampleQA: { question: string; answer: string; timestamp: number }[];
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "demo-3b1b-neural-networks",
    title: "But what is a neural network? | Deep learning Chapter 1",
    creator: "3Blue1Brown",
    duration: "19:13",
    badge: "Computer Science & AI",
    youtubeUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
    summary: `### Executive Overview
This video introduces the foundational mathematics and intuition behind deep learning by breaking down how an artificial neural network classifies handwritten digits (from the MNIST database) into numbers from 0 to 9.

### Key Architectural Concepts
- **Neurons & Activations:** Each neuron holds a number between 0.0 and 1.0, representing the intensity of its activation. The initial layer consists of $28 \\times 28 = 784$ pixels.
- **Layered Representations:** The network operates in sequential layers: input pixels feed into hidden layers that progressively synthesize low-level edges into sub-components, loops, and whole digits.
- **Weights & Biases:** Connections between neurons are parameterized by weights (synaptic strengths) and biases (activation thresholds), passed through a non-linear activation function (Sigmoid / ReLU).
- **Matrix Multiplications:** Mathematically, feeding activations forward from one layer to the next is represented as $a^{(1)} = \\sigma(W a^{(0)} + b)$.

### Main Takeaways & Implications
- Neural networks are not magical black boxes; they are high-dimensional parametric functions tuned via optimization.
- The representation of knowledge emerges collectively across distributed weights and activations.`,
    chapters: [
      {
        timestamp: 0,
        title: "Introduction to MNIST & Digits",
        description: "Overview of the handwritten digit recognition challenge and how human vision differs from computational recognition."
      },
      {
        timestamp: 153,
        title: "Anatomy of a Neuron",
        description: "Defining a neuron as a container holding a number between 0 and 1, mapping to 784 input pixels."
      },
      {
        timestamp: 334,
        title: "Hidden Layers & Feature Hierarchy",
        description: "Why hidden layers assemble low-level edges into composite patterns like loops and lines."
      },
      {
        timestamp: 545,
        title: "Weights, Biases & Weighted Sums",
        description: "Calculating the dot product of previous activations and synaptic connection weights."
      },
      {
        timestamp: 820,
        title: "Non-linear Activation Functions (Sigmoid/ReLU)",
        description: "Squashing real numbers into active probability ranges and introducing non-linearity."
      },
      {
        timestamp: 1045,
        title: "Matrix Vector Notation & Summary",
        description: "Formulating feed-forward operations in concise linear algebra equations."
      }
    ],
    transcript: [
      { start: 0, end: 15, text: "This is a 3. It's clumsily written and rendered at a measly 28 by 28 pixels, but your brain has no trouble recognizing it." },
      { start: 16, end: 32, text: "If I ask you to write a program that takes in a grid of 28 by 28 pixels and outputs what digit it is, the task suddenly becomes astonishingly difficult." },
      { start: 33, end: 55, text: "Yet, artificial neural networks can solve this with remarkable accuracy using layers of mathematical units inspired by biological neurons." },
      { start: 153, end: 180, text: "Let's begin by defining what a neuron is in this context. It's simply a thing that holds a number between 0 and 1." },
      { start: 181, end: 215, text: "For the input layer, each of the 784 neurons corresponds to one of the 784 pixels in our 28 by 28 image, holding its grayscale value." },
      { start: 334, end: 370, text: "The network contains two hidden layers with 16 neurons each, followed by an output layer of 10 neurons representing digits 0 through 9." },
      { start: 545, end: 590, text: "Every connection between a neuron in layer n and layer n+1 has an associated weight indicating whether that connection is positive or negative." },
      { start: 820, end: 865, text: "We compute a weighted sum of all inputs, add a bias term to dictate how high the weighted sum needs to be before activation, and pass it through a sigmoid function." },
      { start: 1045, end: 1100, text: "All these operations can be elegantly vectorized into a compact matrix-vector multiplication: a equals sigma of W times a plus b." }
    ],
    suggestedQuestions: [
      "How does the input layer represent an image?",
      "Why are hidden layers necessary in a neural network?",
      "What is the role of weights and biases in activation?",
      "How is the feed-forward calculation expressed mathematically?"
    ],
    sampleQA: [
      {
        question: "How does the input layer represent an image?",
        answer: "The input layer consists of **784 neurons**, corresponding to each pixel in a **28x28 grayscale image**. Each neuron holds an activation value between **0.0 and 1.0**, reflecting the brightness or grayscale intensity of that individual pixel.",
        timestamp: 153
      },
      {
        question: "Why are hidden layers necessary in a neural network?",
        answer: "Hidden layers build an abstraction hierarchy. The first hidden layer detects low-level components like **small edges and line segments**, while subsequent layers combine them into **sub-patterns (loops, corners, and strokes)** before the output layer classifies the digit.",
        timestamp: 334
      },
      {
        question: "What is the role of weights and biases in activation?",
        answer: "Weights determine **how strongly and in what direction (positive or inhibitory)** a prior neuron influences the next neuron. The **bias** acts as a baseline threshold, controlling how active the weighted sum must be before the neuron fires.",
        timestamp: 545
      },
      {
        question: "How is the feed-forward calculation expressed mathematically?",
        answer: "The feed-forward computation is concisely written using matrix multiplication: \n\n$$\\mathbf{a}^{(l+1)} = \\sigma(\\mathbf{W}\\mathbf{a}^{(l)} + \\mathbf{b})$$\n\nWhere $\\mathbf{W}$ is the weight matrix, $\\mathbf{a}^{(l)}$ is the activation vector, $\\mathbf{b}$ is the bias vector, and $\\sigma$ is the non-linear activation function.",
        timestamp: 1045
      }
    ]
  },
  {
    id: "demo-karpathy-intro-llms",
    title: "Intro to Large Language Models | Andrej Karpathy",
    creator: "Andrej Karpathy",
    duration: "1:00:00",
    badge: "Generative AI & LLMs",
    youtubeUrl: "https://www.youtube.com/watch?v=zjkBMFhNj_g",
    summary: `### Executive Overview
In this lecture, Andrej Karpathy provides a comprehensive, 1-hour conceptual breakdown of Large Language Models (LLMs), covering how they are trained from scratch (Pretraining, Fine-Tuning, RLHF), and how they are transforming modern computing as the "Kernel" of a new operating system.

### Key Insights
- **Pretraining Stage:** Compresses trillions of web tokens into neural weights (~tens of billions of parameters) through unsupervised next-token prediction on large GPU clusters.
- **Fine-Tuning & Alignment (SFT & RLHF):** Aligns the raw base document predictor into a polite, helpful assistant via human demonstrations and reinforcement learning from human feedback.
- **LLM as the New OS:** Language models act as CPU/Kernel, while external tools, vector search (RAG), and calculators act as peripherals and memory.`,
    chapters: [
      {
        timestamp: 0,
        title: "Introduction: What is an LLM?",
        description: "Demystifying LLM files: just two files (parameters and run code)."
      },
      {
        timestamp: 390,
        title: "Pretraining: Data & Next-Token Prediction",
        description: "Web scraping, tokenization, and GPU clusters processing trillions of words."
      },
      {
        timestamp: 1240,
        title: "Supervised Fine-Tuning (SFT)",
        description: "Transforming raw document continuations into high-quality conversational assistants."
      },
      {
        timestamp: 1980,
        title: "RLHF: Reinforcement Learning from Human Feedback",
        description: "Ranking model completions with reward models and policy optimization."
      },
      {
        timestamp: 2750,
        title: "Thinking Fast and Slow & Tool Use",
        description: "Equipping LLMs with code execution, vector database retrieval, and multi-step reasoning."
      }
    ],
    transcript: [
      { start: 0, end: 25, text: "Welcome everyone. Large language models like ChatGPT, Claude, and Llama are transforming software, but what actually is an LLM?" },
      { start: 26, end: 60, text: "At its core, an LLM is remarkably simple. It consists of two files: a parameters file with weights, and a few hundred lines of code to run inference." },
      { start: 390, end: 440, text: "Pretraining is where 99% of compute is spent. We take a large chunk of the internet, tokenize it into numbers, and train a transformer neural network to predict the next token." },
      { start: 1240, end: 1290, text: "Base models are not conversational. To make ChatGPT, OpenAI created high quality human conversation datasets and performed Supervised Fine-Tuning." },
      { start: 1980, end: 2040, text: "Through RLHF, human evaluators compare multiple completions, train a reward model, and use PPO to guide the model towards helpful, harmless responses." },
      { start: 2750, end: 2810, text: "The future architecture of computing looks like LLMs serving as the CPU, with vector search and web browsing as working memory and peripherals." }
    ],
    suggestedQuestions: [
      "What are the two core files that make up an LLM?",
      "How does Pretraining differ from Fine-Tuning?",
      "What is the role of RLHF in making models helpful?",
      "Why does Karpathy describe LLMs as the new OS kernel?"
    ],
    sampleQA: [
      {
        question: "What are the two core files that make up an LLM?",
        answer: "An LLM practically consists of two artifacts: \n1. **Parameters file**: Floating point weights (e.g. 70 Billion numbers totaling ~140 GB for Llama 2 70B).\n2. **Run inference file**: A small C or Python script (e.g. ~500 lines of code) that implements the Transformer forward pass.",
        timestamp: 26
      },
      {
        question: "How does Pretraining differ from Fine-Tuning?",
        answer: "**Pretraining** is an expensive unsupervised phase requiring thousands of GPUs over months to predict next tokens across trillions of web text tokens. **Fine-Tuning (SFT)** uses high-quality human conversational dialogues (tens of thousands of Q&A pairs) to instruct the model to behave as an assistant.",
        timestamp: 1240
      },
      {
        question: "What is the role of RLHF in making models helpful?",
        answer: "**RLHF (Reinforcement Learning from Human Feedback)** ranks multiple candidate completions, trains a **reward model** reflecting human preferences, and optimizes the policy using reinforcement learning to boost accuracy, safety, and conciseness.",
        timestamp: 1980
      }
    ]
  }
];
