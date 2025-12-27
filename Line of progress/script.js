document.addEventListener('DOMContentLoaded', () => {
    const progress = document.getElementById('progress');
    const manImage = document.getElementById('man-image');
    let width = 0;

    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width++;
            progress.style.width = width + '%';
            manImage.style.left = (width * (progress.parentElement.offsetWidth - manImage.offsetWidth) / 100) + 'px';
        }
    }, 50);
});
