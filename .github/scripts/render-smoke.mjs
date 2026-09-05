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
const results = [];
for (const r of ROUTES) {
  const rr = await checkRoute(browser, r);
  results.push(rr);
  const line = `${rr.ok ? 'OK    ' : 'BROKEN'} ${r.padEnd(20)} uncaught=${rr.uncaughtCount} console_err=${rr.consoleErrorCount}${rr.errorBoundary ? '  ERROR BOUNDARY' : ''}${rr.firstError ? '  first: ' + rr.firstError.slice(0, 120) : ''}`;
  console.log(line);
}
await browser.close();

const broken = results.filter(r => !r.ok);
if (broken.length) {
  console.error(`\nFAIL: ${broken.length} of ${results.length} routes broken.`);
  process.exit(1);
}
console.log(`\nOK: ${results.length}/${results.length} routes render clean.`);
