import fs from 'node:fs';

// File watchers on Windows can briefly hold a generated page open.
export function writeText(file, text) {
  text = text.replace(/[\t ]+$/gm, '');
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text) return;
  for (let attempt = 0; ; attempt++) {
    try { fs.writeFileSync(file, text); return; }
    catch (error) {
      if (attempt >= 4 || !['EBUSY', 'EPERM', 'UNKNOWN'].includes(error.code)) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100 * (attempt + 1));
    }
  }
}
