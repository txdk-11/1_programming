// ========================================
// 프레젠테이션 네비게이션 시스템
// ========================================

let currentSlide = 1;
const totalSlides = 9;

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentSlideSpan = document.getElementById('currentSlide');
const totalSlidesSpan = document.getElementById('totalSlides');

// 초기화
totalSlidesSpan.textContent = totalSlides;

/**
 * 특정 슬라이드로 이동
 * @param {number} slideNumber - 이동할 슬라이드 번호
 */
function goToSlide(slideNumber) {
    // 범위 검사
    if (slideNumber < 1 || slideNumber > totalSlides) return;

    // 현재 슬라이드 비활성화
    const currentElement = document.querySelector('.slide.active');
    if (currentElement) {
        currentElement.classList.remove('active');
    }

    // 새 슬라이드 활성화
    const newSlide = document.querySelector(`.slide-${slideNumber}`);
    if (newSlide) {
        newSlide.classList.add('active');
    }

    currentSlide = slideNumber;
    currentSlideSpan.textContent = currentSlide;

    // 버튼 상태 업데이트
    updateNavigation();
}

/**
 * 네비게이션 버튼 상태 업데이트
 */
function updateNavigation() {
    prevBtn.disabled = currentSlide === 1;
    nextBtn.disabled = currentSlide === totalSlides;
}

/**
 * 이전 슬라이드로 이동
 */
function previousSlide() {
    goToSlide(currentSlide - 1);
}

/**
 * 다음 슬라이드로 이동
 */
function nextSlide() {
    goToSlide(currentSlide + 1);
}

// 이벤트 리스너
prevBtn.addEventListener('click', previousSlide);
nextBtn.addEventListener('click', nextSlide);

// 키보드 네비게이션
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        previousSlide();
    } else if (event.key === 'ArrowRight') {
        nextSlide();
    }
});

// 초기화
window.addEventListener('load', () => {
    goToSlide(1);
    updateNavigation();
});