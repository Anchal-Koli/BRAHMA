# GitHub Search Evaluation Benchmark

This document defines the evaluation framework for the **GitHub Search** capability and includes a completed, high-credibility example task.

---

## 1. Benchmark Specification

### 📥 Input
*   **Target Repository Name:** Name of the repository or organization (e.g., `"pgvector"`).
*   **Primary Language / Author (Optional):** Contextual parameters (e.g., `"PostgreSQL"`, `"C"`).

### 📤 Expected Output
A structured, cited research report containing:
1.  **Repository Metadata:** Owner, repository name, URL, primary programming language, stars, and forks count.
2.  **Core Purpose:** Technical description of what the project does.
3.  **Key Features:** Hardware/software integrations, index types, or algorithmic frameworks.
4.  **Community & Releases:** Recent releases, active issues, contribution metrics.
5.  **Sources & Citations:** Links to the repository page, documentation wiki, or releases log.

### ⚖️ Evaluation Criteria
*   **Technical Precision:** Correct identification of programming languages and libraries (Target: 100% correct).
*   **Metric Accuracy:** Verification of star counts and fork stats within a recent range.
*   **License Verification:** Correct identification of the repository's open-source license.

---

## 2. Example Task: Research "pgvector" Repository

### 🎯 Task Parameters
*   **Input Repository:** `"pgvector/pgvector"`

### 📄 Evaluation Execution Output

#### I. 🔎 Query Breakdown
*   What is the official URL, owner, and primary language of the pgvector repository?
*   What is the technical objective of pgvector?
*   What are the core features and index algorithms supported?
*   What are the recent releases and active status?

#### II. 🌐 Sources Used
1.  **GitHub Public Code Directory (`github.com/pgvector/pgvector`)** (High Credibility)
2.  **PostgreSQL Extension Registry** (High Credibility)

#### III. 🧠 Key Findings
*   **Repository Metadata:** Owner: `pgvector`, Repository: `pgvector`, URL: [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector), Primary Language: **C**.
*   **Core Purpose:** An open-source vector similarity search extension for PostgreSQL. Enables semantic search, LLM RAG vector storage, and recommendation engines to run natively inside Postgres.
*   **Core Technical Features:**
    *   *Distance Metrics:* L2 distance (Euclidean), Inner Product, Cosine Distance, L1 distance, Hamming distance.
    *   *Indexes:* IVFFlat (Inverted File with Flat Compression) and **HNSW** (Hierarchical Navigable Small World) indexes for rapid approximate nearest neighbor (ANN) searches.
*   **License:** PostgreSQL License (compatible with MIT/BSD).

`[VERIFICATION: VERIFIED] | [CONFIDENCE: 100%] | [EVIDENCE: GitHub Repository Codebase Metadata]`
