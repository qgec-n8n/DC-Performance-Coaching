/*
  DC Performance Coaching – Client‑side JavaScript

  This script powers small interactive behaviours throughout the
  website.  It handles the responsive navigation toggle, hides the
  header on downward scrolls and shows it on upward scrolls, reveals
  content panels when they enter the viewport and animates the
  statistics counters on the home page.  The code does not depend on
  any external libraries and will gracefully degrade if JavaScript is
  disabled.
*/

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('nav ul');

  // Mobile navigation toggle
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Hide/show header on scroll
  let lastScrollY = window.pageYOffset;
  window.addEventListener('scroll', () => {
    const currentY = window.pageYOffset;
    if (currentY > lastScrollY && currentY > 100) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScrollY = currentY;
  });

  // Reveal elements when they enter the viewport
  const observerOptions = {
    threshold: 0.15,
  };
  const revealCallback = (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  };
  const revealObserver = new IntersectionObserver(revealCallback, observerOptions);
  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  // Animate number counters
  const statCounters = document.querySelectorAll('.stat .number');
  const runCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value + (el.getAttribute('data-plus') ? '+' : '');
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };
  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const numbers = entry.target.querySelectorAll('.number');
        numbers.forEach(runCounter);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.stats').forEach((statsSection) => {
    statsObserver.observe(statsSection);
  });

  // Home page hero video muting behaviour
  //
  // On the home page the intro video should play with sound when it is
  // visible, but it should automatically mute when the user scrolls it out
  // of view.  This improves the user experience by preventing background
  // audio from playing while the visitor reads other sections of the page.
  const introVideo = document.querySelector('.page-home .hero video');
  if (introVideo) {
    // Ensure the video is unmuted initially so that sound plays when the
    // page loads.  Some browsers may override this depending on their
    // autoplay policies.
    introVideo.muted = false;
    // Create an IntersectionObserver to watch when the hero section is in the
    // viewport.  When it leaves the viewport, mute the video; when it
    // re‑enters, unmute.
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          introVideo.muted = false;
        } else {
          introVideo.muted = true;
        }
      });
    }, { threshold: 0.4 });
    videoObserver.observe(introVideo);
  }
});