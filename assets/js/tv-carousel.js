// Simple vertical carousel: channel up/down, autoplay, keyboard, swipe
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("channelList");
  const screen = document.getElementById("tvScreen");
  const prev = document.getElementById("tvPrev");
  const next = document.getElementById("tvNext");
  if (!list || !screen) return;

  const items = Array.from(list.children);
  let idx = 0;
  let autoplay = true;
  let timer = null;
  const interval = 6000;

  function update() {
    // Use percentage translate so layout is independent from pixel height
    list.style.transform = `translateY(-${idx * 100}%)`;
    // aria-live: announce current channel title
    const title = items[idx].querySelector("h3")?.textContent || `Channel ${idx+1}`;
    screen.setAttribute("aria-label", title);
  }

  function go(n) {
    idx = (n + items.length) % items.length;
    update();
  }
  function nextChannel() { go(idx + 1); }
  function prevChannel() { go(idx - 1); }

  // controls
  if (next) next.addEventListener("click", () => { nextChannel(); resetTimer(); });
  if (prev) prev.addEventListener("click", () => { prevChannel(); resetTimer(); });

  // keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { nextChannel(); resetTimer(); }
    if (e.key === "ArrowUp") { prevChannel(); resetTimer(); }
  });

  // autoplay handling
  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => { if (autoplay) nextChannel(); }, interval);
  }
  function resetTimer() { autoplay = true; startTimer(); }

  // pause on hover/focus
  screen.addEventListener("mouseenter", () => autoplay = false);
  screen.addEventListener("mouseleave", () => autoplay = true);
  screen.addEventListener("focusin", () => autoplay = false);
  screen.addEventListener("focusout", () => autoplay = true);

  // handle resize: re-run update so transforms still align visually
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(update, 100);
  });

  // simple touch swipe vertical
  let startY = null;
  screen.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; autoplay = false; }, {passive:true});
  screen.addEventListener("touchend", (e) => {
    if (startY === null) return;
    const endY = (e.changedTouches && e.changedTouches[0].clientY) || 0;
    const diff = startY - endY;
    if (Math.abs(diff) > 30) {
      if (diff > 0) nextChannel(); else prevChannel();
    }
    startY = null;
    autoplay = true;
    resetTimer();
  });

  // initialize
  update();
  startTimer();
});