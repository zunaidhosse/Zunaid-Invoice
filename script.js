// Initialization
let oldSar = 0;
let advanceSar = 0;
let isLoadingFromHistory = false; // Flag to prevent saving state while loading from history
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    loadHistory();

    // Old SAR Modal listeners
    const oldSarModal = document.getElementById('oldSarModal');
    const oldSarCloseBtn = oldSarModal.querySelector('.close-button');
    const saveOldSarBtn = document.getElementById('saveOldSarBtn');

    oldSarCloseBtn.onclick = hideOldSarModal;
    saveOldSarBtn.onclick = saveOldSarFromModal;

    // Advance SAR Modal listeners
    const advanceSarModal = document.getElementById('advanceSarModal');
    const advanceSarCloseBtn = advanceSarModal.querySelector('.close-button');
    const saveAdvanceSarBtn = document.getElementById('saveAdvanceSarBtn');

    advanceSarCloseBtn.onclick = hideAdvanceSarModal;
    saveAdvanceSarBtn.onclick = saveAdvanceSarFromModal;

    window.onclick = function(event) {
        if (event.target == oldSarModal) {
            hideOldSarModal();
        }
        if (event.target == advanceSarModal) {
            hideAdvanceSarModal();
        }
    }
    
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});

function onEntryChange() {
    calculateTotal();
    saveState();
}

function showOldSarModal() {
    const modal = document.getElementById('oldSarModal');
    const oldSarInput = document.getElementById('oldSarInput');
    oldSarInput.value = oldSar > 0 ? oldSar.toFixed(2) : '';
    modal.style.display = 'block';
    oldSarInput.focus();
}

function hideOldSarModal() {
    const modal = document.getElementById('oldSarModal');
    modal.style.display = 'none';
}

function saveOldSarFromModal() {
    const oldSarInput = document.getElementById('oldSarInput');
    const newOldSar = parseFloat(oldSarInput.value) || 0;
    
    oldSar = newOldSar;
    onEntryChange();
    hideOldSarModal();
}

function showAdvanceSarModal() {
    const modal = document.getElementById('advanceSarModal');
    const advanceSarInput = document.getElementById('advanceSarInput');
    advanceSarInput.value = advanceSar > 0 ? advanceSar.toFixed(2) : '';
    modal.style.display = 'block';
    advanceSarInput.focus();
}

function hideAdvanceSarModal() {
    const modal = document.getElementById('advanceSarModal');
    modal.style.display = 'none';
}

function saveAdvanceSarFromModal() {
    const advanceSarInput = document.getElementById('advanceSarInput');
    const newAdvanceSar = parseFloat(advanceSarInput.value) || 0;
    
    advanceSar = newAdvanceSar;
    onEntryChange();
    hideAdvanceSarModal();
}

