// ============================================================
// CONFIG — replace with your own free Web3Forms access key
// Get one at https://web3forms.com (30 sec signup, no backend needed)
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

  // ---------- INDEX PAGE: Yes / No logic ----------
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const dodgeZone = document.getElementById("dodgeZone");

  if (yesBtn && noBtn && dodgeZone) {
    const dodge = () => {
      const zoneRect = dodgeZone.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();
      const maxX = zoneRect.width - btnRect.width;
      const maxY = zoneRect.height - btnRect.height;
      const newX = Math.max(0, Math.random() * maxX);
      const newY = Math.max(0, Math.random() * maxY);
      noBtn.style.left = newX + "px";
      noBtn.style.top = newY + "px";
      noBtn.style.transform = "none";
    };

    // Desktop: dodge on hover. Mobile: dodge on touch, before a click can land.
    noBtn.addEventListener("mouseenter", dodge);
    noBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      dodge();
    }, { passive: false });

    yesBtn.addEventListener("click", () => {
      yesBtn.classList.add("grow");
      noBtn.classList.add("shrink");
      sessionStorage.setItem("brownieAnswer", "Yes 💕");
      setTimeout(() => {
        window.location.href = "details.html";
      }, 650);
    });
  }

  // ---------- DETAILS PAGE: form submit ----------
  const detailsForm = document.getElementById("detailsForm");
  if (detailsForm) {
    const statusMsg = document.getElementById("statusMsg");
    const submitBtn = document.getElementById("submitBtn");

    detailsForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const time = document.getElementById("timeField").value;
      const location = document.getElementById("locationField").value.trim();
      const answer = sessionStorage.getItem("brownieAnswer") || "Yes 💕";

      if (!time || !location) {
        statusMsg.textContent = "Time aur location dono bharni padengi na 🙄";
        return;
      }

      sessionStorage.setItem("brownieTime", time);
      sessionStorage.setItem("brownieLocation", location);

      submitBtn.disabled = true;
      statusMsg.textContent = "Bhej rahe hain...";

      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: "Brownie ka jawab aa gaya 💌",
        from_name: "Brownie Invite Site",
        Jawab: answer,
        Time: time,
        Location: location,
      };

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Send failed");
      } catch (err) {
        // Even if the email fails to send (e.g. key not set yet), don't block the flow —
        // the details are still saved locally for this session.
        console.warn("Notification send failed:", err);
      }

      window.location.href = "thanks.html";
    });
  }

  // ---------- THANKS PAGE: show recap ----------
  const recapEl = document.getElementById("recap");
  if (recapEl) {
    const time = sessionStorage.getItem("brownieTime");
    const location = sessionStorage.getItem("brownieLocation");
    if (time && location) {
      recapEl.textContent = `Fix hai: ${location} pe, ${time} baje 🕒`;
    }
  }
});