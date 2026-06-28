// Nexus Diagnostic Hub Application Logic

// --- STATE MANAGEMENT ---
let appState = {
  activeTab: 'chatbot-view',
  
  // Chatbot State
  chatHistory: [
    { sender: 'system', text: 'Hello! I am the Nexus FAQ Assistant. You can test my capabilities by asking any questions about the Nexus Internship Cell structure. Select one of the quick topics below or type your own question.' }
  ],
  
  // Chatbot Knowledge Base
  knowledgeBase: {
    'what is nexus?': 'Nexus is a digital systems and technology operations ecosystem focused on building internal automation solutions, including student coordination, candidate evaluation, project tracking, expense visibility, and manufacturing shift handovers.',
    
    'what are the intern role pools?': 'There are two main tracks initialized:\n1. **Talent OS Dashboard Intern** (assigned to Rudraksh) to manage candidate cards, scorecards, and stage-gate tracking.\n2. **Operations Systems Intern** (assigned to Deepanshu) to manage expense trackers, task boards, and shift handovers.',
    
    'what is the eod report format?': 'Interns must submit this daily report:\n\n**Name:** [Name]\n**Date:** [Date]\n**Today\'s Assigned Task:** [Task details]\n**Completed:** [Details / Proof]\n**Blocked:** [Blocker description or None]\n**Tomorrow\'s Plan:** [Next actions]\n**Proof Link / Screenshot:** [Link]\n**Confidence:** HIGH / MEDIUM / LOW',
    
    'who reviews work?': 'Work is monitored daily by HR for reporting/attendance. Weekly usability reviews and blocker approvals are handled by Priyanshi Sati (Operating Reviewer), and final approval/strategic direction is given by Vijay (Strategic Owner).',
    
    'what is the weekly demo system?': 'Every Friday or Saturday, each intern must present a live working demo of their assigned task. If there is no demo, the work is not accepted as evidence, meaning no completion credit is awarded for that week.',
    
    'what is evidence?': 'Evidence in the Nexus cell refers to verifiable proofs of work, such as live links, deployed project URLs, GitHub repositories, and working demos. Claims without evidence are marked as "weak" or "unknown".',
    
    'what is a diagnostic task?': 'A diagnostic task is assigned in Week 1 to test an intern\'s claimed capabilities before giving them major system ownership. (e.g., Rudraksh\'s FAQ Chatbot diagnostic and Deepanshu\'s CRUD deployment diagnostic).'
  },
  
  // CRUD Expenses / Tasks State
  expenses: [
    { id: 1, date: '2026-06-20', project: 'BHOOMI', vendor: 'AWS Cloud', category: 'Infrastructure', amount: 4500, status: 'paid', reviewer: 'Priyanshi', remarks: 'Monthly database hosting fee', proof: 'https://aws.amazon.com/invoice-dummy' },
    { id: 2, date: '2026-06-22', project: 'SMRITI', vendor: 'Local Stationary', category: 'Office Supplies', amount: 850, status: 'approved', reviewer: 'HR Coordinator', remarks: 'Whiteboards and markers', proof: 'https://drive.google.com/receipt-dummy' },
    { id: 3, date: '2026-06-24', project: 'ARADH', vendor: 'Vendor A', category: 'Raw Materials', amount: 15000, status: 'pending', reviewer: 'Vijay', remarks: 'Prototype fabrication order', proof: '' }
  ],
  
  // CRUD Editing item helper
  editingId: null
};

