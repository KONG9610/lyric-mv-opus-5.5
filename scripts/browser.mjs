// browser.mjs: shared by the scripts. Finds Chrome or Edge, launches it the way render.mjs does, opens a project's studio.
import puppeteer from 'puppeteer-core';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
export const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));

// Chrome first, then Edge (same engine; on many Windows machines it is the only one installed).
export function findChrome() {
  const pw = `${homedir()}/.cache/ms-playwright`;
  const playwright = existsSync(pw) ? readdirSync(pw).filter(n => /^chromium-\d+$/.test(n)).sort((a, b) => b.split('-')[1] - a.split('-')[1]).map(n => `${pw}/${n}/chrome-linux64/chrome`) : [];
  const found = [args.chrome, process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', ...playwright].find(p => p && existsSync(p));
  if (!found) { console.error('No Chrome or Edge found: pass --chrome=<path> or set CHROME_PATH'); process.exit(1); }
  return found;
}

export async function launch() {
  const gpu = args['soft-gl'] ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : process.platform === 'win32' ? ['--use-angle=d3d11'] : process.platform === 'darwin' ? ['--use-angle=metal'] : ['--use-gl=angle'];
  return puppeteer.launch({ executablePath: findChrome(), headless: true, protocolTimeout: 0,
    args: [...(process.platform === 'linux' ? ['--no-sandbox'] : []), '--allow-file-access-from-files', '--ignore-gpu-blocklist', ...gpu, '--enable-gpu-rasterization', '--window-size=1920,1080', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
}

// Open ./studio.html (the project in the current directory) ready to render.
export async function openStudio(browser) {
  if (!existsSync('studio.html')) { console.error('No studio.html here: run this from the kit root or from a project folder (projects/<name>)'); process.exit(1); }
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 120000 });
  return page;
}
// One frame as JPEG bytes, exactly as render.mjs --frames writes it (so hashes compare).
export async function frameJpeg(page, t) {
  const url = await page.evaluate(t => window.renderAt(t, 'image/jpeg', .94), t);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
}
export const frameName = i => `f${String(i).padStart(5, '0')}.jpg`;
