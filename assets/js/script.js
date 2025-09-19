/*
  Client‑side JavaScript for DC Performance Coaching (modified)

  This script preserves all original interactive behaviours (responsive
  mobile navigation, scroll‑based header hiding, reveal animations,
  animated counters and hero video muting) while adding a timed hide
  feature for the navigation bar and a hover indicator to bring it
  back.  After a short delay on page load the header slides up out of
  view.  A slim gold bar appears at the top of the page with a
  downward arrow, inviting users to hover to reveal the menu.  Moving
  the mouse over either the indicator or the hidden header makes the
  navigation visible again.  All other functions remain identical to
  the original implementation.
*/

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('nav ul');

  // Mobile navigation toggle
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Create the header indicator bar.  The arrow icon is added via CSS
  // using the ::after pseudo element.  Text prompts the user to hover
  // for the menu.
  const headerIndicator = document.createElement('div');
  headerIndicator.id = 'header-indicator';
  headerIndicator.textContent = 'Menu';
  document.body.appendChild(headerIndicator);

  // Hide/show header on scroll.  This remains unchanged from the
  // original implementation, but we also toggle the indicator based on
  // the header's visibility.
  let lastScrollY = window.pageYOffset;
  window.addEventListener('scroll', () => {
    const currentY = window.pageYOffset;
    if (currentY > lastScrollY && currentY > 100) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScrollY = currentY;
    // Show or hide the indicator depending on header state
    if (header.classList.contains('hidden')) {
      headerIndicator.classList.add('active');
    } else {
      headerIndicator.classList.remove('active');
    }
  });

  // After a delay, hide the header and show the indicator.  A delay of
  // 4000ms (~4 seconds) gives users time to see the navigation when
  // they first arrive.
  setTimeout(() => {
    header.classList.add('hidden');
    headerIndicator.classList.add('active');
  }, 4000);

  // Reveal the header when hovering over the indicator bar
  headerIndicator.addEventListener('mouseenter', () => {
    header.classList.remove('hidden');
    headerIndicator.classList.remove('active');
  });

  // Also reveal the header when hovering over the header itself.  This
  // allows the user to move the mouse directly to the top of the page.
  header.addEventListener('mouseenter', () => {
    header.classList.remove('hidden');
    headerIndicator.classList.remove('active');
  });

  // Optionally collapse the header again when the mouse leaves the
  // header if the user has scrolled down.  This prevents flicker
  // at the very top of the page.
  header.addEventListener('mouseleave', () => {
    if (window.pageYOffset > 100) {
      header.classList.add('hidden');
      headerIndicator.classList.add('active');
    }
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
  const introVideo = document.querySelector('.page-home .hero video');
  if (introVideo) {
    // Ensure the video is unmuted initially so that sound plays when the
    // page loads.  Some browsers may override this depending on their
    // autoplay policies.
    introVideo.muted = false;
    // Create an IntersectionObserver to watch when the hero section is in
    // the viewport.  When it leaves the viewport, mute the video; when it
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