document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  /* ==========================================================================
     Custom Cursor Logic
     ========================================================================== */
  const cursor = document.getElementById("customCursor");
  const cursorDot = document.getElementById("customCursorDot");

  if (cursor && cursorDot) {
    document.addEventListener("mousemove", (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.set(cursorDot, {
        x: e.clientX,
        y: e.clientY,
      });
    });

    const hoverElements = document.querySelectorAll(
      "button, a, input, select, textarea, .radio-card, .gate-lock-prompt",
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("hovered");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hovered");
      });
    });
  }

  // Prevent scrolling before gates are opened
  /* ==========================================================================
   Smooth Scroll (Lenis) Integration
   ========================================================================== */
  const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: "vertical",
    gestureDirection: "vertical",
    smoothWheel: true,
    smoothTouch: false,
    mouseMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Disable scrolling initially
  let gatesOpened = false;

  lenis.stop();
  document.body.style.overflow = "hidden";

  // Sync GSAP + Lenis
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Scroll to the hero gates section immediately after Lenis is ready
  setTimeout(() => {
    lenis.scrollTo("#heroSec", {
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      immediate: true, // Ensures it goes directly without animation if needed
    });
  }, 300); // Small delay to ensure Lenis and DOM are fully ready

  /* ==========================================================================
     Background Music Handlers
     ========================================================================== */
  const bgMusic = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicBars = document.getElementById("musicBars");
  let isMuted = true;

  if (bgMusic) {
    bgMusic.volume = 0.35;
  }

  function playMusic() {
    if (bgMusic && isMuted) {
      bgMusic
        .play()
        .then(() => {
          isMuted = false;
          musicToggle.classList.add("playing");
        })
        .catch((err) => {
          console.log(
            "Audio play blocked by browser autoplay rules. Will wait for user click.",
          );
        });
    }
  }

  function pauseMusic() {
    if (bgMusic && !isMuted) {
      bgMusic.pause();
      isMuted = true;
      musicToggle.classList.remove("playing");
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      if (isMuted) {
        if (bgMusic) {
          bgMusic.play();
          isMuted = false;
          musicToggle.classList.add("playing");
        }
      } else {
        pauseMusic();
      }
    });
  }

  /* ==========================================================================
     Gates Interactive 3D Opening & Scroll Zoom Sequence
     ========================================================================== */
  const beginBtn = document.getElementById("beginBtn");
  const introOverlay = document.getElementById("introOverlay");
  const gateLockBtn = document.getElementById("gateLockBtn");
  const gateDoorLeft = document.getElementById("gateDoorLeft");
  const gateDoorRight = document.getElementById("gateDoorRight");
  const gateCoupleBg = document.getElementById("gateCoupleBg");
  const heroScrollPrompt = document.getElementById("heroScrollPrompt");
  const scrollContainer = document.getElementById("scrollContainer");

  // Stage 1: Reveal closed gates
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      introOverlay.classList.add("fade-out");
      playMusic();
    });
  }

  // Stage 2: Swing Gates Open (Manual Interaction trigger)
  function openGates() {
    if (gateLockBtn.classList.contains("hidden")) return;

    // Play music if not already playing
    if (bgMusic && isMuted) {
      bgMusic.play();
      isMuted = false;
      if (musicToggle) musicToggle.classList.add("playing");
    }

    // Hide center handle button
    gateLockBtn.classList.add("hidden");

    // Mark gates as opened to allow scrolling
    gatesOpened = true;

    document.body.style.overflow = "";
    lenis.start();

    // Swing doors open in 3D
    gsap.to(gateDoorLeft, {
      rotateY: -95,
      duration: 1.8,
      ease: "power2.inOut",
    });

    gsap.to(gateDoorRight, {
      rotateY: 95,
      duration: 1.8,
      ease: "power2.inOut",
    });

    // Subtly clear the background blur
    gsap.to(gateCoupleBg, {
      filter: "blur(6px)",
      duration: 1.8,
      ease: "power2.inOut",
    });

    setTimeout(() => {
      scrollContainer.classList.add("unlocked");
      gsap.to(heroScrollPrompt, { opacity: 1, duration: 0.8 });

      // Show invite card only after gates open              // ← ADD
      gsap.to("#gateInviteCard", {
        // ← ADD
        opacity: 1, // ← ADD
        scale: 1, // ← ADD
        duration: 0.8, // ← ADD
        ease: "power2.out", // ← ADD
      }); // ← ADD
    }, 900);
  }

  if (gateLockBtn) {
    gateLockBtn.addEventListener("click", openGates);
  }

  /* ==========================================================================
     GSAP ScrollTrigger: Zoom Inside Pinned Gates
     ========================================================================== */

  // Create a scroll animation that pins the viewport and zooms in
  gsap.set("#gateInviteCard", { opacity: 0, scale: 0.95 }); // ← ADD at the top, near other gsap.set calls

  const zoomTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#heroSec",
      start: "top top",
      end: "+=500",
      scrub: 0.6,
      pin: true,
      anticipatePin: 0.5,
      onEnter: () => {
        if (!gatesOpened) return; // ← GUARD
        gsap.to("#gateInviteCard", {
          // ← to() not set()
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        });
      },
      onEnterBack: () => {
        // ← ADD: scrolling back up into heroSec
        gsap.to("#gateInviteCard", {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        });
        gsap.to(heroScrollPrompt, { opacity: 1, duration: 0.4 });
      },
      onLeaveBack: () => {
        const heroSec = document.getElementById("heroSec");
        heroSec.style.opacity = "";
        heroSec.style.visibility = "";
        heroSec.style.pointerEvents = "";
        gsap.to(heroScrollPrompt, { opacity: 1, duration: 0.4 });
      },
    },
  });

  zoomTimeline
    .to(
      "#gateWrapper",
      {
        scale: 5,
        opacity: 0,
        ease: "power1.in",
      },
      0,
    )
    .to(
      gateCoupleBg,
      {
        filter: "blur(0px)",
        scale: 1.15,
        ease: "power1.out",
      },
      0,
    )
    // ❌ REMOVE the #gateInviteCard .to() block entirely
    .to(
      ".flower-corner",
      {
        opacity: 0.15,
        ease: "power1.out",
      },
      0,
    )
    // ❌ REMOVE the heroScrollPrompt .to() block entirely
    .to(
      "#heroSec",
      {
        opacity: 0,
        ease: "power1.in",
        onComplete: () => {
          const heroSec = document.getElementById("heroSec");
          heroSec.style.visibility = "hidden";
          heroSec.style.pointerEvents = "none";
        },
        onReverseComplete: () => {
          const heroSec = document.getElementById("heroSec");
          heroSec.style.visibility = "";
          heroSec.style.pointerEvents = "";

          // Restore scroll prompt when scrolling back up
          gsap.to(heroScrollPrompt, { opacity: 1, duration: 0.4 }); // ← ADD
        },
      },
      0.6,
    );

  /* ==========================================================================
     Content Sections Reveal Triggers
     ========================================================================== */
  const introTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#introSec",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });

  introTl
    .from(".gold-monogram-small", { opacity: 0, y: 20, duration: 0.8 })
    .from(".section-subtitle", { opacity: 0, y: 15, duration: 0.6 }, "-=0.5")
    .from(
      ".quote-text",
      { opacity: 0, y: 30, duration: 1, ease: "power3.out" },
      "-=0.4",
    )
    .from(".intro-join", { opacity: 0, y: 15, duration: 0.6 }, "-=0.6")
    .from(".bride-name", { opacity: 0, x: -30, duration: 0.8 }, "-=0.4")
    .from(".and-symbol", { opacity: 0, scale: 0.5, duration: 0.8 }, "-=0.6")
    .from(".groom-name", { opacity: 0, x: 30, duration: 0.8 }, "-=0.8")
    .from(".intro-families", { opacity: 0, y: 20, duration: 0.8 }, "-=0.4")
    .from(
      ".gold-divider",
      { scaleX: 0, duration: 1, ease: "power2.inOut" },
      "-=0.3",
    );

  gsap.from("#storySec .story-content-wrapper > *", {
    scrollTrigger: {
      trigger: "#storySec",
      start: "top 75%",
    },
    opacity: 0,
    y: 35,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
    onComplete: () => {
      document.querySelector(".story-image-wrapper").classList.add("revealed");
    },
  });

  const detailsTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#detailsSec",
      start: "top 75%",
    },
  });

  detailsTl
    .from("#detailsSec .section-subtitle", { opacity: 0, y: 15, duration: 0.6 })
    .from(
      "#detailsSec .section-title",
      { opacity: 0, y: 20, duration: 0.8 },
      "-=0.4",
    )
    .from(
      ".details-card",
      {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
      },
      "-=0.4",
    )
    .from(
      ".info-banner",
      {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.3",
    );

  const timelineItems = document.querySelectorAll(".timeline-item");
  timelineItems.forEach((item) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        onEnter: () => item.classList.add("revealed"),
      },
    });
  });

  gsap.from("#monogramShimmer", {
    scrollTrigger: {
      trigger: "#monogramSec",
      start: "top 80%",
    },
    opacity: 0,
    scale: 0.9,
    y: 30,
    duration: 1.5,
    ease: "power3.out",
  });

  gsap.from(".gallery-item", {
    scrollTrigger: {
      trigger: "#gallerySec",
      start: "top 75%",
    },
    opacity: 0,
    y: 40,
    scale: 0.98,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out",
  });

  /* ==========================================================================
     Countdown Timer Logic (July 4, 2026)
     ========================================================================== */
  const countdownDate = new Date("July 12, 2026 18:30:00").getTime();

  const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (num) => (num < 10 ? "0" + num : num);

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl) daysEl.innerHTML = pad(days >= 0 ? days : 0);
    if (hoursEl) hoursEl.innerHTML = pad(hours >= 0 ? hours : 0);
    if (minutesEl) minutesEl.innerHTML = pad(minutes >= 0 ? minutes : 0);
    if (secondsEl) secondsEl.innerHTML = pad(seconds >= 0 ? seconds : 0);

    if (distance < 0) {
      clearInterval(countdownInterval);
      const container = document.getElementById("countdownContainer");
      if (container) {
        container.innerHTML =
          "<div class='countdown-finished font-serif'>The Celebration Has Begun!</div>";
      }
    }
  }, 1000);

  /* ==========================================================================
     RSVP Interactive Form Functionality
     ========================================================================== */
  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpSuccess = document.getElementById("rsvpSuccess");
  const rsvpFields = document.getElementById("additionalFields");
  const successText = document.getElementById("successText");
  const resetRsvp = document.getElementById("resetRsvp");
  const attendanceRadios = document.querySelectorAll(
    'input[name="attendance"]',
  );

  attendanceRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "accept") {
        rsvpFields.classList.remove("collapsed");
        document.getElementById("dietary").setAttribute("required", "true");
      } else {
        rsvpFields.classList.add("collapsed");
        document.getElementById("dietary").removeAttribute("required");
      }
    });
  });

  const savedRsvp = localStorage.getItem("weddingRSVP");
  if (savedRsvp) {
    const data = JSON.parse(savedRsvp);
    showSuccessState(data.name, data.attendance);
  }
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById("submitBtn");
      const nameVal = document.getElementById("guestName").value;
      const attendanceVal = document.querySelector(
        'input[name="attendance"]:checked',
      ).value;
      const wishesVal = document.getElementById("guestWishes").value;

      submitBtn.disabled = true;
      gsap.to(submitBtn, { opacity: 0.7, scale: 0.95, duration: 0.2 });
      submitBtn.querySelector("span").innerText = "Sending...";

      setTimeout(() => {
        const rsvpData = {
          name: nameVal,
          attendance: attendanceVal,
          wishes: wishesVal,
        };

        // 1. Save data to localStorage locally
        localStorage.setItem("weddingRSVP", JSON.stringify(rsvpData));

        // 2. Prepare the payload structure for Google Sheets
        // Form data helps bypass typical CORS issues with Apps Script endpoints
        const formData = new FormData();
        formData.append("Name", nameVal);
        formData.append("Attendance", attendanceVal);
        formData.append("Wishes", wishesVal);

        // 3. Fire the request asynchronously to your Google Script Web App URL
        const scriptURL =
          "https://script.google.com/macros/s/AKfycbxpKtrXmtKtqNo7Dtn9tN-xplDpXGfPHYUwQL7c8I_zYq9-mvXdor27ASUV5ez399Dg/exec";

        fetch(scriptURL, {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            console.log("Success successfully logged to sheet!", response);
          })
          .catch((error) => {
            console.error("Error pushing data to sheet:", error);
            // Optional: Provide error fallback UI feedback here if network fails
          });

        // 4. Continue your native animation timelines immediately
        gsap.to(rsvpForm, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            rsvpForm.classList.add("hidden");
            rsvpSuccess.classList.remove("hidden");
            showSuccessState(nameVal, attendanceVal);
            submitBtn.disabled = false;
            submitBtn.querySelector("span").innerText = "Send Response";
            gsap.set(submitBtn, { opacity: 1, scale: 1 });
          },
        });
      }, 1200);
    });
  }

  function showSuccessState(name, attendance) {
    rsvpForm.classList.add("hidden");
    rsvpSuccess.classList.remove("hidden");

    if (attendance === "accept") {
      successText.innerHTML = `Dear <strong>${name}</strong>,<br>Thank you so much for your response! We’re absolutely delighted that you’ll be joining us at Jewel Elminya Hotel & Club. Your response has been successfully saved, and we truly look forward to welcoming you.`;
    } else {
      successText.innerHTML = `Dear <strong>${name}</strong>,<br>We are so sorry to hear you cannot make it, but we completely understand. You will be with us in spirit! Thank you for letting us know.`;
    }
  }

  if (resetRsvp) {
    resetRsvp.addEventListener("click", () => {
      localStorage.removeItem("weddingRSVP");

      gsap.to(rsvpSuccess, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          rsvpSuccess.classList.add("hidden");
          rsvpForm.classList.remove("hidden");
          gsap.set(rsvpSuccess, { opacity: 1 });
          gsap.fromTo(rsvpForm, { opacity: 0 }, { opacity: 1, duration: 0.5 });

          rsvpForm.reset();
          rsvpFields.classList.remove("collapsed");
        },
      });
    });
  }
});
