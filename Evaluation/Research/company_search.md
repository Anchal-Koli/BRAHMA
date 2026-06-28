# Company Search Evaluation Benchmark

This document defines the evaluation framework for the **Company Search** capability and includes a completed, high-credibility example task.

---

## 1. Benchmark Specification

### 📥 Input
*   **Target Company Name:** Name of the corporate entity (e.g., `"NVIDIA"`).
*   **Sector / HQ Location (Optional):** Contextual indicators (e.g., `"Santa Clara, CA"`, `"Semiconductors"`).

### 📤 Expected Output
A structured, cited research report containing:
1.  **Company Overview:** Corporate mission, sector, and core focus.
2.  **Executive Leadership:** Founder, CEO, and board members.
3.  **Financial Profile:** Headquarters, revenue, stock ticker, and buyback metrics.
4.  **Key Product Lines:** Core offerings, hardware architecture, and software packages.
5.  **Subsidiaries & Affiliates:** Major corporate acquisitions or child companies.
6.  **Recent Events:** Press releases, shareholder outcomes, and market trends.
7.  **Sources & Citations:** Explicit mapping of official domains and financial logs.

### ⚖️ Evaluation Criteria
*   **Financial Accuracy:** Exact alignment of revenues, ticker values, and stock reports (Target: 100% correct).
*   **Entity Resolving:** Resolving parent/subsidiary associations.
*   **Data Timeliness:** Inclusion of latest fiscal quarters (e.g., Q1 2027 fiscal results).

---

## 2. Example Task: Research NVIDIA

### 🎯 Task Parameters
*   **Input Company:** `"NVIDIA"`

### 📄 Evaluation Execution Output

#### I. 🔎 Query Breakdown
*   What is NVIDIA's corporate profile, headquarters, and ticker?
*   Who is the current executive leadership?
*   What are the core financial metrics and recent performance?
*   What are the primary product lines and software architectures?
*   What are the latest 2026 corporate milestones?

#### II. 🌐 Sources Used
1.  **NVIDIA Investor Relations Portal** (High Credibility)
2.  **SEC Edgar Filings Database (Form 10-Q / Form 10-K)** (High Credibility)
3.  **NASDAQ Stock Market Directory (TICKER: NVDA)** (High Credibility)

#### III. 🧠 Key Findings
*   **Company Profile:** NVIDIA Corporation is a global pioneer in GPU-accelerated computing, AI platforms, and visualization software. Headquartered in Santa Clara, California.
*   **Ticker:** NASDAQ: NVDA.
*   **Leadership:** Jensen Huang (Cofounder, President, and CEO).
*   **Core Products:** 
    *   *Hardware:* Hopper (H100/H200), Blackwell (B100/B200), and the newly announced Vera Rubin (Vera CPU) platforms.
    *   *Software:* CUDA (Compute Unified Device Architecture), TensorRT, Omniverse, and RTX Spark.
*   **Recent Financials (Q1 Fiscal 2027):** Record quarterly revenue of $81.6 billion (up 85% year-over-year). Executing an $80 billion share buyback program.

`[VERIFICATION: VERIFIED] | [CONFIDENCE: 100%] | [EVIDENCE: NVIDIA Investor Relations & SEC Form 10-Q]`
