// Loaded with `node --import` by scripts/test-build-team-changes.mjs (team
// news plan step 2). It makes any network reach fail loudly: fetch throws,
// and a resolve hook refuses the network and process modules, so a build
// that tries one exits non-zero instead of quietly reading the web.
import { register } from 'node:module';

const hook = `export async function resolve(spec, ctx, next) {
  const b = String(spec).replace(/^node:/, '');
  if (/^(http|https|http2|net|tls|dns|dgram|child_process|cluster|worker_threads|undici)(\\/|$)/.test(b)) {
    throw new Error('no-network guard: refused import of ' + spec);
  }
  return next(spec, ctx);
}`;
register('data:text/javascript,' + encodeURIComponent(hook));
const refuse = (what) => () => { throw new Error(`no-network guard: ${what} was called`); };
globalThis.fetch = refuse('fetch');
globalThis.WebSocket = class { constructor() { throw new Error('no-network guard: WebSocket was called'); } };
const realBuiltin = process.getBuiltinModule?.bind(process);
if (realBuiltin) {
  process.getBuiltinModule = (id) => {
    if (/^(node:)?(http|https|http2|net|tls|dns|dgram|child_process|cluster|worker_threads)(\/|$)/.test(String(id))) throw new Error(`no-network guard: refused getBuiltinModule(${id})`);
    return realBuiltin(id);
  };
}
