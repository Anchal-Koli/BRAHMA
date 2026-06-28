# BRAHMA Evaluation Framework (BEF) Philosophy

This document defines the core conceptual pillars governing the **BRAHMA Evaluation Framework (BEF)**. The BEF does not write code or execute specific project logic; it establishes the abstract, mathematical, and logical guidelines required to evaluate autonomous agent runs objectively.

---

## 🏛️ The 10 Core Pillars of BEF

A valid BEF benchmark must satisfy all of the following requirements:

### 1. Objective
Scoring and evaluation criteria must be completely detached from the subjective sentiment of the evaluator. Benchmarks use structured Gherkin-style criteria (**Given-When-Then** blocks) to specify binary or quantitatively measurable states, ensuring that grading is binary, transparent, and fair.

### 2. Repeatable
A benchmark must yield consistent, deterministic results when executed multiple times against the same agent configuration. Variance across sequential identical runs must be strictly controlled and audited (Target Repeatability: >95%, Allowed Variance: <5%).

### 3. Reproducible
Any external developer or system auditor must be able to reproduce the exact benchmark execution. Specifications must explicitly define the **Execution Environment Constraints**, including Operating System details, runtime engines, dependency package versions, hardware baselines, and the exact execution commands.

### 4. Observable
The execution pathway, intermediate reasoning steps, tool usage events, and API request-response cycles must be fully logged. The internal states of the agent are treated as transparent data points to verify not just the *what* (output), but the *how* (execution path).

### 5. Evidence-based
No score is valid without concrete, verifiable evidence. Qualitative terms (such as "clean design" or "secure build") are invalid. Every category score must link directly to empirical outputs, such as:
*   Pass/Fail metrics of automated unit tests.
*   Linter error output counts.
*   Cyclomatic complexity values.
*   Static security analysis (e.g., Bandit) vulnerability reports.

### 6. Tool Independent
The benchmark specification must not dictate the specific libraries, frameworks, or utility tools the agent uses to solve the problem. The agent is free to make its own structural and tooling choices as long as the functional acceptance criteria are met.

### 7. Model Independent
The evaluation specifications apply universally. A benchmark must be structured so it can evaluate any language model or agentic interface (e.g., OpenAI, Claude, Antigravity, or custom local setups) without modification.

### 8. Project Independent
Benchmark specifications are decoupled from the target implementation repository. A benchmark defines abstract business logic requirements (e.g., "invalidating tokens on logout") rather than coupling tests to a specific project path, variable name, or module name.

### 9. Versioned
As system capabilities and specifications evolve, benchmarks must be version-tracked. Changes in criteria, difficulty levels, or environment specifications must follow semantic versioning schemas to ensure historical comparisons remain valid.

### 10. Comparable
Grading scorecards and metrics across different model runs must follow a unified structure. This allows side-by-side comparison matrix generation to identify the exact performance curves, strengths, and weaknesses of different agents.
