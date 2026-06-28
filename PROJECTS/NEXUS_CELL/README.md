# Nexus Internship Cell — Diagnostic Hub Documentation

This directory contains the unified diagnostic application demonstrating the baseline systems for:
1. **Rudraksh** (Talent OS Dashboard Intern) — Static FAQ Chatbot Prototype.
2. **Deepanshu** (Operations Systems Intern) — Local CRUD Expense & Task Tracker.

---

## 1. User Guide

### 1.1 Chatbot Diagnostic (Rudraksh)
- **Objective:** Get answers to operational FAQs regarding the Nexus Internship.
- **How to Use:**
  1. Open `index.html` in any modern web browser.
  2. Under the **Chatbot Diagnostic** tab, you will see a chat window.
  3. Click any of the **Quick Topics** chips (e.g., *"What is Nexus?"*, *"Who reviews work?"*) to immediately fetch answers.
  4. Alternatively, type questions in the bottom text box (e.g., *"EOD"* or *"reviews"*) and press **Enter** or click the send button.
  5. The assistant will parse keywords from the question and retrieve the mapped response from the static knowledge base.

### 1.2 CRUD Tracker Diagnostic (Deepanshu)
- **Objective:** Track and edit operational expenses and task assignments.
- **How to Use:**
  1. Navigate to the **CRUD Diagnostic** tab.
  2. View the current tracked list in the table on the right.
  3. Use the form on the left to add a new item. Fill in all fields: *Date*, *Project*, *Vendor*, *Category*, *Amount*, *Status*, *Reviewer*, *Remarks*, and *Proof Link*.
  4. Click **Add Track Item**. The list and statistics headers (Total Tracked Expenses, Pending Actions, Active Divisions) will update immediately.
  5. To **Edit** an item: Click the edit icon (blue pencil) in the table row. The form will pre-populate with the item's details. Modify the values and click **Update Item**.
  6. To **Delete** an item: Click the delete icon (red trash bin) and confirm.

---

## 2. Admin Guide & Architecture

### 2.1 File Structure
- `index.html`: Layout structure, navigation tabs, UI cards, and data forms.
- `style.css`: Modern visual styling including dark themes, responsive layout grids, buttons, dynamic tag indicators, and font pairings (Outfit + JetBrains Mono).
- `app.js`: Core controller handling UI tab switching, chatbot keyword search, and local state management for adding, editing, and deleting log items.

### 2.2 System Architecture
```
              +----------------------------+
              |         index.html         |
              +-------------+--------------+
                            |
           +----------------+----------------+
           |                                 |
  +--------v-------+                +--------v-------+
  |    style.css   |                |     app.js     |
  | (Design System)|                | (State Engine) |
  +----------------+                +--------+-------+
                                             |
                            +----------------+----------------+
                            |                                 |
                   +--------v-------+                +--------v-------+
                   |  Chatbot State  |                |   CRUD State   |
                   | (Knowledge Base|                | (Local Array   |
                   |  Keyword Match)|                |  Operations)   |
                   +----------------+                +----------------+
```

---

## 3. Known Limitations
1. **State Persistence:** Data is stored in-memory inside `app.js`. Refreshing or closing the browser tab will reset the log back to the three default dummy records.
2. **Chatbot Natural Language:** The chatbot utilizes a basic substring matching parser rather than full semantic NLP. It scans input text for mapped keywords (e.g., *"role"*, *"eod"*, *"reviewer"*, *"weekly"*).
3. **No File Ingestion:** Receipt file upload is limited to URL linking in this MVP phase (no direct image OCR or PDF parsing).

---

## 4. Next-Version Roadmap
- **Phase 2 (Rudraksh):** Integrate candidate scorecard calculations, stage-gate filters, and PDF export functionality to print candidate profiles.
- **Phase 2 (Deepanshu):** Move from in-memory arrays to local storage (`localStorage`) or a lightweight backend (Django REST Framework) to persist database items across sessions.
