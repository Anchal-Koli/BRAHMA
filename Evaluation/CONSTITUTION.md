# Constitution of the BRAHMA Evaluation Framework (BEF)

This document serves as the master charter and foundational constitution of the **BRAHMA Evaluation Framework (BEF)**. It establishes the abstract principles and conceptual guidelines required to evaluate artificial intelligence systems objectively, independent of vendors, projects, or programming languages.

---

## Article I: Definition of a Benchmark
A benchmark is an abstract, standardized, and repeatable unit of measurement designed to evaluate a specific capability, execution pathway, or cognitive reasoning limit of an artificial intelligence agent. 
*   It is not a piece of project-specific code; it is a standardized performance contract.
*   It defines a structured challenge containing a defined set of inputs, generic execution constraints, and logical expectation criteria.
*   Its primary purpose is to establish an empirical baseline against which various agent architectures, models, and paradigms can be compared.

---

## Article II: Validity of a Benchmark
A benchmark is valid only when it satisfies the following validation constraints:
1.  **Isolation of Variables:** It must evaluate a single, isolated capability (e.g., lexical retrieval, password enforcement, logical inference) without allowing secondary variables (like network latency or model API failures) to contaminate the results.
2.  **Stack Agnosticism:** It must contain zero assumptions about the agent's internal technology stack, libraries, or programming paradigms.
3.  **Real-world Relevance:** The challenge must reflect practical, high-impact scenarios that test reasoning depth, rather than trivial or hyper-specific synthetic tasks.
4.  **No Leaked Context:** The test parameters must be designed to prevent the model from relying on pre-trained context, forcing active runtime problem-solving.

---

## Article III: Objectivity in Measurement
Objectivity requires that the grading of a benchmark is entirely free from human or evaluator model interpretation.
*   **Assertion-based Verification:** Every criteria must be structured using strict logical conditions (**Given-When-Then** blocks).
*   **Binary and Mathematical Outcomes:** The grading logic must only evaluate binary outcomes (e.g., Did the event occur? Was the output blocked?) or mathematical limits (e.g., cyclomatic complexity count, latency in milliseconds, token usage).
*   **No Qualitative Adjectives:** Terms like "clean," "secure," "elegant," or "optimal" are prohibited from the grading vocabulary. If a metric cannot be quantified or programmatically verified, it cannot be scored.

---

## Article IV: Reproducibility Standards
A benchmark is reproducible only when any independent third party can execute the exact same test scenario and achieve identical outcomes.
*   **Environment Mapping:** The benchmark must specify the exact environment baseline required (Operating System parameters, execution runtime versions, pinned package versions, hardware baselines).
*   **Deterministic State Initialization:** Every execution run must begin from a clean, isolated, and identical state, removing any cumulative history, cached data, or memory from previous runs.
*   **Execution Commands:** The precise trigger commands must be documented, leaving zero room for execution variation.

---

## Article V: Empirical Evidence Requirements
No score is valid without auditable, immutable evidence. 
*   **Acceptable Evidence Forms:** Evidence must consist of raw execution outputs, such as:
    *   HTTP status codes and API payloads.
    *   Linter and static analysis output logs.
    *   Compilation reports and unit test coverage percentages.
    *   System resource metrics (CPU, RAM, execution time).
*   **Traceability:** Every claimed score must link directly to the specific execution log file containing the raw, unaltered data of the run. Speculation or evaluation estimates are strictly invalid.

---

## Article VI: Scoring Methodology
Scores are not assigned; they are programmatically computed.
*   **Mathematical Formula:** Scores must be derived from the weighted sum of passed logical assertions and static validation metrics.
*   **Deduction Engine:** Points are automatically deducted for violations of execution constraints (e.g., linter warnings, complexity thresholds, security alerts).
*   **Tiered Scoring Rubrics:** The scoring system must follow a pre-defined, standardized rubric that maps quantitative thresholds (e.g., Cyclomatic Complexity < 10) directly to decimal scores, eliminating evaluator discretion.

---

## Article VII: Elimination of Evaluator Bias
To prevent evaluator bias, the framework enforces a strict separation of boundaries:
1.  **Decoupled Actor and Evaluator:** The system solving the task (the Actor) and the system checking the results (the Evaluator) must be isolated. No model or agent is ever permitted to evaluate its own execution outputs.
2.  **No Knowledge Sharing:** The Evaluator has no context regarding the Actor's model type, prompt templates, or identity, preventing favoritism.
3.  **Static Assessment Rules:** Scoring is governed by static scripts rather than generative model prompts. If an LLM must be used to grade complex outputs (e.g., natural language reasoning), it must grade against a strict, multi-agent consensus validation schema.

---

## Article VIII: Vendor-Agnostic AI Evaluation
The framework evaluates any artificial intelligence system regardless of the underlying vendor, API, or closed-source limitations.
*   **Black-Box Interface:** The framework treats the target AI system as a black box that interacts solely through standard, standardized communication protocols (such as local file operations, terminal command execution, or HTTP API requests).
*   **Output-Oriented Verification:** Evaluation focuses exclusively on the external outputs and observable tool interaction logs generated by the system, ensuring that open-source, closed-source, local, and API-hosted systems are graded on a completely level playing field.
