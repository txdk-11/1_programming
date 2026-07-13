// ========================================
// 비밀번호 강도 분석 시스템
// ========================================

// DOM 요소 선택
const passwordInput = document.getElementById('passwordInput');
const togglePasswordBtn = document.getElementById('togglePassword');
const scoreValue = document.getElementById('scoreValue');
const scoreGrade = document.getElementById('scoreGrade');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const feedbackList = document.getElementById('feedbackList');
const resetBtn = document.getElementById('resetBtn');

// 체크리스트 요소
const lengthCheck = document.getElementById('lengthCheck');
const uppercaseCheck = document.getElementById('uppercaseCheck');
const lowercaseCheck = document.getElementById('lowercaseCheck');
const numberCheck = document.getElementById('numberCheck');
const specialCheck = document.getElementById('specialCheck');
const repeatCheck = document.getElementById('repeatCheck');
const patternCheck = document.getElementById('patternCheck');

// 생성기 요소
const generateBtn = document.getElementById('generateBtn');
const generatedPassword = document.getElementById('generatedPassword');
const copyBtn = document.getElementById('copyBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthInput = document.getElementById('lengthInput');
const includeUppercase = document.getElementById('includeUppercase');
const includeLowercase = document.getElementById('includeLowercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSpecial = document.getElementById('includeSpecial');

// ========================================
// 비밀번호 강도 분석 알고리즘
// ========================================

/**
 * 비밀번호 강도를 분석하고 점수를 계산
 * @param {string} password - 분석할 비밀번호
 * @returns {object} 점수 및 분석 결과
 */
function analyzePassword(password) {
    let score = 0;
    const feedback = [];
    const checks = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        noRepeat: false,
        noPattern: false
    };

    if (!password) {
        return {
            score: 0,
            feedback: ['비밀번호를 입력하여 강도를 분석하세요'],
            checks,
            grade: '평가 대기'
        };
    }

    // 1. 길이 확인 (기본 20점)
    if (password.length >= 8) {
        score += 20;
        checks.length = true;
    } else {
        feedback.push(`비밀번호 길이: 현재 ${password.length}자 (최소 8자 권장)`);
    }

    // 2. 대문자 포함 (20점)
    if (/[A-Z]/.test(password)) {
        score += 20;
        checks.uppercase = true;
    } else {
        feedback.push('대문자(A-Z)를 추가하면 더 강합니다.');
    }

    // 3. 소문자 포함 (15점)
    if (/[a-z]/.test(password)) {
        score += 15;
        checks.lowercase = true;
    } else {
        feedback.push('소문자(a-z)를 추가하면 더 강합니다.');
    }

    // 4. 숫자 포함 (15점)
    if (/\d/.test(password)) {
        score += 15;
        checks.number = true;
    } else {
        feedback.push('숫자(0-9)를 추가하세요.');
    }

    // 5. 특수문자 포함 (20점)
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 20;
        checks.special = true;
    } else {
        feedback.push('특수문자(!@#$% 등)를 포함하면 훨씬 더 안전합니다.');
    }

    // 6. 반복 문자 확인 (10점 또는 감점)
    if (!hasRepeatingChars(password)) {
        score += 10;
        checks.noRepeat = true;
    } else {
        score = Math.max(0, score - 10);
        feedback.push('같은 문자가 반복됩니다. 다른 문자를 사용하세요.');
    }

    // 7. 쉬운 패턴 확인 (10점 또는 큰 감점)
    if (!isEasyPattern(password)) {
        score += 10;
        checks.noPattern = true;
    } else {
        score = Math.max(0, score - 20);
        feedback.push('너무 쉬운 패턴(123456, qwerty 등)입니다. 피하세요.');
    }

    // 점수 범위 제한 (0-100)
    score = Math.min(100, Math.max(0, score));

    // 등급 결정
    let grade = '';
    if (score < 40) grade = '매우 약함';
    else if (score < 60) grade = '약함';
    else if (score < 80) grade = '보통';
    else grade = '강함';

    return {
        score,
        feedback: feedback.length > 0 ? feedback : ['매우 강한 비밀번호입니다!'],
        checks,
        grade
    };
}

/**
 * 연속된 반복 문자 확인
 * @param {string} password - 확인할 비밀번호
 * @returns {boolean} 반복 문자 있으면 true
 */
function hasRepeatingChars(password) {
    // 같은 문자가 3번 이상 연속
    const regex = /(.)\1{2,}/;
    return regex.test(password);
}

/**
 * 쉬운 패턴 확인
 * @param {string} password - 확인할 비밀번호
 * @returns {boolean} 쉬운 패턴이면 true
 */
function isEasyPattern(password) {
    const easyPatterns = [
        '123456', '12345678', '1234567890',
        '111111', '000000', '999999',
        'password', 'password123', '123password',
        'qwerty', 'qwerty123', 'asdfgh', 'zxcvbn',
        'abc123', '123abc', 'letmein',
        'admin', 'root', 'test', 'demo'
    ];

    const lowerPassword = password.toLowerCase();
    return easyPatterns.some(pattern => lowerPassword.includes(pattern));
}

// ========================================
// UI 업데이트 함수
// ========================================

/**
 * 비밀번호 강도 표시 업데이트
 * @param {object} result - 분석 결과
 */
