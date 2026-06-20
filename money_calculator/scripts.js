let cardCounter = 1;
let currencyCounter = 0;
let currentCurrency = 'USD';
let editingCurrencyId = null;
let denomRowCounter = 0;

// Курси валют (умовні)
const currencyRates = {
    USD: { rate: 45.2, symbol: '$', name: 'Долари (USD)' },
    EUR: { rate: 50.0, symbol: '€', name: 'Євро (EUR)' },
    PLN: { rate: 11.5, symbol: 'zł', name: 'Злоті (PLN)' }
};

const denominations = {
    "10kop": 0.1,
    "50kop": 0.5,
    "1": 1,
    "2": 2,
    "5": 5,
    "10": 10,
    "20": 20,
    "50": 50,
    "100": 100,
    "200": 200,
    "500": 500,
    "1000": 1000
};

// Налаштування API
const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const CACHE_EXPIRY_MINUTES = 60;

// Завантаження курсів з API або кешу
async function loadCurrencyRates() {
    const cached = localStorage.getItem('currencyRates');
    const cachedTime = localStorage.getItem('currencyRatesTime');

    if (cached && cachedTime) {
        const now = new Date().getTime();
        const isExpired = (now - cachedTime) > (CACHE_EXPIRY_MINUTES * 60 * 1000);

        if (!isExpired) {
            try {
                const rates = JSON.parse(cached);
                updateRatesFromAPI(rates);
                return;
            } catch (e) {
                console.log("Помилка читання кешу, завантажуємо з API");
            }
        }
    }

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.rates && data.rates.UAH) {
            const uahRate = data.rates.UAH;
            const newRates = {
                USD: { rate: uahRate, symbol: '$', name: 'Долари (USD)' },
                EUR: { rate: parseFloat((uahRate / data.rates.EUR).toFixed(2)), symbol: '€', name: 'Євро (EUR)' },
                PLN: { rate: parseFloat((uahRate / data.rates.PLN).toFixed(2)), symbol: 'zł', name: 'Злоті (PLN)' }
            };

            localStorage.setItem('currencyRates', JSON.stringify(newRates));
            localStorage.setItem('currencyRatesTime', new Date().getTime());
            updateRatesFromAPI(newRates);
        }
    } catch (error) {
        console.error("Помилка завантаження курсів:", error);
        alert("Не вдалося завантажити актуальні курси. Використовуються попередні дані.");
    }
}

// Оновлюємо глобальні курси з нових даних
function updateRatesFromAPI(newRates) {
    for (const currency in newRates) {
        if (currencyRates[currency]) {
            currencyRates[currency].rate = parseFloat(newRates[currency].rate);
        }
    }
    if (modal.style.display === 'block') {
        switchCurrency(currentCurrency);
    }
    calculateTotal();
}

// Додаємо функцію для ручного оновлення
function refreshRates() {
    loadCurrencyRates();
    alert("Курси оновлено!");
}

function calculateTotal() {
    let cashAmount = 0;

    for (const [id, value] of Object.entries(denominations)) {
        const input = document.getElementById(`denomination-${id}`);
        cashAmount += (parseInt(input.value) || 0) * value;
    }

    let cardAmount = 0;
    document.querySelectorAll('#card-container input[type="number"]')
        .forEach(input => {
            cardAmount += parseFloat(input.value) || 0;
        });

    let currencyAmount = 0;
    document.querySelectorAll('.currency-item').forEach(item => {
        const amount = parseFloat(item.dataset.amount) || 0;
        currencyAmount += amount;
    });

    const totalAmount = cashAmount + cardAmount + currencyAmount;

    document.getElementById('cashAmount').textContent =
        `Сума готівки: ${cashAmount.toFixed(2)}`;

    document.getElementById('currencyAmount').textContent =
        `Сума валюти: ${currencyAmount.toFixed(2)}`;

    document.getElementById('cardAmount').textContent =
        `Сума на картках: ${cardAmount.toFixed(2)}`;

    document.getElementById('calculatedAmount').textContent =
        `Загальна сума: ${totalAmount.toFixed(2)}`;
}

