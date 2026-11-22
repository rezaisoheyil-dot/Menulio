import {
  CAPPUCCINO_IMAGE,
  ESPRESSO_IMAGE,
  HERO_IMAGE,
  ICED_LATTE_IMAGE,
  PASTRY_IMAGE,
} from '../data/initialData';

export interface ZipEntryInput {
  name: string;
  content: string | Uint8Array;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Generates a valid uncompressed ZIP Blob (compatible with WordPress Theme & Plugin Uploader)
 */
export function buildZipBlob(entries: ZipEntryInput[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes =
      typeof entry.content === 'string'
        ? encoder.encode(entry.content)
        : entry.content;
    const crc = crc32(dataBytes);

    const localHeader = new ArrayBuffer(30 + nameBytes.length);
    const lv = new DataView(localHeader);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x5421, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    new Uint8Array(localHeader, 30).set(nameBytes);

    const localHeaderBytes = new Uint8Array(localHeader);
    localParts.push(localHeaderBytes, dataBytes);

    const centralHeader = new ArrayBuffer(46 + nameBytes.length);
    const cv = new DataView(centralHeader);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    new Uint8Array(centralHeader, 46).set(nameBytes);

    centralParts.push(new Uint8Array(centralHeader));
    offset += localHeaderBytes.length + dataBytes.length;
  }

  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const endRecord = new ArrayBuffer(22);
  const ev = new DataView(endRecord);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [
    ...localParts.map((u) => new Uint8Array(u)),
    ...centralParts.map((u) => new Uint8Array(u)),
    new Uint8Array(endRecord),
  ];

  return new Blob(blobParts, { type: 'application/zip' });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function fetchText(path: string): Promise<string> {
  const res = await fetch(path);
  return res.ok ? res.text() : '';
}

async function fetchBytes(path: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

export async function downloadWordPressThemeZip(cafeStateJson: string) {
  const [styleCss, functionsPhp, adminPanelPhp, indexPhp, headerPhp, footerPhp] =
    await Promise.all([
      fetchText('/wordpress-theme/style.css'),
      fetchText('/wordpress-theme/functions.php'),
      fetchText('/wordpress-theme/inc/admin-panel.php'),
      fetchText('/wordpress-theme/index.php'),
      fetchText('/wordpress-theme/header.php'),
      fetchText('/wordpress-theme/footer.php'),
    ]);

  const readmeThemeFa = `راهنمای نصب پوسته وردپرس CafeMenu SaaS
==================================================

۱. نصب پوسته در وردپرس:
   - فایل cafemenu-wordpress-theme.zip را در مسیر زیر آپلود و فعال کنید:
     پیشخوان وردپرس > نمایش > پوسته‌ها > افزودن پوسته جدید > بارگذاری پوسته

۲. مدیریت کامل پلتفرم در پیشخوان وردپرس:
   - پس از فعال‌سازی پوسته، منوی «مدیریت CafeMenu» در پیشخوان وردپرس اضافه می‌شود.
   - از آنجا می‌توانید تمام کافه‌های عضو، اشتراک‌های ماهانه/سالانه، تعرفه‌ها، محصولات ووکامرس و تیکت‌ها را مدیریت کنید.

۳. آپلود فایل‌های بیلد شده اپلیکیشن (پوشه dist):
   - در سورس پروژه دستور npm run build را اجرا کنید.
   - پوشه dist/ تولیدشده (حاوی index.html و assets/) را در هاست خود داخل مسیر پوسته قرار دهید:
     wp-content/themes/cafemenu-theme/dist/
   - یا از پیشخوان وردپرس > مدیریت CafeMenu > تنظیمات پوسته و نصب، آدرس وب‌اپلیکیشن میزبانی‌شده را وارد کنید.
`;

  const entries: ZipEntryInput[] = [
    { name: 'cafemenu-theme/style.css', content: styleCss },
    { name: 'cafemenu-theme/functions.php', content: functionsPhp },
    { name: 'cafemenu-theme/inc/admin-panel.php', content: adminPanelPhp },
    { name: 'cafemenu-theme/index.php', content: indexPhp },
    { name: 'cafemenu-theme/header.php', content: headerPhp },
    { name: 'cafemenu-theme/footer.php', content: footerPhp },
    { name: 'cafemenu-theme/README-THEME-FA.txt', content: readmeThemeFa },
    { name: 'cafemenu-theme/cafe-backup-data.json', content: cafeStateJson },
  ];

  const imageAssets = [
    HERO_IMAGE,
    ESPRESSO_IMAGE,
    CAPPUCCINO_IMAGE,
    ICED_LATTE_IMAGE,
    PASTRY_IMAGE,
  ];

  const fetchedImages = await Promise.all(
    imageAssets.map(async (imgPath) => ({
      imgPath,
      bytes: await fetchBytes(imgPath),
    }))
  );

  for (const { imgPath, bytes } of fetchedImages) {
    if (bytes) {
      entries.push({
        name: `cafemenu-theme/dist${imgPath}`,
        content: bytes,
      });
      if (imgPath === HERO_IMAGE) {
        entries.push({
          name: 'cafemenu-theme/screenshot.jpg',
          content: bytes,
        });
      }
    }
  }

  const zipBlob = buildZipBlob(entries);
  triggerDownload(zipBlob, 'cafemenu-wordpress-theme.zip');
}

export async function downloadWordPressPluginZip(cafeStateJson: string) {
  const phpSource = await fetchText('/wordpress/cafemenu-saas.php');

  const readmeFa = `راهنمای نصب افزونه وردپرس CafeMenu SaaS
==================================================

۱. نصب افزونه در وردپرس:
   - فایل ZIP دانلود شده را در پیشخوان وردپرس > افزونه‌ها > افزودن > بارگذاری افزونه نصب و فعال کنید.

۲. قرار دادن فایل‌های رابط کاربری:
   - دستور npm run build را اجرا کرده و پوشه dist/ را در مسیر زیر قرار دهید:
     wp-content/plugins/cafemenu-saas/dist/
   - یا از بخش «منوساز CafeMenu» در پیشخوان وردپرس، آدرس وب‌اپلیکیشن میزبانی‌شده را وارد کنید.

۳. قرار دادن شورت‌کد در برگه وردپرس:
   - صفحه اصلی پلتفرم و پنل کافه‌داران: [cafemenu_platform]
   - منوی دیجیتال یک کافه خاص: [cafemenu_digital slug="roka-cafe"]
`;

  const zipBlob = buildZipBlob([
    { name: 'cafemenu-saas/cafemenu-saas.php', content: phpSource },
    { name: 'cafemenu-saas/README-FA.txt', content: readmeFa },
    { name: 'cafemenu-saas/cafe-backup-data.json', content: cafeStateJson },
  ]);

  triggerDownload(zipBlob, 'cafemenu-saas-wordpress-plugin.zip');
}
