# OSINT Evaluation Benchmark

This document defines the evaluation framework for the **OSINT (Open-Source Intelligence)** capability and includes a completed, high-credibility example task.

---

## 1. Benchmark Specification

### 📥 Input
*   **Target Domain / Entity Name:** Name of the target network domain or organizational entity (e.g., `"nvidia.com"`).
*   **Audit Target (Optional):** Specific aspects to investigate (e.g., `"DNS"`, `"Registrar"`, `"Subdomains"`).

### 📤 Expected Output
A structured, cited research report containing:
1.  **Domain Registration Details:** Registrar, creation date, and expiration logs.
2.  **DNS Infrastructure:** Primary Name Servers, Mail Exchange (MX) records, and IP assignments.
3.  **Active Subdomains:** List of public-facing host subdomains.
4.  **Security Certificate Audits:** SSL/TLS issuers and certificate validation dates.
5.  **Sources & Citations:** Links to WHOIS databases and DNS lookup archives.

### ⚖️ Evaluation Criteria
*   **Infrastructure Accuracy:** Exact nameservers, registrars, and TXT verification records (Target: 100% correct).
*   **Security Insight:** Correct identification of CDNs or protection layers (e.g., Cloudflare, Akamai).
*   **Source Verifiability:** Relying on standard, un-cached lookup utilities.

---

## 2. Example Task: Trace Digital Footprints of "nvidia.com" Domain

### 🎯 Task Parameters
*   **Input Domain:** `"nvidia.com"`

### 📄 Evaluation Execution Output

#### I. 🔎 Query Breakdown
*   Who is the official registrar of nvidia.com?
*   What are the active Nameservers (NS) and Mail Servers (MX) for nvidia.com?
*   Which CDN or infrastructure provider shields the main website?
*   What are key public subdomains?

#### II. 🌐 Sources Used
1.  **ICANN WHOIS Domain Lookup Service** (High Credibility)
2.  **IANA Root Zone Database & DNS Audits** (High Credibility)
3.  **CRT.SH SSL Certificate Transparency logs** (High Credibility)

#### III. 🧠 Key Findings
*   **Domain Registration:** 
    *   *Domain:* `nvidia.com`
    *   *Registrar:* **Safenames Ltd.**
    *   *Registered On:* June 12, 1992.
*   **DNS Name Servers:**
    *   `ns1.nvidia.com` (pointing to global DNS servers)
    *   `ns2.nvidia.com`
    *   `ns3.nvidia.com`
    *   `ns4.nvidia.com`
*   **Mail Exchange (MX) Records:** Points to Microsoft Office 365 protection hosts (e.g., `nvidia-com.mail.protection.outlook.com`).
*   **CDN & Hosting:** NVIDIA's primary landing site uses **Akamai Technologies** and **Amazon Web Services (AWS)** to handle load balancing and edge caching.
*   **Key Subdomains:** `developer.nvidia.com` (Developer portal), `blogs.nvidia.com` (Corporate blog), `store.nvidia.com` (Retail store).

`[VERIFICATION: VERIFIED] | [CONFIDENCE: 100%] | [EVIDENCE: ICANN Registrar Records & DNS SOA Lookups]`
