document.addEventListener('DOMContentLoaded', function () {
    var swiper = new Swiper('.swiper-container', {
        loop: true,
        slidesPerView: 3,
        centeredSlides: true,
        spaceBetween: 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            slideChange: function () {
                updateSlideStyles(swiper);
            },
            init: function () {
                updateSlideStyles(swiper);
            }
        }
    });

    function updateSlideStyles(swiper) {
        var slides = swiper.slides;
        for (var i = 0; i < slides.length; i++) {
            slides[i].classList.remove('swiper-slide-active');
            slides[i].classList.remove('swiper-slide-next');
            slides[i].classList.remove('swiper-slide-prev');
        }
        slides[swiper.activeIndex].classList.add('swiper-slide-active');
        if (swiper.activeIndex + 1 < slides.length) {
            slides[swiper.activeIndex + 1].classList.add('swiper-slide-next');
        }
        if (swiper.activeIndex - 1 >= 0) {
            slides[swiper.activeIndex - 1].classList.add('swiper-slide-prev');
        }
    }
});
