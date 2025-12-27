let cardCounter = 1;

function calculateTotal() {
    // Готівка
    const denomination10kop = document.getElementById('denomination-10kop').value * 0.1;
    const denomination50kop = document.getElementById('denomination-50kop').value * 0.5;
    const denomination1 = document.getElementById('denomination-1').value * 1;
    const denomination2 = document.getElementById('denomination-2').value * 2;
    const denomination5 = document.getElementById('denomination-5').value * 5;
    const denomination10 = document.getElementById('denomination-10').value * 10;
    const denomination20 = document.getElementById('denomination-20').value * 20;
    const denomination50 = document.getElementById('denomination-50').value * 50;
    const denomination100 = document.getElementById('denomination-100').value * 100;
    const denomination200 = document.getElementById('denomination-200').value * 200;
    const denomination500 = document.getElementById('denomination-500').value * 500;
    const denomination1000 = document.getElementById('denomination-1000').value * 1000;

    // Карточки
    const cardContainer = document.getElementById('card-container');
    const cardInputs = cardContainer.getElementsByTagName('input');
    let cardAmount = 0;

    for (let i = 0; i < cardInputs.length; i++) {
        if (cardInputs[i].type === 'number') {
            cardAmount += parseFloat(cardInputs[i].value) || 0;
        }
    }

    // Расчёт суммы готівки и карточных денег
    const cashAmount = denomination10kop + denomination50kop +
                        denomination1 + denomination2 + denomination5 + denomination10 +
                        denomination20 + denomination50 + denomination100 + denomination200 + denomination500 + denomination1000;

    const totalAmount = cashAmount + cardAmount;

    // Обновление элементов с результатами
    const cashAmountElement = document.getElementById('cashAmount');
    const cardAmountElement = document.getElementById('cardAmount');
    const calculatedAmountElement = document.getElementById('calculatedAmount');

    cashAmountElement.textContent = `Сума готівки: ${cashAmount.toFixed(2)}`;
    cardAmountElement.textContent = `Сума на картках: ${cardAmount.toFixed(2)}`;
    calculatedAmountElement.textContent = `Загальна сума: ${totalAmount.toFixed(2)}`;
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

function limitDecimalPlaces(input) {
    const value = input.value;
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
        input.value = parts[0] + '.' + parts[1].slice(0, 2);
    }
}

function addCard() {
    cardCounter++;
    const cardContainer = document.getElementById('card-container');
    const newCardInput = document.createElement('div');
    newCardInput.className = 'input-group';
    newCardInput.innerHTML = `
        <input type="text" id="cardName${cardCounter}" value="Карта ${cardCounter}" oninput="updateCardName(this)">
        <input type="number" id="card${cardCounter}" value="0" min="0" onfocus="clearInput(this)" onblur="resetIfEmpty(this)" oninput="limitDecimalPlaces(this); calculateTotal()">
    `;
    cardContainer.appendChild(newCardInput);
}

function updateCardName(input) {
    const cardName = input.value;
    const cardId = input.id.replace('cardName', 'card');
    const cardAmountInput = document.getElementById(cardId);
    cardAmountInput.previousElementSibling.textContent = cardName;
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const themeToggleButton = document.getElementById('themeToggleButton');
    themeToggleButton.classList.toggle('dark-mode');
}

document.getElementById('addCardButton').addEventListener('click', addCard);
document.getElementById('themeToggleButton').addEventListener('click', toggleTheme);

window.onload = calculateTotal;
