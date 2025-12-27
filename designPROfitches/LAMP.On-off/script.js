document.addEventListener('DOMContentLoaded', function() {
    const lamp = document.getElementById('lamp');
    let isLightOn = false;

    lamp.addEventListener('dragstart', function() {
        isLightOn = !isLightOn;
        document.body.classList.toggle('light-on', isLightOn);
        document.body.classList.toggle('light-off', !isLightOn);
    });

    lamp.addEventListener('dragend', function() {
        // Додаткові дії після завершення перетягування, якщо потрібно
    });
});