function clearInput(input) {
    if (input.value === "0") {
        input.value = "";
    }
}

function resetIfEmpty(input) {
    if (input.value === "") {
        input.value = "0";
    }
    calculateTotal();
}

function addCard() {
    cardCounter++;

    const cardContainer = document.getElementById('card-container');
    const newCard = document.createElement('div');
    newCard.className = 'input-group';
    newCard.innerHTML = `
        <input type="text" id="cardName${cardCounter}" value="Карта ${cardCounter}">
        <input type="number"
               id="card${cardCounter}"
               value="0"
               min="0"
               step="0.01"
               onfocus="clearInput(this)"
               onblur="resetIfEmpty(this)"
               oninput="calculateTotal()">
        <button class="delete-button" onclick="deleteCard(${cardCounter})">✕</button>
    `;

    cardContainer.appendChild(newCard);
}

function deleteCard(id) {
    const cardElement = document.querySelector(`#card${id}`).parentElement;
    cardElement.remove();
    calculateTotal();
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.getElementById('themeToggleButton').classList.toggle('dark-mode');
}

// Отримати список вже доданих валют
function getAddedCurrencies() {
    const added = new Set();
    document.querySelectorAll('.currency-item').forEach(item => {
        added.add(item.dataset.currency);
    });
    return added;
}

// Оновити видимість табів
function updateTabsVisibility() {
    const addedCurrencies = getAddedCurrencies();
    const tabs = document.querySelectorAll('.currency-tab');
    let visibleCount = 0;

    tabs.forEach(tab => {
        const currency = tab.dataset.currency;
        if (editingCurrencyId !== null) {
            tab.classList.remove('hidden');
            visibleCount++;
        } else {
            if (addedCurrencies.has(currency)) {
                tab.classList.add('hidden');
            } else {
                tab.classList.remove('hidden');
                visibleCount++;
            }
        }
    });

    const allAddedWarning = document.getElementById('allCurrenciesAdded');
    const modalSection = document.getElementById('modalSection');
    const saveBtn = document.getElementById('saveCurrencyButton');

    if (visibleCount === 0 && editingCurrencyId === null) {
        allAddedWarning.style.display = 'block';
        modalSection.style.display = 'none';
        saveBtn.style.display = 'none';
    } else {
        allAddedWarning.style.display = 'none';
        modalSection.style.display = 'block';
        saveBtn.style.display = 'block';
    }
}

// Вибрати перший видимий таб
function selectFirstVisibleTab() {
    const tabs = document.querySelectorAll('.currency-tab');
    for (const tab of tabs) {
        if (!tab.classList.contains('hidden')) {
            tab.classList.add('active');
            switchCurrency(tab.dataset.currency);
            return;
        }
    }
}

// Модальне вікно для валюти
const modal = document.getElementById('currencyModal');
const addCurrencyBtn = document.getElementById('addCurrencyButton');
const closeBtn = document.querySelector('.close');
const saveCurrencyBtn = document.getElementById('saveCurrencyButton');

addCurrencyBtn.onclick = function() {
    modal.style.display = 'block';
    editingCurrencyId = null;
    document.getElementById('modalTitle').textContent = 'Додати іноземну валюту';

    updateTabsVisibility();
    selectFirstVisibleTab();
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
    resetModal();
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        resetModal();
    }
}