// --- DOM ELEMENTS ---
const elements = {
  tabs: document.querySelectorAll('.tab-btn'),
  views: document.querySelectorAll('.content-view'),
  
  // Chat Elements
  chatHistoryContainer: document.getElementById('chat-history'),
  chatInput: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
  quickChips: document.getElementById('quick-chips'),
  
  // CRUD Elements
  expenseForm: document.getElementById('expense-form'),
  formSubmitBtn: document.getElementById('form-submit-btn'),
  formResetBtn: document.getElementById('form-reset-btn'),
  expenseTableBody: document.getElementById('expense-table-body'),
  
  // CRUD inputs
  expId: document.getElementById('exp-id'),
  expDate: document.getElementById('exp-date'),
  expProject: document.getElementById('exp-project'),
  expVendor: document.getElementById('exp-vendor'),
  expCategory: document.getElementById('exp-category'),
  expAmount: document.getElementById('exp-amount'),
  expStatus: document.getElementById('exp-status'),
  expReviewer: document.getElementById('exp-reviewer'),
  expRemarks: document.getElementById('exp-remarks'),
  expProof: document.getElementById('exp-proof'),
  
  // CRUD Stats
  statTotalExpenses: document.getElementById('stat-total-expenses'),
  statPendingPayments: document.getElementById('stat-pending-payments'),
  statActiveProjects: document.getElementById('stat-active-projects')
};

// --- TABS CONTROLLER ---
function initTabs() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-target');
      
      // Update active tab class
      elements.tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update visible view
      elements.views.forEach(view => {
        if (view.id === targetView) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      
      appState.activeTab = targetView;
    });
  });
}

// --- CHATBOT CONTROLLER (RUDRAKSH DIAGNOSTIC) ---
function renderChat() {
  elements.chatHistoryContainer.innerHTML = '';
  appState.chatHistory.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.sender}`;
    
    // Replace newlines with breaks, maintain basic markdown bold formatting
    let formattedText = msg.text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
    msgDiv.innerHTML = formattedText;
    elements.chatHistoryContainer.appendChild(msgDiv);
  });
  
  // Scroll to bottom
  elements.chatHistoryContainer.scrollTop = elements.chatHistoryContainer.scrollHeight;
}

function handleSendMessage(text) {
  if (!text || text.trim() === '') return;
  
  // Add user message
  appState.chatHistory.push({ sender: 'user', text: text });
  renderChat();
  
  elements.chatInput.value = '';
  
  // Simulate chatbot reply with typing delay
  setTimeout(() => {
    const normalizedText = text.toLowerCase().trim().replace(/[?.,]/g, '');
    let responseText = "I'm sorry, I don't have that specific question in my static knowledge base. Please try asking about **What is Nexus?**, **EOD report format**, or **Intern role pools**.";
    
    // Check match in knowledgeBase keys
    for (const key in appState.knowledgeBase) {
      if (normalizedText.includes(key.replace(/[?.,]/g, '')) || key.replace(/[?.,]/g, '').includes(normalizedText)) {
        responseText = appState.knowledgeBase[key];
        break;
      }
    }
    
    appState.chatHistory.push({ sender: 'system', text: responseText });
    renderChat();
  }, 400);
}

function initChat() {
  renderChat();
  
  // Send button listener
  elements.sendBtn.addEventListener('click', () => {
    handleSendMessage(elements.chatInput.value);
  });
  
  // Enter key press listener
  elements.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(elements.chatInput.value);
    }
  });
  
  // Quick Chips listener
  elements.quickChips.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip-btn')) {
      const chipQuestion = e.target.textContent;
      handleSendMessage(chipQuestion);
    }
  });
}

// --- CRUD CONTROLLER (DEEPANSHU DIAGNOSTIC) ---
function updateCRUDStats() {
  // Compute metrics
  const total = appState.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingCount = appState.expenses.filter(exp => exp.status === 'pending' || exp.status === 'planned').length;
  const uniqueProjects = new Set(appState.expenses.map(exp => exp.project)).size;
  
  // Update UI
  elements.statTotalExpenses.textContent = `₹${total.toLocaleString('en-IN')}`;
  elements.statPendingPayments.textContent = pendingCount;
  elements.statActiveProjects.textContent = uniqueProjects;
}

function renderCRUDTable() {
  elements.expenseTableBody.innerHTML = '';
  
  if (appState.expenses.length === 0) {
    elements.expenseTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No operational tracker items found. Fill the form to add new items.
        </td>
      </tr>
    `;
    return;
  }
  
  appState.expenses.forEach(exp => {
    const tr = document.createElement('tr');
    
    // Format amount
    const amtFormatted = `₹${exp.amount.toLocaleString('en-IN')}`;
    
    // Create row HTML
    tr.innerHTML = `
      <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">${exp.date}</td>
      <td><strong>${exp.project}</strong></td>
      <td>
        <div style="font-weight: 500;">${exp.vendor}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${exp.category}</div>
      </td>
      <td>${amtFormatted}</td>
      <td><span class="status-tag ${exp.status}">${exp.status}</span></td>
      <td><span style="font-size: 0.8rem; color: var(--text-muted);">${exp.reviewer}</span></td>
      <td class="action-btns">
        <button class="icon-btn edit" onclick="editExpense(${exp.id})" title="Edit Item">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
        </button>
        <button class="icon-btn delete" onclick="deleteExpense(${exp.id})" title="Delete Item">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
        </button>
      </td>
    `;
    
    elements.expenseTableBody.appendChild(tr);
  });
}