function addEntry(phone = '', amount = '', bkash = false, nagad = false) {
    const entries = document.getElementById('entries');
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <input type="text" class="phone" placeholder="Phone" value="${phone}" oninput="onEntryChange()">
      <input type="number" class="amount" placeholder="Amount" value="${amount}" oninput="onEntryChange()">
      <div class="checkboxes">
        <label><input type="checkbox" class="bkash" ${bkash ? 'checked' : ''} onchange="onEntryChange()">Bkash</label>
        <label><input type="checkbox" class="nagad" ${nagad ? 'checked' : ''} onchange="onEntryChange()">Nagad</label>
      </div>
      <button class="delete-entry-btn" onclick="removeEntry(this)">
        <img src="delete-icon.png" alt="Delete"/>
      </button>
    `;
    entries.appendChild(div);
    onEntryChange();
}

function removeEntry(button) {
    button.closest('.entry').remove();
    onEntryChange();
}

function getEntriesData() {
    const entriesData = [];
    document.querySelectorAll('.entry').forEach(entryEl => {
        const phone = entryEl.querySelector('.phone').value;
        const amount = entryEl.querySelector('.amount').value;
        const bkash = entryEl.querySelector('.bkash').checked;
        const nagad = entryEl.querySelector('.nagad').checked;
        if (phone || amount) {
            entriesData.push({ phone, amount, bkash, nagad });
        }
    });
    return entriesData;
}

function calculateTotal() {
    let total = 0;
    const entriesData = getEntriesData();
    entriesData.forEach(entry => {
        total += parseFloat(entry.amount) || 0;
    });

    document.getElementById('totalBDT').innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/1170/1170627.png" /> Total TK: ${total.toFixed(2)}`;
    const rate = parseFloat(document.getElementById('sarRate').value) || 0;
    const subtotalSar = rate > 0 ? (total / rate) : 0;
    document.getElementById('totalSAR').innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/9377/9377574.png" /> Subtotal SAR: ${subtotalSar.toFixed(2)}`;

    const oldSarDisplay = document.getElementById('oldSarDisplay');
    const advanceSarDisplay = document.getElementById('advanceSarDisplay');
    const grandTotalSarDisplay = document.getElementById('grandTotalSarDisplay');
    
    let grandTotalSar = subtotalSar;

    if (oldSar > 0) {
        document.getElementById('oldSarValueText').innerText = oldSar.toFixed(2);
        oldSarDisplay.style.display = 'block';
        grandTotalSar += oldSar;
    } else {
        oldSarDisplay.style.display = 'none';
    }

    if (advanceSar > 0) {
        document.getElementById('advanceSarValueText').innerText = advanceSar.toFixed(2);
        advanceSarDisplay.style.display = 'block';
        grandTotalSar -= advanceSar;
    } else {
        advanceSarDisplay.style.display = 'none';
    }
    
    if (oldSar > 0 || advanceSar > 0) {
        const grandTotalSarLabel = document.getElementById('grandTotalSarLabel');
        const grandTotalSarValue = document.getElementById('grandTotalSarValue');

        if (grandTotalSar < 0) {
            grandTotalSarLabel.innerText = 'Advance:';
            grandTotalSarValue.innerText = Math.abs(grandTotalSar).toFixed(2);
        } else {
            grandTotalSarLabel.innerText = 'Due SAR:';
            grandTotalSarValue.innerText = grandTotalSar.toFixed(2);
        }
        
        grandTotalSarDisplay.style.display = 'flex';
    } else {
        grandTotalSarDisplay.style.display = 'none';
    }
}

function saveState() {
    if (isLoadingFromHistory) return;
    const state = {
        entries: getEntriesData(),
        sarRate: document.getElementById('sarRate').value,
        oldSar: oldSar,
        advanceSar: advanceSar
    };
    localStorage.setItem('zunaidInvoiceState', JSON.stringify(state));
}

function loadState() {
    const state = JSON.parse(localStorage.getItem('zunaidInvoiceState'));
    const entriesContainer = document.getElementById('entries');
    entriesContainer.innerHTML = '';

    if (state) {
        oldSar = state.oldSar || 0;
        advanceSar = state.advanceSar || 0;
    }

    if (state && state.entries && state.entries.length > 0) {
        document.getElementById('sarRate').value = state.sarRate || 32.5;
        state.entries.forEach(entry => {
            addEntry(entry.phone, entry.amount, entry.bkash, entry.nagad);
        });
    } else {
        addEntry(); // Start with one empty entry
    }
    calculateTotal();
}

