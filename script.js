'use strict';

const CONFIG = {
  PASSWORD: '0609',
  TYPING_SPEED: 45,
  HEART_INTERVAL: 550,
  HEART_EMOJIS: ['💗', '💖', '💕', '🌸', '✨', '🌷', '💞'],
  MESSAGE: 'Chị yêu dấu, nhân ngày đặc biệt này, em chúc chị luôn xinh đẹp, rạng rỡ và hạnh phúc. Cảm ơn chị vì đã luôn là người chị tuyệt vời nhất của em. Mong mọi điều tốt đẹp nhất sẽ đến với chị! 🌷',
  BLESSINGS: [
    'Chúc chị luôn xinh đẹp và hạnh phúc 💗',
    'Mong chị mãi là ánh nắng dịu dàng của em 🌸',
    'Ước gì nụ cười chị luôn rạng rỡ như hôm nay ✨',
    'Chị là người em luôn yêu thương và tự hào 💖',
    'Chúc chị mọi điều tốt đẹp nhất trên đời 🌷'
  ],
  // Phần thưởng cho vòng quay
  WHEEL_PRIZES: [
    '1 cái ôm thật chặt 🤗',
    '1 tràng pháo tay 👏',
    '1 nụ hôn gió 😘',
    'Bữa ăn sáng tại chỗ 🍳',
    'Được sai em 1 việc 🤭',
    '1 món quà bí ẩn 🎁'
  ]
};

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const random = (n) => Math.floor(Math.random() * n);

/* ---------- TRÁI TIM BAY ---------- */
function spawnHeart() {
  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.textContent = CONFIG.HEART_EMOJIS[random(CONFIG.HEART_EMOJIS.length)];
  heart.style.left = random(100) + 'vw';
  heart.style.fontSize = (16 + random(22)) + 'px';
  const duration = 6 + Math.random() * 6;
  heart.style.animationDuration = duration + 's';
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}
function startHeartRain() {
  setInterval(spawnHeart, CONFIG.HEART_INTERVAL);
  for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 300);
}

/* ---------- MÀN HÌNH KHÓA SỐ ---------- */
const LockScreen = (() => {
  const loginScreen = $('#loginScreen');
  const cardScreen  = $('#cardScreen');
  const wheelScreen = $('#wheelScreen'); // Màn hình vòng quay
  const dotsWrap    = $('#dots');
  const dots        = $$('#dots .dot');
  const errorEl     = $('#error');
  const delBtn      = $('#delBtn');

  const MAX_LEN = CONFIG.PASSWORD.length;
  let entered = '';
  let wrongCount = 0; // Biến đếm số lần nhập sai
  let onSuccess = () => {};

  function renderDots() {
    dots.forEach((dot, i) => dot.classList.toggle('filled', i < entered.length));
  }
  function fail() {
    wrongCount++; // Tăng biến đếm khi sai
    
    errorEl.classList.add('show');
    dotsWrap.classList.add('shake');
    setTimeout(() => {
      dotsWrap.classList.remove('shake');
      entered = '';
      renderDots();
    }, 500);

    // Nếu sai 3 lần thì chuyển sang vòng quay
    if (wrongCount >= 3) {
      errorEl.textContent = "Sai 3 lần rồi! Nhận quà đền bù nhé 💔 -> 🎁";
      setTimeout(() => {
        loginScreen.style.display = 'none';
        wheelScreen.style.display = 'block';
      }, 1000); // Đợi 1 giây cho hiệu ứng rung xong rồi chuyển
    }
  }
  function success() {
    errorEl.classList.remove('show');
    for (let i = 0; i < 24; i++) setTimeout(spawnHeart, i * 40);
    setTimeout(() => {
      loginScreen.style.display = 'none';
      cardScreen.classList.add('is-active');
      onSuccess();
    }, 450);
  }
  function pressKey(key) {
    if (entered.length >= MAX_LEN) return;
    entered += key;
    renderDots();
    if (entered.length === MAX_LEN) {
      setTimeout(() => entered === CONFIG.PASSWORD ? success() : fail(), 180);
    }
  }
  function deleteKey() {
    entered = entered.slice(0, -1);
    renderDots();
    // Không xóa lỗi nếu đang trong trạng thái chờ vòng quay
    if (wrongCount < 3) errorEl.classList.remove('show');
  }
  function bindEvents() {
    $$('.key[data-k]').forEach((btn) => btn.addEventListener('click', () => pressKey(btn.dataset.k)));
    delBtn.addEventListener('click', deleteKey);
    document.addEventListener('keydown', (e) => {
      if (loginScreen.style.display === 'none') return;
      if (/^[0-9]$/.test(e.key)) pressKey(e.key);
      else if (e.key === 'Backspace') deleteKey();
    });
  }
  function init(callback) {
    onSuccess = callback;
    bindEvents();
  }
  return { init };
})();

