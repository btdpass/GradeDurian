const MAX_LOGO_SIZE = 256;
const WEBP_QUALITY = 0.85;
const JPEG_QUALITY = 0.85;

export async function processLogoUpload(
    file: File,
    fallbackColor: string
): Promise<{ dataUrl: string; dominantColor: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (event) => {
            const img = new Image();
            img.onerror = reject;
            img.src = event.target?.result as string;
            img.onload = () => {
                // Maintain aspect ratio, cap at MAX_LOGO_SIZE
                let w = img.width;
                let h = img.height;
                if (w > MAX_LOGO_SIZE || h > MAX_LOGO_SIZE) {
                    if (w >= h) { h = Math.round(h * MAX_LOGO_SIZE / w); w = MAX_LOGO_SIZE; }
                    else        { w = Math.round(w * MAX_LOGO_SIZE / h); h = MAX_LOGO_SIZE; }
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
                ctx.drawImage(img, 0, 0, w, h);

                // WebP gives ~50-70% smaller files than PNG; fall back to JPEG on Safari
                let dataUrl = canvas.toDataURL('image/webp', WEBP_QUALITY);
                if (!dataUrl.startsWith('data:image/webp')) {
                    dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                }

                // Sample a 16×16 downsample of the image for dominant color.
                // Skip transparent, near-white, and near-black pixels so the
                // result reflects the image's actual accent color.
                const SAMPLE = 16;
                const cc = document.createElement('canvas');
                cc.width = SAMPLE; cc.height = SAMPLE;
                const cctx = cc.getContext('2d', { willReadFrequently: true })!;
                cctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
                const pixels = cctx.getImageData(0, 0, SAMPLE, SAMPLE).data;

                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    const [pr, pg, pb, pa] = [pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]];
                    if (pa < 128) continue;
                    const brightness = (pr + pg + pb) / 3;
                    if (brightness > 240 || brightness < 15) continue;
                    r += pr; g += pg; b += pb; count++;
                }

                const dominantColor = count > 0
                    ? '#' + [Math.round(r / count), Math.round(g / count), Math.round(b / count)]
                          .map(x => x.toString(16).padStart(2, '0')).join('')
                    : fallbackColor;

                resolve({ dataUrl, dominantColor });
            };
        };
        reader.readAsDataURL(file);
    });
}