function generateInvoiceHTML(invoiceData) {
    const { entries, sarRate, date, time, total, sar, oldSarValue, advanceSarValue } = invoiceData;
    let html = `
      <div style='text-align:center; font-weight:bold;'>ZUNAID'S DINE</div>
      <div style='text-align:center;'>Bhola Barisal Bangladesh</div>
      <div style='text-align:center;'>Contact: +9660581991368</div>
      <div style='text-align:center;'>Email: contact@zunaidsdine.com</div>
      <div style='text-align:center;'>Date: ${date} Time: ${time}</div>
      <hr>
      <div style='text-align:center; font-weight:bold; font-size:16px;'>INVOICE</div>
      <table style='width:100%; font-size:14px; border-collapse: collapse;' border='1'>
        <tr><th>No.</th><th>Phone</th><th>TK</th><th>Bkash</th><th>Nagad</th></tr>`;

    entries.forEach((entry, i) => {
      html += `<tr><td>${i + 1}</td><td>${entry.phone}</td><td>${entry.amount}</td><td style="text-align:center;">${entry.bkash ? '✔️' : ''}</td><td style="text-align:center;">${entry.nagad ? '✔️' : ''}</td></tr>`;
    });
    
    html += `</table>
      <div style='text-align:right; margin-top:10px;'>SAR Rate: ${sarRate}</div>
      <div style='text-align:right;'>Total TK: ${total.toFixed(2)}</div>
      <div style='text-align:right;'>Subtotal SAR: ${sar}</div>`;
      
    let grandTotalSar = parseFloat(sar);
      
    if (oldSarValue && oldSarValue > 0) {
        html += `<div style='text-align:right; font-size:12px;'>Old SAR Balance: +${oldSarValue.toFixed(2)}</div>`;
        grandTotalSar += oldSarValue;
    }

    if (advanceSarValue && advanceSarValue > 0) {
        html += `<div style='text-align:right; font-size:12px;'>Advance SAR: -${advanceSarValue.toFixed(2)}</div>`;
        grandTotalSar -= advanceSarValue;
    }
      
    if ((oldSarValue && oldSarValue > 0) || (advanceSarValue && advanceSarValue > 0)) {
        html += `<hr style="border: 0; border-top: 1px dashed #8c8b8b; background: #fff; margin: 5px 0;">`;
        if (grandTotalSar < 0) {
            html += `<div style='text-align:right; font-weight:bold; font-size:12px; color:green;'>Advance: ${Math.abs(grandTotalSar).toFixed(2)}</div>`;
        } else {
            html += `<div style='text-align:right; font-weight:bold; font-size:12px; color:red;'>Due SAR: ${grandTotalSar.toFixed(2)}</div>`;
        }
    }
      
    html += `
      <hr>
      <div style='text-align:center;'>*** Thank You, Visit Again! ***</div>
      <div style='text-align:center;'>This is a computer generated receipt.</div>
      <div style='text-align:center; margin-top:15px; font-size:10px; font-style:italic; color:#b0b0b0; text-shadow: 1px 1px 1px #fff;'>creator by zunaid</div>`;
    
    return html;
}