function updateStrengthDisplay(result) {
    // 점수 업데이트
    scoreValue.textContent = result.score;
    scoreGrade.textContent = `등급: ${result.grade}`;

    // 강도 게이지 업데이트
    strengthBar.className = 'strength-bar';
    strengthText.className = 'strength-text';

    if (result.score < 40) {
        strengthBar.classList.add('very-weak');
        strengthText.textContent = '매우 약한 비밀번호입니다 ⚠️';
        strengthText.style.color = '#ff4444';
    } else if (result.score < 60) {
        strengthBar.classList.add('weak');
        strengthText.textContent = '약한 비밀번호입니다 ⚠️';
        strengthText.style.color = '#ff9900';
    } else if (result.score < 80) {
        strengthBar.classList.add('medium');
        strengthText.textContent = '보통 수준의 비밀번호입니다 👍';
        strengthText.style.color = '#ffdd00';
    } else if (result.score < 100) {
        strengthBar.classList.add('strong');
        strengthText.textContent = '강한 비밀번호입니다 ✓';
        strengthText.style.color = '#44dd44';
    } else {
        strengthBar.classList.add('very-strong');
        strengthText.textContent = '매우 강한 비밀번호입니다! 🔐';
        strengthText.style.color = '#00bb00';
    }

    // 피드백 업데이트
    feedbackList.innerHTML = '';
    result.feedback.forEach(feedback => {
        const li = document.createElement('li');
        li.textContent = feedback;
        feedbackList.appendChild(li);
    });

    // 체크리스트 업데이트
    updateCheckboxes(result.checks);
}

/**
 * 체크박스 상태 업데이트
 * @param {object} checks - 검사 결과
 */
function updateCheckboxes(checks) {
    lengthCheck.checked = checks.length;
    uppercaseCheck.checked = checks.uppercase;
    lowercaseCheck.checked = checks.lowercase;
    numberCheck.checked = checks.number;
    specialCheck.checked = checks.special;
    repeatCheck.checked = checks.noRepeat;
    patternCheck.checked = checks.noPattern;
}

// ========================================
// 이벤트 리스너
// ========================================

// 비밀번호 입력 이벤트
passwordInput.addEventListener('input', () => {
    const result = analyzePassword(passwordInput.value);
    updateStrengthDisplay(result);
});

// 비밀번호 표시/숨김 토글
togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        togglePasswordBtn.textContent = '👁️';
    }
});

// 초기화 버튼
resetBtn.addEventListener('click', () => {
    passwordInput.value = '';
    passwordInput.type = 'password';
    togglePasswordBtn.textContent = '👁️';
    
    scoreValue.textContent = '0';
    scoreGrade.textContent = '등급: 평가 대기';
    strengthBar.className = 'strength-bar';
    strengthText.textContent = '비밀번호를 입력하여 강도를 분석하세요';
    strengthText.style.color = '#667eea';
    feedbackList.innerHTML = '<li>비밀번호를 입력하여 피드백을 받으세요</li>';
    
    // 체크박스 초기화
    document.querySelectorAll('.analysis-checklist input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    passwordInput.focus();
});

// ========================================
// 비밀번호 생성 시스템
// ========================================

/**
 * 무작위 비밀번호 생성
 * @param {number} length - 생성할 길이
 * @returns {string} 생성된 비밀번호
 */
function generatePassword(length) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{};\':"|,./<>?';

    let characters = '';
    let password = '';

    // 선택된 문자 집합 구성
    if (includeUppercase.checked) characters += uppercase;
    if (includeLowercase.checked) characters += lowercase;
    if (includeNumbers.checked) characters += numbers;
    if (includeSpecial.checked) characters += special;

    // 선택된 문자 없으면 기본값 사용
    if (!characters) {
        characters = uppercase + lowercase + numbers;
    }

    // 비밀번호 생성
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }

    return password;
}

// 비밀번호 생성 버튼
generateBtn.addEventListener('click', () => {
    const length = parseInt(lengthInput.value);
    const password = generatePassword(length);
    generatedPassword.value = password;
});

// 복사 버튼
copyBtn.addEventListener('click', () => {
    if (!generatedPassword.value) {
        alert('먼저 비밀번호를 생성하세요.');
        return;
    }

    // 클립보드에 복사
    navigator.clipboard.writeText(generatedPassword.value).then(() => {
        // 버튼 상태 변경
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ 복사됨';
        copyBtn.style.background = '#667eea';

        // 2초 후 원래 상태로 복구
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(() => {
        // 클립보드 API 미지원 시 대체 방법
        const textArea = document.createElement('textarea');
        textArea.value = generatedPassword.value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        copyBtn.textContent = '✓ 복사됨';
        copyBtn.style.background = '#667eea';
        setTimeout(() => {
            copyBtn.textContent = '📋 복사';
            copyBtn.style.background = '';
        }, 2000);
    });
});

// 길이 슬라이더와 입력 필드 동기화
lengthSlider.addEventListener('input', () => {
    lengthInput.value = lengthSlider.value;
});

lengthInput.addEventListener('input', () => {
    const value = parseInt(lengthInput.value);
    if (value >= 8 && value <= 32) {
        lengthSlider.value = value;
    }
});

// 길이 입력 필드 검증
lengthInput.addEventListener('blur', () => {
    let value = parseInt(lengthInput.value);
    if (isNaN(value) || value < 8) value = 8;
    if (value > 32) value = 32;
    lengthInput.value = value;
    lengthSlider.value = value;
});

// ========================================
// 초기화
// ========================================

// 페이지 로드 시 기본 비밀번호 생성
window.addEventListener('load', () => {
    const defaultPassword = generatePassword(12);
    generatedPassword.value = defaultPassword;
});

// 초기 길이 값 설정
lengthInput.value = lengthSlider.value;