// Функція для редагування валюти
function editCurrency(id) {
    const currencyItem = document.querySelector(`.currency-item[data-id="${id}"]`);
    if (!currencyItem) return;

    editingCurrencyId = id;
    document.getElementById('modalTitle').textContent = 'Редагувати валюту';

    const currency = currencyItem.dataset.currency;
    const inputMethod = currencyItem.dataset.inputMethod || 'manual';
    const foreignTotal = parseFloat(currencyItem.dataset.foreignTotal) || 0;

    modal.style.display = 'block';
    updateTabsVisibility();
    switchCurrency(currency);

    document.querySelectorAll('.currency-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.currency === currency) {
            tab.classList.add('active');
        }
    });

    setTimeout(() => {
        if (inputMethod === 'denominations') {
            let denomsData = [];
            try {
                denomsData = JSON.parse(currencyItem.dataset.denominations || '[]');
            } catch(e) {
                denomsData = [];
            }

            const container = document.getElementById('denominationsContainer');
            container.innerHTML = '';
            denomRowCounter = 0;

            if (denomsData.length > 0) {
                denomsData.forEach(d => {
                    addDenominationRow(d.denom, d.count);
                });
            } else {
                addDenominationRow();
            }

            document.getElementById('manualTotal').value = '0';
            enableDenomInputs(true);
        } else {
            document.getElementById('manualTotal').value = foreignTotal.toFixed(2);
            enableDenomInputs(false);
            calculateModalTotal();
        }
    }, 50);
}

function enableDenomInputs(enabled) {
    document.querySelectorAll('.denomination-row input').forEach(input => {
        input.disabled = !enabled;
    });
    document.getElementById('addDenominationButton').disabled = !enabled;
    document.querySelectorAll('.delete-denom-btn').forEach(btn => {
        btn.disabled = !enabled;
    });
}

// Перемикання табів валют
document.querySelectorAll('.currency-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        if (this.classList.contains('hidden')) return;
        const currency = this.dataset.currency;
        switchCurrency(currency);
    });
});

function switchCurrency(currency) {
    currentCurrency = currency;

    document.querySelectorAll('.currency-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.currency === currency) {
            tab.classList.add('active');
        }
    });

    const currencyInfo = currencyRates[currency];
    document.getElementById('currencyTitle').textContent = currencyInfo.name;
    document.getElementById('currencyRate').textContent = currencyInfo.rate.toFixed(2);
    document.getElementById('currencySymbol').textContent = currencyInfo.symbol;

    const container = document.getElementById('denominationsContainer');
    container.innerHTML = '';
    denomRowCounter = 0;

    document.getElementById('manualTotal').value = '0';
    hideDuplicateWarning();
    enableDenomInputs(true);

    addDenominationRow();
    calculateModalTotal();
}

function getExistingDenomValues() {
    const values = new Set();
    document.querySelectorAll('.denomination-row .denom-input').forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val > 0) {
            values.add(val);
        }
    });
    return values;
}

function addDenominationRow(denomValue = 0, countValue = 0) {
    denomRowCounter++;
    const container = document.getElementById('denominationsContainer');
    const symbol = currencyRates[currentCurrency].symbol;

    const row = document.createElement('div');
    row.className = 'denomination-row';
    row.id = `denom-row-${denomRowCounter}`;
    row.innerHTML = `
        <span class="denom-label">Номінал:</span>
        <input type="number" class="denom-input" placeholder="0" min="0" step="0.01" value="${denomValue > 0 ? denomValue : ''}">
        <span class="denom-label">Кількість:</span>
        <input type="number" class="count-input" value="${countValue}" min="0">
        <span class="denom-subtotal">= ${(denomValue * countValue).toFixed(2)} ${symbol}</span>
        <button class="delete-denom-btn" onclick="deleteDenominationRow(${denomRowCounter})">✕</button>
    `;

    container.appendChild(row);

    const denomInput = row.querySelector('.denom-input');
    const countInput = row.querySelector('.count-input');

    denomInput.addEventListener('input', function() {
        checkDuplicate(this);
        updateRowSubtotal(row);
        calculateModalTotal();
    });

    countInput.addEventListener('input', function() {
        updateRowSubtotal(row);
        calculateModalTotal();
    });

    if (denomValue === 0) {
        denomInput.focus();
    }
}

function deleteDenominationRow(id) {
    const row = document.getElementById(`denom-row-${id}`);
    if (row) {
        row.remove();
        const container = document.getElementById('denominationsContainer');
        if (container.children.length === 0) {
            addDenominationRow();
        }
        hideDuplicateWarning();
        calculateModalTotal();
    }
}