/* ---------- VÒNG QUAY MAY MẮN ---------- */
const Wheel = (() => {
  const wheel = $('#wheel');
  const spinBtn = $('#spinBtn');
  const resultEl = $('#wheelResult');
  const goToCardBtn = $('#goToCardBtn');
  
  let isSpinning = false;
  const prizes = CONFIG.WHEEL_PRIZES;

  function spin() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.textContent = 'Đang quay... 🌀';
    spinBtn.style.pointerEvents = 'none';
    resultEl.classList.remove('show');
    
    // Chọn ngẫu nhiên 1 phần thưởng (0 đến 5)
    const prizeIndex = random(prizes.length);
    
    // Tính góc quay: Mỗi phần thưởng chiếm 60 độ.
    // Quay ít nhất 5 vòng (5*360 = 1800) + góc để chỉ đúng phần thưởng.
    // Đỉnh mũi tên hướng xuống dưới (tương đương 180 độ). Cần trừ đi 180 và 1 nửa góc.
    const baseSpins = 5 * 360;
    const segmentAngle = 60; 
    const targetAngle = baseSpins + (segmentAngle * prizeIndex) + (segmentAngle / 2); 

    // Thêm hiệu ứng âm thanh? (Không cần thiết)
    
    // Gán góc quay
    wheel.style.transform = `rotate(${targetAngle}deg)`;
    
    // Đợi 4 giây (bằng thời gian transition trong CSS) rồi hiển thị kết quả
    setTimeout(() => {
      isSpinning = false;
      spinBtn.textContent = 'Quay lại 🎡';
      spinBtn.style.pointerEvents = 'auto';
      
      resultEl.textContent = `Chị nhận được: ${prizes[prizeIndex]}!`;
      resultEl.classList.add('show');
      
      // Hiện nút mở thiệp
      goToCardBtn.style.display = 'inline-block';
      
      // Bắn tim chúc mừng
      for (let i = 0; i < 10; i++) setTimeout(spawnHeart, i * 50);
      
    }, 4100); // 4100ms để đảm bảo transition CSS (4s) chạy xong
  }

  function init() {
    spinBtn.addEventListener('click', spin);
    
    // Nút chuyển sang mở thiệp sau khi quay
    goToCardBtn.addEventListener('click', () => {
      $('#wheelScreen').style.display = 'none';
      const cardScreen = $('#cardScreen');
      cardScreen.classList.add('is-active');
      
      // Bắt đầu hiệu ứng gõ chữ trong thiệp
      Card.start(); 
    });
  }

  return { init };
})();

/* ---------- TẤM THIỆP & LÁ THƯ ---------- */
const Card = (() => {
  let isOpened = false;
  let typingEl, blessingEl, btn, wrapper, clickHint;

  function typeMessage() {
    let idx = 0;
    const message = CONFIG.MESSAGE;
    const typeChar = () => {
      if (idx < message.length) {
        typingEl.textContent += message[idx++];
        setTimeout(typeChar, CONFIG.TYPING_SPEED);
      } else {
        typingEl.innerHTML = typingEl.textContent + '<span class="cursor"></span>';
      }
    };
    typeChar();
  }

  function showBlessing() {
    let i = random(CONFIG.BLESSINGS.length);
    blessingEl.style.opacity = 0;
    setTimeout(() => {
      blessingEl.textContent = CONFIG.BLESSINGS[i];
      blessingEl.style.opacity = 1;
    }, 200);
  }

  function openCard() {
    if (isOpened) return;
    isOpened = true;
    
    wrapper.classList.add('open');
    clickHint.style.opacity = 0;
    
    setTimeout(() => {
      typeMessage();
    }, 400);

    for (let i = 0; i < 15; i++) setTimeout(spawnHeart, i * 50);
  }

  function bindEvents() {
    wrapper.addEventListener('click', openCard);
    btn.addEventListener('click', () => {
      showBlessing();
      btn.textContent = 'Gửi thêm yêu thương 💞';
      for (let i = 0; i < 10; i++) setTimeout(spawnHeart, i * 60);
    });
  }

  function start() {
    if (typingEl) return; // Nếu đã chạy rồi thì thôi
    typingEl   = $('#typing');
    blessingEl = $('#blessing');
    btn        = $('#btn');
    wrapper    = $('#cardWrapper');
    clickHint  = $('#clickHint');
    
    bindEvents();
  }

  return { start };
})();

/* ---------- KHỞI CHẠY ---------- */
startHeartRain();
LockScreen.init(() => Card.start());
Wheel.init();