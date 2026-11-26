/* =====================================================================
   interactions.js — the only JavaScript on the page.
   Scene 05 (the soldier's belongings):
     • stones: drag them anywhere; dropped inside the open tin they go
       back under the lid
     • tin: click = open / close, hold the mouse on the closed tin = shake
       (rattle sound only if a stone is inside)
     • pen: drag it anywhere; drop the nib on the letter = "i'm here"
       is written (and stays)
     • letter: once written, touching it smudges it (and it stays)
   Everything else on the site is HTML + CSS.
   Positions below are in the Figma frame of this scene (1440 x 1500).
   ===================================================================== */
(function () {
  "use strict";

  const scene = document.querySelector(".scene--belongings");
  if (!scene) return;
  const art = scene.querySelector(".art");
  const tinOpen = scene.querySelector("#tin-open");
  const rattle = document.getElementById("rattle-sound");

  /* --- helpers ------------------------------------------------------ */
  // keep receiving the mouse even if it leaves the element while held
  function capture(el, e) {
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* not needed */ }
  }

  // size of one Figma pixel on screen
  const figmaScale = () => art.clientWidth / 1440;

  // centre of an element, in Figma pixels of this scene
  function centreOf(el) {
    const s = figmaScale();
    return {
      x: (el.offsetLeft + el.offsetWidth / 2) / s,
      y: (el.offsetTop + el.offsetHeight / 2) / s,
    };
  }

  // is a point inside the (rotated) inside of the tin?
  const TIN = { x: 885, y: 602, halfW: 170, halfH: 112, angle: 15.09 };
  function insideTin(p) {
    const a = (-TIN.angle * Math.PI) / 180;
    const dx = p.x - TIN.x, dy = p.y - TIN.y;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    return Math.abs(rx) < TIN.halfW && Math.abs(ry) < TIN.halfH;
  }

  // where the letter can be written on (the front card)
  const LETTER = { left: 700, right: 1300, top: 820, bottom: 1290 };

  /* --- dragging ----------------------------------------------------- */
  // el moves; handle is what you grab. Positions are stored in % so the
  // layout keeps working when the window is resized.
  function makeDraggable(el, handle, onDrop) {
    let start = null;

    handle.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      capture(handle, e);
      start = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop };
      el.classList.add("is-dragging");
    });

    handle.addEventListener("pointermove", (e) => {
      if (!start) return;
      const left = start.left + (e.clientX - start.x);
      const top = start.top + (e.clientY - start.y);
      el.style.left = (left / art.clientWidth) * 100 + "%";
      el.style.top = (top / art.clientHeight) * 100 + "%";
    });

    const end = () => {
      if (!start) return;
      start = null;
      el.classList.remove("is-dragging");
      if (onDrop) onDrop(el);
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  /* --- stones ------------------------------------------------------- */
  const rocks = [...scene.querySelectorAll(".rock")];

  function updateStones() {
    scene.classList.toggle("has-stones", rocks.some((r) => r.classList.contains("in-box")));
  }

  rocks.forEach((rock) => {
    rock.classList.add("in-box");          // they start inside the tin
    makeDraggable(rock, rock, () => {
      // only an open tin can take a stone back
      const inBox = tinOpen.checked && insideTin(centreOf(rock));
      rock.classList.toggle("in-box", inBox);
      updateStones();
    });
  });
  updateStones();

  /* --- tin: click = open / close, hold = shake ------------------------ */
  const tinHit = scene.querySelector(".tin__hit");
  const HOLD_MS = 220;
  let holdTimer = null;
  let shaking = false;

  function startShake() {
    shaking = true;
    scene.classList.add("is-shaking");
    if (rattle && scene.classList.contains("has-stones")) {
      rattle.currentTime = 0;
      rattle.play().catch(() => {});      // no file yet = silently nothing
    }
  }
  function stopShake() {
    shaking = false;
    scene.classList.remove("is-shaking");
    if (rattle) rattle.pause();
  }

  tinHit.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    capture(tinHit, e);
    if (!tinOpen.checked) holdTimer = setTimeout(startShake, HOLD_MS);
  });
  tinHit.addEventListener("pointerup", () => {
    clearTimeout(holdTimer);
    if (shaking) stopShake();               // it was a hold: just stop
    else tinOpen.checked = !tinOpen.checked; // it was a click: open / close
  });
  tinHit.addEventListener("pointercancel", () => {
    clearTimeout(holdTimer);
    if (shaking) stopShake();
  });
  tinHit.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tinOpen.checked = !tinOpen.checked;
    }
  });

  /* --- pen: drop the nib on the letter to write ----------------------- */
  const pen = scene.querySelector(".pen");
  const penHit = scene.querySelector(".pen__hit");
  makeDraggable(pen, penHit, () => {
    const s = figmaScale();
    const nib = {                              // nib = 15% / 40.4% of the pen box
      x: (pen.offsetLeft + pen.offsetWidth * 0.15) / s,
      y: (pen.offsetTop + pen.offsetHeight * 0.404) / s,
    };
    if (nib.x > LETTER.left && nib.x < LETTER.right && nib.y > LETTER.top && nib.y < LETTER.bottom) {
      scene.classList.add("is-written");      // stays written
    }
  });

  /* --- letter: once written, touching it smudges it for good ---------- */
  scene.querySelector(".letter__hit").addEventListener("pointerenter", () => {
    if (scene.classList.contains("is-written")) scene.classList.add("is-smudged");
  });
})();