function checkDuplicate(input) {
    const val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) {
        hideDuplicateWarning();
        return;
    }

    let count = 0;
    document.querySelectorAll('.denomination-row .denom-input').forEach(inp => {
        if (parseFloat(inp.value) === val) {
            count++;
        }
    });

    if (count > 1) {
        showDuplicateWarning();
        input.style.borderColor = '#ffc107';
    } else {
        hideDuplicateWarning();
        input.style.borderColor = '';
    }
}

function showDuplicateWarning() {
    document.getElementById('duplicateWarning').classList.add('show');
}

function hideDuplicateWarning() {
    document.getElementById('duplicateWarning').classList.remove('show');
    document.querySelectorAll('.denomination-row .denom-input').forEach(input => {
        input.style.borderColor = '';
    });
}

function updateRowSubtotal(row) {
    const denomInput = row.querySelector('.denom-input');
    const countInput = row.querySelector('.count-input');
    const subtotalSpan = row.querySelector('.denom-subtotal');
    const symbol = currencyRates[currentCurrency].symbol;

    const denom = parseFloat(denomInput.value) || 0;
    const count = parseFloat(countInput.value) || 0;
    const subtotal = denom * count;

    subtotalSpan.textContent = `= ${subtotal.toFixed(2)} ${symbol}`;
}

function calculateModalTotal() {
    let foreignTotal = 0;

    const manualTotal = parseFloat(document.getElementById('manualTotal').value) || 0;

    if (manualTotal > 0) {
        foreignTotal = manualTotal;
    } else {
        document.querySelectorAll('.denomination-row').forEach(row => {
            const denomInput = row.querySelector('.denom-input');
            const countInput = row.querySelector('.count-input');

            const denom = parseFloat(denomInput.value) || 0;
            const count = parseFloat(countInput.value) || 0;
            foreignTotal += denom * count;
        });
    }

    const rate = currencyRates[currentCurrency].rate;
    const uahTotal = foreignTotal * rate;

    document.getElementById('modalForeignTotal').textContent = foreignTotal.toFixed(2);
    document.getElementById('modalUahTotal').textContent = uahTotal.toFixed(2);

    return { foreignTotal, uahTotal };
}

function resetModal() {
    document.getElementById('manualTotal').value = '0';
    document.getElementById('modalForeignTotal').textContent = '0.00';
    document.getElementById('modalUahTotal').textContent = '0.00';
    hideDuplicateWarning();
}

document.getElementById('addDenominationButton').addEventListener('click', function() {
    addDenominationRow();
});

document.getElementById('manualTotal').addEventListener('input', function() {
    const manualVal = parseFloat(this.value) || 0;
    enableDenomInputs(manualVal === 0);
    calculateModalTotal();
});