function generateInvoice() {
    const entries = getEntriesData();
    if (entries.length === 0) {
        alert("Please add at least one entry.");
        return;
    }

    const now = new Date();
    const invoiceData = {
        id: Date.now(),
        entries: entries,
        sarRate: parseFloat(document.getElementById('sarRate').value),
        date: now.toLocaleDateString('en-GB'),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        total: 0,
        sar: 0,
        oldSarValue: oldSar,
        advanceSarValue: advanceSar,
    };

    invoiceData.entries.forEach(entry => {
        invoiceData.total += parseFloat(entry.amount) || 0;
    });
    invoiceData.sar = (invoiceData.total / invoiceData.sarRate).toFixed(2);
    
    const receipt = document.getElementById('receipt');
    receipt.innerHTML = generateInvoiceHTML(invoiceData);

    html2canvas(receipt).then(canvas => {
      const link = document.createElement('a');
      link.download = `invoice-${invoiceData.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });

    saveInvoiceToHistory(invoiceData);
}

function saveInvoiceToHistory(invoiceData) {
    const history = JSON.parse(localStorage.getItem('zunaidInvoiceHistory')) || [];
    history.unshift(invoiceData); // Add to the beginning
    if (history.length > 50) { // Keep history manageable
        history.pop();
    }
    localStorage.setItem('zunaidInvoiceHistory', JSON.stringify(history));
    renderHistory();
}

function loadHistory() {
    renderHistory();
}

function renderHistory() {
    const historyDiv = document.getElementById('history');
    const history = JSON.parse(localStorage.getItem('zunaidInvoiceHistory')) || [];
    historyDiv.innerHTML = '';

    if (history.length === 0) {
        historyDiv.innerHTML = '<p style="text-align:center;">No history yet.</p>';
        return;
    }

    history.forEach(invoiceData => {
        const container = document.createElement('div');
        container.className = 'history-item';
        
        let detailsHTML = `Total: ${invoiceData.total.toFixed(2)} TK / ${invoiceData.sar} SAR (${invoiceData.entries.length} entries)`;
        if (invoiceData.oldSarValue && invoiceData.oldSarValue > 0) {
            detailsHTML += `<br>Old SAR Balance: +${invoiceData.oldSarValue.toFixed(2)}`;
        }
        if (invoiceData.advanceSarValue && invoiceData.advanceSarValue > 0) {
            detailsHTML += `<br>Advance SAR: -${invoiceData.advanceSarValue.toFixed(2)}`;
        }
        
        container.innerHTML = `
            <div class="history-item-header">Invoice - ${invoiceData.date} ${invoiceData.time}</div>
            <div class="history-item-details">
                ${detailsHTML}
            </div>
            <div class="history-item-actions">
                <button class="history-btn download-btn" onclick="downloadHistoryItem('${invoiceData.id}')">Download</button>
                <button class="history-btn edit-btn" onclick="editHistoryItem('${invoiceData.id}')">Edit</button>
                <button class="history-btn delete-history-btn" onclick="deleteHistoryItem('${invoiceData.id}')">Delete</button>
            </div>
        `;
        historyDiv.appendChild(container);
    });
}

function findHistoryItem(id) {
    const history = JSON.parse(localStorage.getItem('zunaidInvoiceHistory')) || [];
    return history.find(item => item.id.toString() === id.toString());
}

function downloadHistoryItem(id) {
    const invoiceData = findHistoryItem(id);
    if (!invoiceData) return;

    const receipt = document.getElementById('receipt');
    receipt.innerHTML = generateInvoiceHTML(invoiceData);
    
    html2canvas(receipt).then(canvas => {
      const link = document.createElement('a');
      link.download = `invoice-${invoiceData.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
}

function editHistoryItem(id) {
    const invoiceData = findHistoryItem(id);
    if (!invoiceData) return;
    
    isLoadingFromHistory = true;

    // Restore oldSar and advanceSar from the history item
    oldSar = invoiceData.oldSarValue || 0;
    advanceSar = invoiceData.advanceSarValue || 0;
    
    const entriesContainer = document.getElementById('entries');
    entriesContainer.innerHTML = '';
    document.getElementById('sarRate').value = invoiceData.sarRate;

    if (invoiceData.entries && invoiceData.entries.length > 0) {
        invoiceData.entries.forEach(entry => {
            addEntry(entry.phone, entry.amount, entry.bkash, entry.nagad);
        });
    } else {
        addEntry(); // Add a blank entry to reset the view
    }
    
    calculateTotal(); // Ensure UI is fully updated with historical data
    
    isLoadingFromHistory = false;

    toggleHistory(false); // Close history panel
    window.scrollTo(0,0); // Scroll to top
}

function deleteHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem('zunaidInvoiceHistory')) || [];
    history = history.filter(item => item.id.toString() !== id.toString());
    localStorage.setItem('zunaidInvoiceHistory', JSON.stringify(history));
    renderHistory();
}

function toggleHistory(forceState) {
    const history = document.getElementById('history');
    const isVisible = history.style.display === 'block';

    if (typeof forceState === 'boolean') {
        history.style.display = forceState ? 'block' : 'none';
    } else {
        history.style.display = isVisible ? 'none' : 'block';
    }

    if(history.style.display === 'block') {
        renderHistory();
    }
}