#!/usr/bin/env node
/**
 * build-wordpress-theme.mjs
 *
 * یک دستور، یک فایل ZIP آماده نصب روی وردپرس:
 *
 *     node build-wordpress-theme.mjs
 *
 * خروجی: cafemenu-theme.zip  (کنار همین فایل)
 * نصب:   وردپرس ← نمایش ← پوسته‌ها ← افزودن ← بارگذاری پوسته ← انتخاب ZIP ← نصب ← فعال‌سازی
 *
 * پیش‌نیاز: Node.js نسخه ۱۸ یا بالاتر (https://nodejs.org)
 * این اسکریپت به هیچ پکیج اضافه‌ای نیاز ندارد.
 */

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const ROOT = dirname(fileURLToPath(import.meta.url));
const THEME_SRC = join(ROOT, 'public', 'wordpress-theme');
const DIST = join(ROOT, 'dist');
const STAGING = join(ROOT, '.wp-build');
const THEME_SLUG = 'cafemenu-theme';
const OUT_ZIP = join(ROOT, `${THEME_SLUG}.zip`);

const log = (msg) => console.log(`\n▶ ${msg}`);
const fail = (msg) => {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
};

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32', // npm.cmd / npx.cmd on Windows
  });
  if (result.status !== 0) fail(`اجرای «${cmd} ${args.join(' ')}» با خطا تمام شد.`);
}

/* ---------- 1) Build the React app ---------- */

if (!existsSync(THEME_SRC)) {
  fail('پوشه public/wordpress-theme پیدا نشد. این فایل باید کنار package.json پروژه باشد.');
}

if (process.env.SKIP_BUILD === '1') {
  log('SKIP_BUILD=1 → مرحله بیلد رد شد و از پوشه dist موجود استفاده می‌شود.');
} else {
  if (!existsSync(join(ROOT, 'node_modules'))) {
    log('نصب وابستگی‌ها (فقط بار اول، چند دقیقه طول می‌کشد)…');
    run('npm', ['install', '--no-audit', '--no-fund']);
  }
  log('ساخت نسخه نهایی برنامه (vite build)…');
  // --base=./ so every asset path is relative and works inside /wp-content/themes/...
  run('npx', ['vite', 'build', '--base=./']);
}

const assetsDir = join(DIST, 'assets');
if (!existsSync(assetsDir) || !readdirSync(assetsDir).some((f) => f.endsWith('.js'))) {
  fail('پوشه dist/assets/ حاوی فایل .js نیست؛ بیلد موفق نبوده است.');
}

/* ---------- 2) Assemble the theme folder ---------- */

log('آماده‌سازی پوشه قالب…');
rmSync(STAGING, { recursive: true, force: true });
const themeDir = join(STAGING, THEME_SLUG);
mkdirSync(themeDir, { recursive: true });

// Theme PHP files
cpSync(THEME_SRC, themeDir, { recursive: true });

// Built app → <theme>/dist  (skip copies of the WP files that Vite took from /public)
const SKIP_IN_DIST = new Set(['wordpress', 'wordpress-theme']);
cpSync(DIST, join(themeDir, 'dist'), {
  recursive: true,
  filter: (src) => {
    const rel = relative(DIST, src);
    if (!rel) return true;
    return !SKIP_IN_DIST.has(rel.split(sep)[0]);
  },
});

/* ---------- 3) Minimal ZIP writer (no dependencies) ---------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function makeZip(baseDir, outPath) {
  const files = listFiles(baseDir);
  const { time, day } = dosDateTime(new Date());
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    // ZIP paths must use forward slashes (important when built on Windows)
    const name = relative(baseDir, file).split(sep).join('/');
    const nameBuf = Buffer.from(name, 'utf8');
    const data = readFileSync(file);
    const compressed = deflateRawSync(data, { level: 9 });
    const useDeflate = compressed.length < data.length;
    const body = useDeflate ? compressed : data;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 file names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuf, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(0, 38); // external attrs
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  writeFileSync(outPath, Buffer.concat([...localParts, centralBuf, end]));
  return files.length;
}

/* ---------- 4) Zip it ---------- */

log('ساخت فایل ZIP…');
rmSync(OUT_ZIP, { force: true });
const count = makeZip(STAGING, OUT_ZIP);
rmSync(STAGING, { recursive: true, force: true });

const sizeMb = (statSync(OUT_ZIP).size / 1024 / 1024).toFixed(2);
console.log(`
✔ تمام شد: ${resolve(OUT_ZIP)}
  ${count} فایل، ${sizeMb} مگابایت

مراحل نصب روی وردپرس:
  ۱) پیشخوان وردپرس ← نمایش ← پوسته‌ها ← افزودن ← بارگذاری پوسته
  ۲) فایل ${THEME_SLUG}.zip را انتخاب و «هم‌اکنون نصب کن» را بزنید
  ۳) «فعال‌سازی» را بزنید
  ۴) تنظیمات ← پیوندهای یکتا ← بدون تغییر «ذخیره» را بزنید (برای کار کردن آدرس /menu/نام-کافه)
`);
