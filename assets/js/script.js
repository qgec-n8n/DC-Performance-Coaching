/*
  Modified client-side JavaScript for DC Performance Coaching

  This file extends the existing interactive behaviours with a timed hide
  of the header and a custom hover indicator.  On page load the header
  (which contains the logo and navigation links) remains visible for a few
  seconds and then slides up out of view.  A small golden bar appears at
  the very top of the page to inform visitors that they can hover to
  reveal the navigation again.  Moving the mouse over either the bar
  itself or the header brings the navigation back into view.  We also
  inject some additional CSS rules to add spacing between paragraphs and
  constrain the size of education videos on the blog page.  This script
  retains all original functionality including scroll‑based header
  behaviour, reveal animations, counter animations and video muting.
*/

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('nav ul');

  // Create and append a style tag for global overrides.  This sets
  // paragraph spacing, constrains blog video widths and defines the
  // appearance of the header indicator bar.  Using injected CSS avoids
  // modifying the core stylesheet while ensuring our changes apply
  // consistently across every page.
  const globalStyle = document.createElement('style');
  globalStyle.textContent = `
    /* Add bottom margin to paragraphs so each paragraph is separated by a line break */
    p { margin-bottom: 1rem; }

    /* Reduce the maximum width of videos in the blog education section to
       prevent them from overflowing smaller screens.  They will scale
       responsively down to this width. */
    .blog-education-videos video {
      width: 100%;
      max-width: 400px;
      height: auto;
    }

    /* Style for the header indicator bar.  It sits fixed at the very
       top of the viewport and becomes visible only when the header is
       hidden.  The bar uses the brand gold colour with a slight
       transparency and contains a downward arrow to hint at hover
       functionality. */
    #header-indicator {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 1.5rem;
      background: rgba(245, 192, 0, 0.9);
      color: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      z-index: 1001;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      cursor: default;
    }
    #header-indicator::after {
      content: ' \25BC'; /* downwards black arrowhead */
      margin-left: 0.4rem;
    }
    #header-indicator.show {
      opacity: 1;
      pointer-events: auto;
      cursor: pointer;
    }
  `;
  document.head.appendChild(globalStyle);

  // Create the indicator element and append it to the body.  The text
  // invites the user to hover over the bar to reveal the navigation.
  const headerIndicator = document.createElement('div');
  headerIndicator.id = 'header-indicator';
  headerIndicator.textContent = 'Hover here to show menu';
  document.body.appendChild(headerIndicator);

  // Mobile navigation toggle remains unchanged.
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Keep track of the previous scroll position for header hide/show on scroll.
  let lastScrollY = window.pageYOffset;
  window.addEventListener('scroll', () => {
    const currentY = window.pageYOffset;
    if (currentY > lastScrollY && currentY > 100) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScrollY = currentY;
    // Whenever the header changes visibility due to scrolling, toggle
    // the indicator accordingly.  When the header is hidden show the
    // indicator; otherwise hide it.
    if (header.classList.contains('hidden')) {
      headerIndicator.classList.add('show');
    } else {
      headerIndicator.classList.remove('show');
    }
  });

  // Function to hide the header and show the indicator.  This is used
  // after a delay on page load and when the header needs to collapse
  // again.
  const hideHeader = () => {
    header.classList.add('hidden');
    headerIndicator.classList.add('show');
  };

  // Function to show the header and hide the indicator.  Triggered on
  // mouse hover over the indicator or the header itself.
  const showHeader = () => {
    header.classList.remove('hidden');
    headerIndicator.classList.remove('show');
  };

  // After a handful of seconds on page load, hide the header and show
  // the indicator.  Use a timeout of 4000ms (~4 seconds) to give
  // visitors time to read the navigation before it retracts.
  setTimeout(hideHeader, 4000);

  // Reveal the header when the user hovers over either the indicator
  // bar or the header itself.  This makes the navigation accessible
  // without scrolling back to the top.
  headerIndicator.addEventListener('mouseenter', showHeader);
  header.addEventListener('mouseenter', showHeader);

  // Optionally collapse the header again when the mouse leaves the
  // header, but only if the user has scrolled down.  If the page is at
  // the top, keep the header visible to avoid flicker.
  header.addEventListener('mouseleave', () => {
    if (window.pageYOffset > 100) {
      hideHeader();
    }
  });

  // Reveal elements when they enter the viewport.  Unchanged from
  // original implementation.
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

  // Animate number counters as they scroll into view.  Unchanged from
  // original implementation.
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

  // Home page hero video muting behaviour.  Unchanged.
  const introVideo = document.querySelector('.page-home .hero video');
  if (introVideo) {
    introVideo.muted = false;
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