// Minimal worker script (string) that loads solc WASM and compiles using standard JSON.
// We embed it as a string and spawn a Blob worker to avoid extra bundler config.

export const solcWorkerScript = `
  let cachedSolc = null;

  async function loadSolc() {
    if (cachedSolc) return cachedSolc;
    const versionTag = 'v0.8.24+commit.e11b9ed9';
    const soljsonUrl = 'https://binaries.soliditylang.org/bin/soljson-' + versionTag + '.js';

    const soljsonRes = await fetch(soljsonUrl);
    if (!soljsonRes.ok) throw new Error('Failed to fetch soljson: ' + soljsonRes.status + ' ' + soljsonRes.statusText);
    const soljsonCode = await soljsonRes.text();

    let runtimeReadyResolve;
    const runtimeReady = new Promise((resolve) => { runtimeReadyResolve = resolve; });
    const Module = {
      print: function () {},
      printErr: function () {},
      onRuntimeInitialized: function () { if (runtimeReadyResolve) runtimeReadyResolve(); },
    };
    const soljsonFactory = new Function('Module', soljsonCode + '; return Module;');
    const factoryResult = soljsonFactory(Module);
    // Support modularized builds that return a function
    let soljsonInstance = factoryResult;
    if (typeof factoryResult === 'function') {
      soljsonInstance = factoryResult(Module) || Module;
    }
    // Wait for WASM runtime initialization
    await runtimeReady;

    // Minimal wrapper to expose compileStandard
    function createSolc(mod) {
      const cwrap = (mod && mod.cwrap) ? mod.cwrap : (Module && Module.cwrap);
      if (!cwrap) throw new Error('soljson cwrap not available');

      const candidates = [
        'solidity_compileStandard',
        'compileStandard',
        'solidity_compile',
        'compileJSON',
      ];
      let compileFn = null;
      for (let i = 0; i < candidates.length && !compileFn; i++) {
        const name = candidates[i];
        try {
          const fn = cwrap(name, 'string', ['string']);
          if (typeof fn === 'function') compileFn = fn;
        } catch (e) {}
      }
      if (!compileFn) throw new Error('soljson compile function not found (no standard entrypoint)');

      return {
        compile: (inputStr) => compileFn(inputStr),
      };
    }

    cachedSolc = createSolc(soljsonInstance || Module);
    return cachedSolc;
  }

  self.onmessage = async (ev) => {
    const { id, input } = ev.data || {};
    try {
      const solc = await loadSolc();
      const outputRaw = solc.compile(JSON.stringify(input));
      // Post raw JSON string to minimize structured cloning complexity
      self.postMessage({ id, resultRaw: outputRaw });
    } catch (err) {
      self.postMessage({ id, error: (err && err.message) ? err.message : String(err) });
    }
  };
`;

export function createSolcWorker(): Worker {
  const blob = new Blob([solcWorkerScript], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  // Revoke after worker loads script URL into itself to avoid leaks.
  // Not strictly necessary immediately; keep to a later cleanup if desired.
  return worker;
}
