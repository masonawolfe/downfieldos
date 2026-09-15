// Single source of truth for the DFOS newsletter identity.
//
// Every consumer that displays the newsletter name or links to it imports
// from here. Rename is a one-file swap: change these three constants and
// every surface (sidebar CTA, landing page CTA, embedded NewsletterCTA
// component, prep-sheet outputs, tweet-thread footers) picks it up on the
// next build.
//
// Do NOT change the Beehiiv URL until the Beehiiv account itself has been
// updated on Mason's side. The name can change without the URL changing;
// Beehiiv will keep serving the current subdomain until the account is
// renamed there.
export const NEWSLETTER_NAME = 'The Audible';
export const NEWSLETTER_URL = 'https://the-audible.beehiiv.com';
export const NEWSLETTER_HOST = 'the-audible.beehiiv.com';
