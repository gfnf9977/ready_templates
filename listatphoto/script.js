const slider = document.getElementById('slider');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

let currentIndex = 0;

function updateSliderPosition() {
    const offset = -currentIndex * 100; // Зміщення в % для плавного переходу
    slider.style.transform = `translateX(${offset}%)`;
}

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + 2) % 2; // Переходи вліво
    updateSliderPosition();
});

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % 2; // Переходи вправо
    updateSliderPosition();
});
