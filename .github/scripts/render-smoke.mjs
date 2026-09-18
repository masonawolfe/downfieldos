#!/usr/bin/env node
/**
 * render-smoke.mjs — QA 2026-09-04d P1 fix.
 *
 * Every prior smoke test verified the HTML shell + status. TDZ bugs
 * (MatchupCenter 2026-04-25, FantasyIntel 2026-08-21) shipped green
 * through 40+ deploys because the shell always arrived. This script
 * opens each route in headless Chrome, waits for the network to
 * settle, and fails on any uncaught exception or on the error-boundary
 * text the app renders when a component throws.
 *
 * "Something went wrong" is the fallback string the error boundary
 * writes — see src/components/ui/ErrorBoundary.jsx. If a route lands
 * on that, it's broken even if the HTTP layer is fine.
 */

import puppeteer from 'puppeteer';

const BASE = 'https://downfieldos.com';
const ROUTES = [
  '/',
  '/dashboard',
  '/2026-preview',
  '/this-week',
  '/so-what',
  '/matchup-preview',
  '/team-intel',
  '/war-room',
  '/fantasy-intel',
  '/draft-copilot',
];
// /admin is auth-gated (Clerk) — status-checked in the shell layer, not
// asserted here.

const ERROR_BOUNDARY_TEXT = /Something went wrong|Error boundary|An unexpected error/i;

async function checkRoute(browser, route) {
  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 30_000 });
  } catch (e) {
    await page.close();
    return { route, ok: false, reason: `navigation failed: ${e.message}`, uncaughtCount: errors.length, consoleErrorCount: consoleErrors.length };
  }

  const bodyText = await page.evaluate(() => document.body.innerText || '');
  const hasErrorBoundary = ERROR_BOUNDARY_TEXT.test(bodyText);

  await page.close();

  const ok = errors.length === 0 && !hasErrorBoundary;
  return {
    route,
    ok,
    uncaughtCount: errors.length,
    consoleErrorCount: consoleErrors.length,
    errorBoundary: hasErrorBoundary,
    firstError: errors[0] || null,
    firstConsoleError: consoleErrors[0] || null,
  };
}

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

// Peer QA 2026-09-18 07:40 CT: retry a route ONCE on the chunk-race error
// signature. main.jsx boots with React.lazy(() => import('@clerk/clerk-react')),
// so a fresh deploy where the /assets/*.js chunk hash hasn't propagated to
// every CDN edge yet returns the SPA fallback HTML instead of the JS chunk.
// The dynamic import parses that HTML as JS and throws
// `Unexpected token '<', "<!DOCTYPE ..."`. This bit the 09-34Z injuries
// deploy while the next one at 11-29Z passed against the same site. Retry
// after a 6s sleep to let the CDN edge catch up.
const CHUNK_RACE_SIGNATURES = [
  /Unexpected token '<'/i,
  /Loading chunk .* failed/i,
  /Loading CSS chunk .* failed/i,
  /Failed to fetch dynamically imported module/i,
];
function isChunkRace(rr) {
  if (rr.ok) return false;
  const first = rr.firstError || rr.firstConsoleError || '';
  return CHUNK_RACE_SIGNATURES.some(re => re.test(first));
}

const results = [];
for (const r of ROUTES) {
  let rr = await checkRoute(browser, r);
  if (isChunkRace(rr)) {
    console.log(`RETRY  ${r.padEnd(20)} chunk-race signature — sleeping 6s and re-checking once (${(rr.firstError || '').slice(0, 80)})`);
    await new Promise(res => setTimeout(res, 6000));
    rr = await checkRoute(browser, r);
    rr.retried = true;
  }
  results.push(rr);
  const line = `${rr.ok ? 'OK    ' : 'BROKEN'} ${r.padEnd(20)} uncaught=${rr.uncaughtCount} console_err=${rr.consoleErrorCount}${rr.retried ? ' (after retry)' : ''}${rr.errorBoundary ? '  ERROR BOUNDARY' : ''}${rr.firstError ? '  first: ' + rr.firstError.slice(0, 120) : ''}`;
  console.log(line);
}
await browser.close();

const broken = results.filter(r => !r.ok);
if (broken.length) {
  console.error(`\nFAIL: ${broken.length} of ${results.length} routes broken.`);
  process.exit(1);
}
console.log(`\nOK: ${results.length}/${results.length} routes render clean.`);
