// 보안 Wordle - script.js
// 한국어 UI, 4/5/6글자 지원, 색상 힌트, 정의 표시, 재시작 및 힌트 기능

(() => {
  // 단어 목록 및 정의 (대문자로 저장)
  const DICTIONARY = {
    4: [
      {w: 'HASH', d: '해시: 데이터를 고정 길이의 값으로 변환하는 암호학적 기법'},
      {w: 'SAML', d: 'SAML: 인증/권한을 위한 XML 기반 표준 (SSO 관련)'},
      {w: 'CERT', d: 'CERT: 디지털 인증서 또는 인증 기관 관련 용어'}
    ],
    5: [
      {w: 'LOGIN', d: '로그인: 시스템에 접근하기 위해 인증하는 행위'},
      {w: 'VIRUS', d: '바이러스: 자기 복제 기능을 가진 악성 코드의 한 종류'},
      {w: 'TOKEN', d: '토큰: 인증 상태를 유지하거나 권한을 부여하는 정보'},
      {w: 'PATCH', d: '패치: 소프트웨어의 취약점 수정이나 기능 개선을 위한 업데이트'},
      {w: 'PHISH', d: '피싱: 가짜 사이트/메시지로 개인정보를 탈취하는 공격'},
      {w: 'ADMIN', d: '관리자: 시스템을 관리/운영하는 권한을 가진 사용자'},
      {w: 'MALIC', d: '악성 (malic): 악성코드와 관련된 약어 또는 키워드 (예시)'}
    ],
    6: [
      {w: 'CIPHER', d: '암호 방식: 데이터를 암호화/복호화하는 알고리즘'},
      {w: 'BREACH', d: '데이터 유출: 허가되지 않은 데이터 공개/유출 사건'},
      {w: 'EXPLOI', d: 'Exploit: 취약점을 이용하는 공격 코드 (축약 예)'}
    ]
  };

  // UI 요소
  const gridEl = document.getElementById('grid');
  const keyboardEl = document.getElementById('keyboard');
  const startBtn = document.getElementById('startBtn');
  const lengthSel = document.getElementById('length');
  const attemptsSel = document.getElementById('attempts');
  const messageEl = document.getElementById('message');
  const defBox = document.getElementById('definition');
  const termTitle = document.getElementById('termTitle');
  const termDesc = document.getElementById('termDesc');
  const hintBtn = document.getElementById('hintBtn');

  let wordLength = parseInt(lengthSel.value, 10);
  let maxAttempts = parseInt(attemptsSel.value, 10);
  let answer = '';
  let answerDesc = '';
  let attempt = 0;
  let grid = []; // 2D array of letters
  let currentCol = 0;
  let gameOver = false;

  // 키보드 레이아웃 (영문)
  const KEY_ROWS = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    ['Enter', ...'ZXCVBNM'.split(''), 'Back']
  ];

  function pickRandomWord(len) {
    const list = DICTIONARY[len] || [];
    if (!list.length) return {w: 'ERROR', d: '단어 목록 없음'};
    const n = Math.floor(Math.random() * list.length);
    return list[n];
  }

  function initGrid() {
    gridEl.innerHTML = '';
    grid = [];
    for (let r = 0; r < maxAttempts; r++) {
      const row = document.createElement('div');
      row.className = 'row';
      const rowArr = [];
      for (let c = 0; c < wordLength; c++) {
        const cell = document.createElement('div');
        cell.className = 'tile';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.textContent = '';
        row.appendChild(cell);
        rowArr.push(cell);
      }
      gridEl.appendChild(row);
      grid.push(rowArr);
    }

    // grid columns define width
    gridEl.style.gridTemplateColumns = `repeat(${wordLength}, ${getComputedStyle(document.documentElement).getPropertyValue('--tile-size')})`;
  }

  function initKeyboard() {
    keyboardEl.innerHTML = '';
    KEY_ROWS.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'key-row';
      row.forEach(k => {
        const key = document.createElement('div');
        key.className = 'key';
        if (k === 'Enter' || k === 'Back') key.classList.add('wide');
        key.textContent = k;
        key.dataset.key = k;
        key.addEventListener('click', () => handleKey(k));
        rowDiv.appendChild(key);
      });
      keyboardEl.appendChild(rowDiv);
    });
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function startGame() {
    // 설정 초기화
    wordLength = parseInt(lengthSel.value, 10);
    maxAttempts = parseInt(attemptsSel.value, 10);
    const picked = pickRandomWord(wordLength);
    answer = picked.w.toUpperCase();
    answerDesc = picked.d;
    attempt = 0;
    currentCol = 0;
    gameOver = false;
    defBox.hidden = true;
    setMessage(`새 게임: ${wordLength}글자 단어. 시도 ${maxAttempts}회. 시작하세요!`);
    initGrid();
    initKeyboard();
    // focus를 위해 keydown 리스너 활성
    document.addEventListener('keydown', onPhysicalKey);
  }

  function onPhysicalKey(e) {
    if (gameOver) return;
    const k = e.key;
    if (k === 'Enter') handleKey('Enter');
    else if (k === 'Backspace') handleKey('Back');
    else {
      const ch = k.toUpperCase();
      if (/^[A-Z]$/.test(ch)) handleKey(ch);
    }
  }

  function handleKey(k) {
    if (gameOver) return;
    if (k === 'Enter') submitGuess();
    else if (k === 'Back') backspace();
    else if (/^[A-Z]$/.test(k)) addLetter(k);
  }

  function addLetter(letter) {
    if (currentCol >= wordLength) return;
    const cell = grid[attempt][currentCol];
    cell.textContent = letter;
    currentCol++;
  }

  function backspace() {
    if (currentCol === 0) return;
    currentCol--;
    const cell = grid[attempt][currentCol];
    cell.textContent = '';
  }

  function submitGuess() {
    if (currentCol !== wordLength) {
      setMessage('단어가 완성되지 않았습니다.');
      return;
    }
    const guess = grid[attempt].map(c => c.textContent).join('');
    if (!/^[A-Z]+$/.test(guess) || guess.length !== wordLength) {
      setMessage('유효한 단어를 입력하세요.');
      return;
    }
    // Wordle 스타일 채점 (green first, then yellow with counts)
    const result = gradeGuess(guess, answer);
    // 적용 및 키보드 색상 변경
    applyResultToGrid(result);
    colorKeyboard(result);

    if (guess === answer) {
      win();
      return;
    }

    attempt++;
    currentCol = 0;
    if (attempt >= maxAttempts) {
      lose();
    } else {
      setMessage(`${attempt} / ${maxAttempts} 시도 사용`);
    }
  }

  function gradeGuess(guess, answerStr) {
    const res = new Array(wordLength).fill('absent'); // absent / present / correct
    const answerArr = answerStr.split('');
    const guessArr = guess.split('');

    // 1) correct
    for (let i = 0; i < wordLength; i++) {
      if (guessArr[i] === answerArr[i]) {
        res[i] = 'correct';
        answerArr[i] = null; // 사용 처리
        guessArr[i] = null;
      }
    }
    // 2) present (yellow) - consider counts
    for (let i = 0; i < wordLength; i++) {
      if (guessArr[i] == null) continue;
      const idx = answerArr.indexOf(guessArr[i]);
      if (idx !== -1) {
        res[i] = 'present';
        answerArr[idx] = null;
      }
    }
    return { guess, res, letters: guess.split('') };
  }

  function applyResultToGrid(result) {
    const row = grid[attempt];
    for (let i = 0; i < wordLength; i++) {
      const tile = row[i];
      const cls = result.res[i] === 'correct' ? 'green' :
                  result.res[i] === 'present' ? 'yellow' : 'gray';
      tile.classList.add(cls);
      // small animation
      tile.style.transform = 'scale(1.03)';
      setTimeout(() => tile.style.transform = '', 150);
    }
  }

  function colorKeyboard(result) {
    result.letters.forEach((ch, i) => {
      const state = result.res[i];
      // find key element text match
      const keys = keyboardEl.querySelectorAll('.key');
      keys.forEach(k => {
        if (k.dataset.key === ch) {
          // prioritize green > yellow > gray
          if (state === 'correct') {
            k.classList.remove('yellow','gray'); k.classList.add('green');
          } else if (state === 'present') {
            if (!k.classList.contains('green')) { k.classList.remove('gray'); k.classList.add('yellow'); }
          } else {
            if (!k.classList.contains('green') && !k.classList.contains('yellow')) k.classList.add('gray');
          }
        }
      });
    });
  }

  function win() {
    gameOver = true;
    setMessage(`정답입니다! (${answer})`);
    showDefinition(answer, answerDesc);
    document.removeEventListener('keydown', onPhysicalKey);
  }

  function lose() {
    gameOver = true;
    setMessage(`실패했습니다. 정답: ${answer}`);
    showDefinition(answer, answerDesc);
    document.removeEventListener('keydown', onPhysicalKey);
  }

  function showDefinition(term, desc) {
    termTitle.textContent = term;
    termDesc.textContent = desc;
    defBox.hidden = false;
  }

  // 힌트: 한 글자 공개 (아직 공개되지 않은 위치 중 하나)
  function revealHint() {
    if (gameOver) return;
    // find unrevealed positions in any future rows
    const unrevealed = [];
    for (let i = 0; i < wordLength; i++) {
      // check whether letter already revealed as correct in any previous row
      let revealed = false;
      for (let r = 0; r <= attempt; r++) {
        const tile = grid[r][i];
        if (tile && tile.classList.contains('green')) { revealed = true; break; }
      }
      if (!revealed) unrevealed.push(i);
    }
    if (!unrevealed.length) { setMessage('더 이상 힌트가 없습니다.'); return; }
    const pos = unrevealed[Math.floor(Math.random()*unrevealed.length)];
    // display hint in current attempt row if empty cell else show in next empty row's cell visually as gray letter (non-submittable)
    const targetRow = grid[attempt];
    if (targetRow[pos].textContent === '') {
      targetRow[pos].textContent = answer[pos];
      currentCol = Math.min(wordLength, currentCol + 1);
    } else {
      // 그냥 알림
      setMessage(`힌트: ${pos+1}번째 글자는 '${answer[pos]}' 입니다.`);
    }
  }

  // 이벤트 바인딩
  startBtn.addEventListener('click', startGame);
  hintBtn.addEventListener('click', revealHint);

  // 초기 시작
  startGame();

  // 안전: 페이지 unload 시 리스너 제거
  window.addEventListener('beforeunload', () => {
    document.removeEventListener('keydown', onPhysicalKey);
  });

})();
