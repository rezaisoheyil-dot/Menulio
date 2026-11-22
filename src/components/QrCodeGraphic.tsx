import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer } from 'lucide-react';

interface QrCodeGraphicProps {
  value: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  cafeName?: string;
  tableNumber?: string;
  showActions?: boolean;
}

export function QrCodeGraphic({
  value,
  size = 180,
  darkColor = '#181412',
  lightColor = '#FFFFFF',
  cafeName = 'کافه روکا',
  tableNumber,
  showActions = false,
}: QrCodeGraphicProps) {
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toString(value, {
      type: 'svg',
      width: size,
      margin: 1,
      color: { dark: darkColor, light: lightColor },
    })
      .then((svg) => {
        if (active) setSvgMarkup(svg);
      })
      .catch(() => {
        if (active) setSvgMarkup('');
      });

    QRCode.toDataURL(value, {
      width: 512,
      margin: 2,
      color: { dark: darkColor, light: lightColor },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [value, size, darkColor, lightColor]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-${cafeName.replace(/\s+/g, '-')}${tableNumber ? `-table-${tableNumber}` : ''}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-center"
        style={{ width: size + 24, height: size + 24 }}
      >
        {svgMarkup ? (
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="w-full h-full bg-stone-100 rounded-lg animate-pulse" />
        )}
      </div>

      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-2 no-print">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!dataUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E66F1E] text-white text-sm font-medium hover:bg-[#cf5f15] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>دانلود PNG باکیفیت</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ استند رومیزی</span>
          </button>
        </div>
      )}
    </div>
  );
}
