document.addEventListener('DOMContentLoaded', () => {
  function openGuestModal(id) {
    const modal = document.getElementById(`guest-${id}-modal`);
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeGuestModalByElement(modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // expose function for inline onclick handlers
  window.openGuestModal = openGuestModal;
  window.closeGuestModal = (id) => {
    const m = document.getElementById(`guest-${id}-modal`);
    if (m) closeGuestModalByElement(m);
  };

  // close buttons
  document.querySelectorAll('.modal .modal__close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) closeGuestModalByElement(modal);
    });
  });

  // click overlay to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGuestModalByElement(modal);
    });
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(closeGuestModalByElement);
      document.body.style.overflow = '';
    }
  });
});
