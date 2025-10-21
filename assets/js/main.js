// Toggle menu mobile
const btn = document.getElementById("navToggle");
const menu = document.getElementById("navMenu");
btn.addEventListener("click", () => menu.classList.toggle("show"));

// Tutup menu jika klik link
menu.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => menu.classList.remove("show"));
});

// Scrollspy sederhana: beri .active pada link saat section tampak
const links = [...menu.querySelectorAll("a")];
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      const id = e.target.getAttribute("id");
      const link = links.find((l) => l.getAttribute("href") === `#${id}`);
      if (link) {
        if (e.isIntersecting) link.classList.add("active");
        else link.classList.remove("active");
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
);
// ========= OPEN/CLOSE MODAL + isi kategori dari tombol "Daftar" =========
const regModal = document.getElementById("regModal");
const regClose = document.getElementById("regClose");
const regForm = document.getElementById("regForm");
const regSuccess = document.getElementById("regSuccess");
const regCategorySpan = document.getElementById("regCategory");
const categoryInput = document.getElementById("categoryInput");

// Helper untuk membuka modal
function openRegModal(title) {
  regCategorySpan.textContent = title || "Event";
  categoryInput.value = title || "Event";

  regSuccess.hidden = true;
  regForm.reset();
  clearFieldStyles(regForm);

  regModal.classList.add("show");
  regModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("fullName")?.focus(), 0);
}

// Buka modal saat tombol "Daftar" diklik
document.querySelectorAll("#events .btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    // ambil judul kartu (nama event)
    const card = btn.closest(".card");
    const title = card?.querySelector("h3")?.textContent?.trim() || "Event";
    openRegModal(title);
  });
});

function closeModal() {
  regModal.classList.remove("show");
  regModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
regClose.addEventListener("click", closeModal);
regModal.addEventListener("click", (e) => {
  if (e.target === regModal) closeModal();
});

// Utilities
function setMsg(el, text, ok = false) {
  const wrap = el.closest(".field");
  const msg = wrap?.querySelector(".msg");
  if (!msg) return;
  msg.textContent = text || "";
  wrap?.classList.toggle("is-error", !!text);
  wrap?.classList.toggle("is-ok", !text && ok);
}
function clearFieldStyles(form) {
  form.querySelectorAll(".field").forEach((f) => {
    f.classList.remove("is-error", "is-ok");
    const m = f.querySelector(".msg");
    if (m) m.textContent = "";
  });
}

// ========= VALIDATION HELPERS (regex Indonesia) =========
const reName = /^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]{3,}$/; // huruf/spasi min 3
const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // email sederhana
const rePhone = /^(?:\+62|62|0)8[0-9]{8,11}$/; // format ID: 08/628/+628

// ========= VERSION A: HTML5 + customValidity =========
function handleSubmitA(e) {
  const phone = document.getElementById("phone");
  phone.setCustomValidity("");
  if (!rePhone.test(phone.value.trim())) {
    phone.setCustomValidity("Nomor WA harus 08… / +62… dan 10-14 digit total.");
  }
  if (!regForm.checkValidity()) {
    e.preventDefault();
    regForm.reportValidity();
    return;
  }
  e.preventDefault();
  regSuccess.hidden = false;
}

// ========= VERSION B: Custom + live validation =========
function liveValidateB() {
  const fields = ["fullName", "email", "phone", "agree"];
  const errors = {};

  const vName = document.getElementById("fullName");
  const vEmail = document.getElementById("email");
  const vPhone = document.getElementById("phone");
  const vAgree = document.getElementById("agree");

  // Nama
  if (!vName.value.trim()) errors.fullName = "Nama wajib diisi.";
  else if (!reName.test(vName.value.trim()))
    errors.fullName = "Minimal 3 huruf, tanpa angka.";
  // Email
  if (!vEmail.value.trim()) errors.email = "Email wajib diisi.";
  else if (!reEmail.test(vEmail.value.trim()))
    errors.email = "Format email tidak valid.";
  // Phone
  if (!vPhone.value.trim()) errors.phone = "Nomor WA wajib diisi.";
  else if (!rePhone.test(vPhone.value.trim()))
    errors.phone = "Gunakan 08… / +62… (contoh: 081234567890).";
  // Agree
  if (!vAgree.checked) errors.agree = "Centang persetujuan terlebih dahulu.";

  // Tampilkan pesan
  fields.forEach((id) => {
    const el = document.getElementById(id);
    const err = errors[id] || "";
    setMsg(el, err, !err && el.value);
  });

  return Object.keys(errors).length === 0;
}
function handleSubmitB(e) {
  e.preventDefault();
  if (liveValidateB()) {
    regSuccess.hidden = false;
    // TODO: kirim data via fetch() ke endpoint kamu
  }
}
// live feedback saat mengetik/ubah
["input", "change", "blur"].forEach((ev) => {
  regForm.addEventListener(
    ev,
    () => {
      if (VALIDATION_VERSION === "B") liveValidateB();
    },
    true
  );
});

// ========= VERSION C: Schema-driven =========
const schemaC = {
  fullName: {
    required: true,
    test: (v) => reName.test(v),
    msg: "Nama minimal 3 huruf, tanpa angka.",
  },
  email: {
    required: true,
    test: (v) => reEmail.test(v),
    msg: "Email tidak valid.",
  },
  phone: {
    required: true,
    test: (v) => rePhone.test(v),
    msg: "Nomor WA 08…/+62… (10–14 digit).",
  },
  agree: {
    required: true,
    test: (v) => v === true,
    msg: "Harus menyetujui syarat & ketentuan.",
  },
};
function validateBySchemaC() {
  let ok = true;
  for (const [id, rule] of Object.entries(schemaC)) {
    const el = document.getElementById(id);
    const val = el.type === "checkbox" ? el.checked : el.value.trim();
    let err = "";
    if (rule.required && (val === "" || val === false))
      err = "Field wajib diisi.";
    else if (rule.test && !rule.test(val)) err = rule.msg;
    setMsg(el, err, !err && !!val);
    if (err) ok = false;
  }
  return ok;
}
function handleSubmitC(e) {
  e.preventDefault();
  if (validateBySchemaC()) {
    regSuccess.hidden = false;
  }
}

// ========= Pasang handler sesuai versi =========
regForm.addEventListener("submit", (e) => {
  if (VALIDATION_VERSION === "A") return handleSubmitA(e);
  if (VALIDATION_VERSION === "B") return handleSubmitB(e);
  if (VALIDATION_VERSION === "C") return handleSubmitC(e);
});

regClose.addEventListener("click", closeModal);
regModal.addEventListener("click", (e) => {
  if (e.target === regModal) closeModal();
});

// ========= GUEST STAR MODAL =========
const guestStarModal = document.getElementById("guestStarModal");
const guestStarClose = document.getElementById("guestStarClose");

function openGuestStarModal() {
  guestStarModal.classList.add("show");
  guestStarModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGuestStarModal() {
  guestStarModal.classList.remove("show");
  guestStarModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

guestStarClose.addEventListener("click", closeGuestStarModal);
guestStarModal.addEventListener("click", (e) => {
  if (e.target === guestStarModal) closeGuestStarModal();
});

// Observasi section untuk scrollspy
document
  .querySelectorAll("header[id], section[id], footer[id]")
  .forEach((sec) => obs.observe(sec));

/* ================== VALIDATION MODE ==================
   "A" = HTML5 + custom validity minimal
   "B" = Validasi custom + live feedback (disarankan)
   "C" = Schema-driven (aturan di satu objek)
*/
const VALIDATION_VERSION = "B";
