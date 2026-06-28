# Academic Search Evaluation Benchmark

This document defines the evaluation framework for the **Academic Search** capability and includes a completed, high-credibility example task.

---

## 1. Benchmark Specification

### 📥 Input
*   **Target Publication/Paper Title:** Name of the research paper (e.g., `"Attention Is All You Need"`).
*   **Authors / Venue (Optional):** Contextual parameters (e.g., `"Vaswani"`, `"NeurIPS 2017"`).

### 📤 Expected Output
A structured, cited research report containing:
1.  **Paper Metadata:** Title, authors, publication year, journal/conference venue, and DOI.
2.  **Core Objective:** The scientific problem the paper seeks to solve.
3.  **Key Methodology:** Core innovations, architecture designs, or experimental setups.
4.  **Major Findings & Results:** Core metrics, improvements over baseline models, and datasets used.
5.  **Historical Impact:** Citations, subsequent works, and its role in the field's evolution.
6.  **Sources & Citations:** Links to arXiv, Google Scholar, or official publisher portals.

### ⚖️ Evaluation Criteria
*   **Citation & Author Accuracy:** Exact spelling of all co-authors and correct publication venues (Target: 100% correct).
*   **Methodological Detail:** Precise description of technical terms (e.g., self-attention query-key-value vectors).
*   **Verification:** Cross-referencing citations across Google Scholar and Semantic Scholar.

---

## 2. Example Task: Research "Attention Is All You Need"

### 🎯 Task Parameters
*   **Input Paper:** `"Attention Is All You Need"`

### 📄 Evaluation Execution Output

#### I. 🔎 Query Breakdown
*   What is the publication details, authors, and venue of "Attention Is All You Need"?
*   What is the core objective and architecture proposed in the paper?
*   What are the key methodologies (Self-Attention mechanism)?
*   What is the impact and citation footprint of the paper?

#### II. 🌐 Sources Used
1.  **Google Scholar Index** (High Credibility)
2.  **arXiv Repository (Cornell University Library)** (High Credibility)
3.  **NeurIPS Conference Proceedings (2017)** (High Credibility)

#### III. 🧠 Key Findings
*   **Metadata:** Title: *Attention Is All You Need*, Authors: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, and Illia Polosukhin. Published at NeurIPS (Neural Information Processing Systems) in December 2017.
*   **Core Objective:** Replace recurrent (RNN, LSTM) and convolutional neural network layers in sequence transduction tasks (like machine translation) with self-attention to allow faster, parallelized training.
*   **Key Methodology:** The **Transformer** architecture. Relies solely on self-attention mechanisms (Scaled Dot-Product Attention and Multi-Head Attention) to model global dependencies between input and output, bypassing recurrences.
*   **Impact:** Over 100,000 citations (Google Scholar). Formed the base architecture for all state-of-the-art Generative AI models (GPT, Gemini, Claude, Llama).

`[VERIFICATION: VERIFIED] | [CONFIDENCE: 100%] | [EVIDENCE: arXiv Cornell Database & NeurIPS Official Proceedings]`
