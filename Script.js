// ============================================================
// CONFIG
// Get your free access key from:
// https://web3forms.com
//
// IMPORTANT:
// This is a frontend/static website, so this key WILL be
// visible to users in the browser. That is expected for
// Web3Forms client-side usage.
// ============================================================
const WEB3FORMS_ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY_HERE";

// ---------- Ambient floating hearts (runs on every page) ----------
function spawnFloatingHearts(count = 16) {
  const bg = document.querySelector(".hearts-bg");
  if (!bg) return;

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement("div");
    wrap.className = "floating-heart-wrap";

    const left = Math.random() * 100;
    const duration = 9 + Math.random() * 10;
    const delay = Math.random() * 12;
    const scale = 0.5 + Math.random() * 1.5;

    wrap.style.left = left + "vw";
    wrap.style.animationDuration = duration + "s";
    wrap.style.animationDelay = delay + "s";
    wrap.style.transform = `scale(${scale})`;

    const heart = document.createElement("div");
    heart.className = "heart-shape";

    wrap.appendChild(heart);
    bg.appendChild(wrap);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  spawnFloatingHearts();

  // ==========================================================
  // INDEX PAGE: Yes / No logic
  // ==========================================================
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const dodgeZone = document.getElementById("dodgeZone");

  if (yesBtn && noBtn && dodgeZone) {
    const dodge = () => {
      const zoneRect = dodgeZone.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();

      const maxX = Math.max(0, zoneRect.width - btnRect.width);
      const maxY = Math.max(0, zoneRect.height - btnRect.height);

      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;

      noBtn.style.left = newX + "px";
      noBtn.style.top = newY + "px";
      noBtn.style.transform = "none";
    };

    // Desktop: dodge on hover.
    noBtn.addEventListener("mouseenter", dodge);

    // Mobile: dodge before the click can land.
    noBtn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        dodge();
      },
      { passive: false }
    );

    yesBtn.addEventListener("click", () => {
      yesBtn.classList.add("grow");
      noBtn.classList.add("shrink");

      sessionStorage.setItem("brownieAnswer", "Yes 💕");

      setTimeout(() => {
        window.location.href = "details.html";
      }, 650);
    });
  }

  // ==========================================================
  // DETAILS PAGE: Form submit
  // ==========================================================
  const detailsForm = document.getElementById("detailsForm");

  if (detailsForm) {
    const statusMsg = document.getElementById("statusMsg");
    const submitBtn = document.getElementById("submitBtn");

    detailsForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // --------------------------------------------------------
      // Honeypot spam protection
      // --------------------------------------------------------
      const botcheck = detailsForm.querySelector(
        'input[name="botcheck"]'
      );

      if (botcheck && botcheck.checked) {
        // Silently ignore bot submissions.
        return;
      }

      // --------------------------------------------------------
      // Prevent accidental double submission
      // --------------------------------------------------------
      if (submitBtn.disabled) {
        return;
      }

      const timeField = document.getElementById("timeField");
      const locationField = document.getElementById("locationField");

      const time = timeField.value;
      const location = locationField.value.trim();
      const answer =
        sessionStorage.getItem("brownieAnswer") || "Yes 💕";

      // --------------------------------------------------------
      // Basic validation
      // --------------------------------------------------------
      if (!time || !location) {
        statusMsg.textContent =
          "Time aur location dono bharni padengi na 🙄";
        return;
      }

      // --------------------------------------------------------
      // Save locally so thanks.html can show the recap
      // --------------------------------------------------------
      sessionStorage.setItem("brownieTime", time);
      sessionStorage.setItem("brownieLocation", location);

      // --------------------------------------------------------
      // Lock button while request is running
      // --------------------------------------------------------
      submitBtn.disabled = true;
      statusMsg.textContent = "Bhej rahe hain...";

      // --------------------------------------------------------
      // Web3Forms payload
      // --------------------------------------------------------
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,

        subject: "Brownie ka jawab aa gaya 💌",
        from_name: "Brownie Invite Site",

        Jawab: answer,
        Time: time,
        Location: location,

        // Web3Forms honeypot
        botcheck: botcheck ? botcheck.checked : false
      };

      try {
        const res = await fetch(
          "https://api.web3forms.com/submit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        const data = await res.json();

        // HTTP/API response failed
        if (!res.ok || !data.success) {
          throw new Error(
            data.message || "Form submission failed"
          );
        }

        // ------------------------------------------------------
        // Success
        // ------------------------------------------------------
        statusMsg.textContent = "Ho gaya 💌";

        setTimeout(() => {
          window.location.href = "thanks.html";
        }, 350);

      } catch (err) {
        // ------------------------------------------------------
        // Failure
        // ------------------------------------------------------
        console.warn("Web3Forms submission failed:", err);

        submitBtn.disabled = false;

        statusMsg.textContent =
          "Oops 😭 message nahi gaya. Ek baar phir try kar.";
      }
    });
  }

  // ==========================================================
  // THANKS PAGE: show recap
  // ==========================================================
  const recapEl = document.getElementById("recap");

  if (recapEl) {
    const time = sessionStorage.getItem("brownieTime");
    const location = sessionStorage.getItem("brownieLocation");

    if (time && location) {
      recapEl.textContent =
        `Fix hai: ${location} pe, ${time} baje 🕒`;
    }
  }
});
