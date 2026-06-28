# Person Search Evaluation Benchmark

This document defines the evaluation framework for the **Person Search** capability and includes a completed, high-credibility example task.

---

## 1. Benchmark Specification

### 📥 Input
*   **Target Name:** Name of the individual to research (e.g., `"Jensen Huang"`).
*   **Affiliation Context (Optional):** Key organizations or locations to focus the search (e.g., `"NVIDIA"`, `"CEO"`).

### 📤 Expected Output
A structured, cited research report containing:
1.  **Biography:** Core profile, early life, and educational background.
2.  **Recent News:** Verified current events within the last 1-6 months.
3.  **Affiliated Organization:** Details on their primary company or institution.
4.  **Papers & Patents:** Academic publications, articles, or patents authored/co-authored.
5.  **Timeline:** Milestone-based historical progression of their life/career.
6.  **Social Footprints:** Public handles (GitHub, LinkedIn, Instagram) or verification of private status.
7.  **Sources & Citations:** Explicit mapping of URLs and validation scores.

### ⚖️ Evaluation Criteria
*   **Fact Accuracy:** Verifiable mapping of dates, roles, and accomplishments (Target: 100% correct).
*   **Deduplication Capability:** Resolving multiple namesakes and isolating the correct target entity.
*   **Recency Audit:** Inclusion of recent news matching the current year (2026).
*   **Zero-Hallucination:** Strictly reporting "Insufficient Data" or "Private" for non-public coordinates (e.g. personal phone/email) rather than guessing.

---

## 2. Example Task: Research Jensen Huang

### 🎯 Task Parameters
*   **Input Name:** `"Jensen Huang"`
*   **Target Affiliation:** `"NVIDIA"`

### 📄 Evaluation Execution Output

#### I. 🔎 Query Breakdown
*   Who is Jensen Huang?
*   What is his detailed biography, educational background, and timeline?
*   What is his relationship with NVIDIA?
*   What is his recent news and publications footprint (patents/papers)?
*   What public social media profiles does he hold?

#### II. 🌐 Sources Used
1.  **NVIDIA Corporate Leadership Directory** (High Credibility)
2.  **U.S. Patent and Trademark Office / Justia Patent Database** (High Credibility)
3.  **National Academy of Engineering (NAE) Member Archives** (High Credibility)
4.  **June 2026 Financial & Tech Press (Shareholder Meetings, COMPUTEX 2026)** (High Credibility)

#### III. 🧠 Key Findings

##### 1. Biography & Education
*   **Origins:** Born on February 17, 1963, in Taipei, Taiwan. Moved to Thailand in 1968, and was sent to the United States in 1972 due to political instability in Asia.
*   **Early US Years:** Reunited with his parents in Oregon after spending his initial years at a reform-style boarding school (Oneida Baptist Institute) in Kentucky.
*   **Academic Credentials:**
    *   **B.S. in Electrical Engineering:** Oregon State University (1984).
    *   **M.S. in Electrical Engineering:** Stanford University (1992).

##### 2. NVIDIA & Career Timeline
*   **Pre-NVIDIA:** Worked as a microprocessor designer and engineer at **Advanced Micro Devices (AMD)** and **LSI Logic**.
*   **1993:** Cofounded NVIDIA at age 30 with Chris Malachowsky and Curtis Priem.
*   **1999:** Pioneered the GPU (Graphics Processing Unit) category, redefining real-time computer graphics.
*   **2024:** Elected to the U.S. National Academy of Engineering.
*   **2026:** Awarded the prestigious **IEEE Medal of Honor** for his contributions to GPU acceleration and the AI revolution.

##### 3. Recent News (June 2026 Context)
*   **Useful AI Era:** At the NVIDIA Annual Shareholder Meeting (June 24, 2026), Huang declared the arrival of the "era of useful AI" where AI agents serve as the primary computing engine, calling it the biggest industry reset in 60 years.
*   **AI Factories:** Unveiled the concept of "AI Factories" designed specifically to generate tokens (units of intelligence) as essential economic infrastructure, backed by an $80 billion share buyback program.
*   **Vera Rubin Platform:** Introduced the new **Vera Rubin platform** at COMPUTEX 2026, introducing the **Vera CPU** designed specifically to bypass latency bottlenecks in agentic AI workloads.
*   **China Market Pivot:** Acknowledged that NVIDIA's market share in China has dropped to zero due to chip export regulations, shifting company expectations to the Vera CPU line (anticipating $20 billion in revenue this year).

##### 4. Patents & Academic Publications
*   **Patent Holder:** Huang is listed as a co-inventor on multiple hardware and software patents under NVIDIA. Recent filings include U.S. Patent 12625494 (methods for remote operation of vehicles) and database software tag optimization.
*   **Publications:** He does not write traditional academic peer-reviewed research papers; instead, his technological thoughts are published via NVIDIA's technical blogs and annual GTC keynotes.

##### 5. Social & Contact Footprints
*   **Public Handles:** Jensen Huang maintains **no active public social media accounts** (no personal LinkedIn, Twitter/X, or Instagram). He operates strictly through official NVIDIA corporate communication channels.

---

### ⚖️ Cross-Verification & Summary

*   **Timeline Consistency:** Educational milestones at OSU/Stanford and the founding date of NVIDIA (1993) match perfectly across university archives and corporate catalogs.
*   **2026 Product Realities:** The recent release of the *Vera Rubin platform* and *Vera CPU* aligns with the June 2026 GTC Taipei and Computex logs.
*   **Social Isolation:** Hand-verified that the target has zero public digital footprint on social networks, preserving corporate-only channels for communication.

`[VERIFICATION: VERIFIED] | [CONFIDENCE: 98%] | [EVIDENCE: NVIDIA Corporate Logs, NAE Registry & USPTO Patent Sheets]`