function resetCRUDForm() {
  elements.expenseForm.reset();
  elements.expId.value = '';
  appState.editingId = null;
  elements.formSubmitBtn.textContent = 'Add Track Item';
  elements.formResetBtn.textContent = 'Reset';
}

// Global functions for inline action buttons
window.editExpense = function(id) {
  const exp = appState.expenses.find(e => e.id === id);
  if (!exp) return;
  
  // Fill form inputs
  elements.expId.value = exp.id;
  elements.expDate.value = exp.date;
  elements.expProject.value = exp.project;
  elements.expVendor.value = exp.vendor;
  elements.expCategory.value = exp.category;
  elements.expAmount.value = exp.amount;
  elements.expStatus.value = exp.status;
  elements.expReviewer.value = exp.reviewer;
  elements.expRemarks.value = exp.remarks;
  elements.expProof.value = exp.proof;
  
  appState.editingId = id;
  elements.formSubmitBtn.textContent = 'Update Item';
  elements.formResetBtn.textContent = 'Cancel';
  
  // Scroll form into view if responsive
  elements.expenseForm.scrollIntoView({ behavior: 'smooth' });
};

window.deleteExpense = function(id) {
  if (confirm('Are you sure you want to delete this operational item?')) {
    appState.expenses = appState.expenses.filter(e => e.id !== id);
    renderCRUDTable();
    updateCRUDStats();
    if (appState.editingId === id) {
      resetCRUDForm();
    }
  }
};

function initCRUD() {
  renderCRUDTable();
  updateCRUDStats();
  
  // Form submission
  elements.expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Gather inputs
    const record = {
      date: elements.expDate.value,
      project: elements.expProject.value,
      vendor: elements.expVendor.value,
      category: elements.expCategory.value,
      amount: parseFloat(elements.expAmount.value) || 0,
      status: elements.expStatus.value,
      reviewer: elements.expReviewer.value,
      remarks: elements.expRemarks.value,
      proof: elements.expProof.value
    };
    
    if (appState.editingId !== null) {
      // Edit existing
      const index = appState.expenses.findIndex(x => x.id === appState.editingId);
      if (index !== -1) {
        record.id = appState.editingId;
        appState.expenses[index] = record;
      }
    } else {
      // Add new
      record.id = appState.expenses.length > 0 ? Math.max(...appState.expenses.map(e => e.id)) + 1 : 1;
      appState.expenses.push(record);
    }
    
    renderCRUDTable();
    updateCRUDStats();
    resetCRUDForm();
  });
  
  // Reset / Cancel button
  elements.formResetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetCRUDForm();
  });
}

// --- INIT APP ---
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initChat();
  initCRUD();
});
