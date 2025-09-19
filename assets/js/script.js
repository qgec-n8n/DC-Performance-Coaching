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

  // Helper functions to show and hide the header/indicator.  When the page loads
  // the header is visible; after two seconds it disappears and the indicator appears.
  const showHeader = () => {
    header.classList.remove('hidden');
    headerIndicator.classList.remove('active');
  };
  const hideHeader = () => {
    header.classList.add('hidden');
    headerIndicator.classList.add('active');
  };
  // Autohide the header after 2 seconds on initial page load
  setTimeout(() => {
    hideHeader();
  }, 2000);
  // Show the header when hovering over the indicator or the header itself
  headerIndicator.addEventListener('mouseenter', showHeader);
  header.addEventListener('mouseenter', showHeader);
  // Hide the header again when the mouse leaves the header area
  header.addEventListener('mouseleave', hideHeader);

  // Reposition section headings into their floating boxes.  This moves the
  // preceding section title inside the `.floating-box` so that titles like
  // "Proof in Numbers" and "Experience by the Numbers" appear inside
  // the box along with the counters.
  document.querySelectorAll('.floating-box').forEach((box) => {
    const prev = box.previousElementSibling;
    if (prev && prev.classList.contains('section-title')) {
      box.insertBefore(prev, box.firstChild);
    }
  });

  // Performance gallery lightbox on the testimonials page.
  // When an image inside .gallery-grid is clicked, display it in a full
  // screen overlay with a dark background and a close button.  This
  // overlay is created dynamically and appended to the body.
  if (document.body.classList.contains('page-testimonials')) {
    const galleryImages = document.querySelectorAll('.gallery-grid img');
    if (galleryImages.length) {
      // Create lightbox structure
      const lightbox = document.createElement('div');
      lightbox.id = 'gallery-lightbox';
      lightbox.innerHTML =
        '<div class="gallery-lightbox-content"><img src="" alt="" /><button class="gallery-lightbox-close">Close</button></div>';
      document.body.appendChild(lightbox);
      const lightboxImg = lightbox.querySelector('img');
      const closeBtn = lightbox.querySelector('.gallery-lightbox-close');
      // Show lightbox with clicked image
      galleryImages.forEach((img) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
          lightboxImg.src = img.src;
          lightbox.classList.add('active');
          // Prevent body from scrolling when lightbox is open
          document.body.style.overflow = 'hidden';
        });
      });
      // Close lightbox and restore scrolling
      const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      };
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
      // Also allow clicking outside the image content to close the lightbox
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });
    }
  }

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