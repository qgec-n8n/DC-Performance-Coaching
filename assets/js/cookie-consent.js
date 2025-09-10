/*
 * cookie-consent.js
 *
 * Displays a cookie consent banner until the user accepts.  Once
 * accepted, a persistent cookie is stored and the banner will not
 * appear again.  The banner links to the privacy policy page.  This
 * script is adapted from the Silverstone reference site.
 */

document.addEventListener('DOMContentLoaded', function () {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');
  if (!banner || !acceptBtn) return;

  // Read a cookie by name
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Hide banner if consent already given
  if (getCookie('cookieConsent') === 'true') {
    banner.style.display = 'none';
    return;
  }

  // Accept button stores cookie and hides banner
  acceptBtn.addEventListener('click', function () {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie =
      'cookieConsent=true; expires=' +
      expiryDate.toUTCString() +
      '; path=/; SameSite=Lax';
    banner.style.display = 'none';
  });
});