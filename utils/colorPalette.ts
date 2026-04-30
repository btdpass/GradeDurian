function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
}

// Lightness and saturation scale factors for each shade
const SHADE_CONFIG = [
    { shade: 50,  l: 97, sFactor: 0.45 },
    { shade: 100, l: 92, sFactor: 0.60 },
    { shade: 200, l: 82, sFactor: 0.78 },
    { shade: 300, l: 70, sFactor: 0.90 },
    { shade: 400, l: 62, sFactor: 0.97 },
    { shade: 500, l: null, sFactor: 1.0 },
    { shade: 600, l: 47, sFactor: 0.95 },
    { shade: 700, l: 37, sFactor: 1.0 },
    { shade: 800, l: 29, sFactor: 1.0 },
    { shade: 900, l: 23, sFactor: 1.0 },
];

export function generatePalette(hex: string): Record<number, string> {
    const [h, s, l] = hexToHsl(hex);
    const palette: Record<number, string> = {};
    for (const { shade, l: targetL, sFactor } of SHADE_CONFIG) {
        const finalL = targetL ?? l;
        const finalS = Math.min(100, s * sFactor);
        palette[shade] = hslToHex(h, finalS, finalL);
    }
    return palette;
}

export function applyPalette(hex: string, save = false) {
    if (save) localStorage.setItem('primaryColor', hex);
    const palette = generatePalette(hex);
    let style = document.getElementById('primary-palette') as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.id = 'primary-palette';
        document.head.appendChild(style);
    }
    document.documentElement.classList.add('no-transition');
    const vars = Object.entries(palette)
        .map(([shade, color]) => `--primary-${shade}: ${hexToRgb(color)};`)
        .join('\n    ');
    style.textContent = `:root { ${vars} }`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transition');
    }));
}

export const DEFAULT_PRIMARY = '#e9bb42';
