// Single source of truth for the DFOS newsletter identity.
//
// Every consumer that displays the newsletter name or links to it imports
// from here. Rename is a one-file swap: change these three constants and
// every surface (sidebar CTA, landing page CTA, embedded NewsletterCTA
// component, prep-sheet outputs, tweet-thread footers) picks it up on the
// next build.
export const NEWSLETTER_NAME = 'The Tendency Report';
// Beehiiv publication + subdomain rename landed 2026-09-15. The prior
// `the-audible.beehiiv.com` host now returns HTTP 404 in a browser
// (verified this evening — Beehiiv does not redirect old subdomains),
// so any pointer to it would break the Subscribe link on downfieldos.com
// and the E-013 form's POST target.
export const NEWSLETTER_URL = 'https://the-tendency-report.beehiiv.com';
export const NEWSLETTER_HOST = 'the-tendency-report.beehiiv.com';