saveCurrencyBtn.onclick = function() {
    const { foreignTotal, uahTotal } = calculateModalTotal();

    const counts = {};
    document.querySelectorAll('.denomination-row .denom-input').forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val) && val > 0) {
            counts[val] = (counts[val] || 0) + 1;
        }
    });
    for (const key in counts) {
        if (counts[key] > 1) {
            showDuplicateWarning();
            return;
        }
    }

    if (uahTotal <= 0) return;

    const symbol = currencyRates[currentCurrency].symbol;
    const manualVal = parseFloat(document.getElementById('manualTotal').value) || 0;
    const inputMethod = manualVal > 0 ? 'manual' : 'denominations';

    let denomsData = [];
    if (inputMethod === 'denominations') {
        document.querySelectorAll('.denomination-row').forEach(row => {
            const denomInput = row.querySelector('.denom-input');
            const countInput = row.querySelector('.count-input');
            const denom = parseFloat(denomInput.value) || 0;
            const count = parseFloat(countInput.value) || 0;
            if (denom > 0 && count > 0) {
                denomsData.push({ denom, count });
            }
        });
    }

    if (editingCurrencyId !== null) {
        const currencyItem = document.querySelector(`.currency-item[data-id="${editingCurrencyId}"]`);
        if (currencyItem) {
            currencyItem.dataset.amount = uahTotal.toFixed(2);
            currencyItem.dataset.currency = currentCurrency;
            currencyItem.dataset.foreignTotal = foreignTotal.toFixed(2);
            currencyItem.dataset.inputMethod = inputMethod;
            currencyItem.dataset.denominations = JSON.stringify(denomsData);

            let description = '';
            if (inputMethod === 'denominations' && denomsData.length > 0) {
                const parts = denomsData.map(d => `${d.count}×${d.denom}`);
                description = `Валюта ${editingCurrencyId}: ${symbol}${foreignTotal.toFixed(2)} (${parts.join(', ')}) = ${uahTotal.toFixed(2)} грн`;
            } else {
                description = `Валюта ${editingCurrencyId}: ${symbol}${foreignTotal.toFixed(2)} = ${uahTotal.toFixed(2)} грн`;
            }

            currencyItem.innerHTML = `
                <span>${description}</span>
                <button class="delete-button" onclick="deleteCurrency(${editingCurrencyId})">✕</button>
            `;
        }
    } else {
        currencyCounter++;
        const currencyContainer = document.getElementById('currency-container');

        const noCurrencyMsg = currencyContainer.querySelector('.no-currency');
        if (noCurrencyMsg) {
            noCurrencyMsg.remove();
        }

        const currencyItem = document.createElement('div');
        currencyItem.className = 'currency-item';
        currencyItem.dataset.id = currencyCounter;
        currencyItem.dataset.amount = uahTotal.toFixed(2);
        currencyItem.dataset.currency = currentCurrency;
        currencyItem.dataset.foreignTotal = foreignTotal.toFixed(2);
        currencyItem.dataset.inputMethod = inputMethod;
        currencyItem.dataset.denominations = JSON.stringify(denomsData);

        let description = '';
        if (inputMethod === 'denominations' && denomsData.length > 0) {
            const parts = denomsData.map(d => `${d.count}×${d.denom}`);
            description = `Валюта ${currencyCounter}: ${symbol}${foreignTotal.toFixed(2)} (${parts.join(', ')}) = ${uahTotal.toFixed(2)} грн`;
        } else {
            description = `Валюта ${currencyCounter}: ${symbol}${foreignTotal.toFixed(2)} = ${uahTotal.toFixed(2)} грн`;
        }

        currencyItem.innerHTML = `
            <span>${description}</span>
            <button class="delete-button" onclick="deleteCurrency(${currencyCounter})">✕</button>
        `;

        currencyItem.addEventListener('click', function(e) {
            if (!e.target.classList.contains('delete-button')) {
                editCurrency(currencyCounter);
            }
        });

        currencyContainer.appendChild(currencyItem);
    }

    modal.style.display = 'none';
    resetModal();
    calculateTotal();
}

function deleteCurrency(id) {
    const currencyItem = document.querySelector(`.currency-item[data-id="${id}"]`);
    if (currencyItem) {
        currencyItem.remove();

        const currencyContainer = document.getElementById('currency-container');
        const remainingCurrencies = currencyContainer.querySelectorAll('.currency-item');
        if (remainingCurrencies.length === 0) {
            const msg = document.createElement('p');
            msg.className = 'no-currency';
            msg.textContent = 'Натисніть "Додати валюту" щоб додати';
            currencyContainer.appendChild(msg);
        }
    }
    calculateTotal();
}

document.getElementById('addCardButton').addEventListener('click', addCard);
document.getElementById('themeToggleButton').addEventListener('click', toggleTheme);

// Завантажуємо курси при завантаженні сторінки
window.addEventListener('load', () => {
    loadCurrencyRates();
    calculateTotal();
});

// Обробник для кнопки оновлення
document.getElementById('refreshRatesButton')?.addEventListener('click', refreshRates);