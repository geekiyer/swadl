import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "assets");

// Bee icon SVG on amber gradient background
const svgIcon = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="230" fill="url(#bg)"/>
  <g transform="translate(512 512) scale(6.5) translate(-50 -50)">
    <ellipse cx="24" cy="36" rx="18" ry="10" fill="white" fill-opacity="0.88" transform="rotate(-28 24 36)"/>
    <ellipse cx="22" cy="48" rx="12" ry="6.5" fill="white" fill-opacity="0.55" transform="rotate(-18 22 48)"/>
    <ellipse cx="76" cy="36" rx="18" ry="10" fill="white" fill-opacity="0.88" transform="rotate(28 76 36)"/>
    <ellipse cx="78" cy="48" rx="12" ry="6.5" fill="white" fill-opacity="0.55" transform="rotate(18 78 48)"/>
    <path d="M50 30 C33 36 26 50 26 64 C26 79 37 92 50 92 C63 92 74 79 74 64 C74 50 67 36 50 30Z" fill="#7C3A00"/>
    <path d="M29 52 Q50 58 71 52" stroke="#FBBF24" stroke-width="5.5" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M28 64 Q50 70 72 64" stroke="#FBBF24" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.65"/>
    <path d="M31 76 Q50 80 69 76" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.42"/>
    <circle cx="50" cy="30" r="17" fill="#D97706"/>
    <circle cx="50" cy="30" r="13.5" fill="#FDE68A"/>
    <path d="M43 17 C41 11 36 8 33 6" stroke="#7C3A00" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="32" cy="5.5" r="3.5" fill="#7C3A00"/>
    <path d="M57 17 C59 11 64 8 67 6" stroke="#7C3A00" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="68" cy="5.5" r="3.5" fill="#7C3A00"/>
    <path d="M43.5 29 C44.5 27.5 46.5 27 47.5 28.5" stroke="#7C3A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M52.5 29 C53.5 27.5 55.5 27 56.5 28.5" stroke="#7C3A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M46 34 C47.5 35.5 50 36 52.5 35 C53.5 34.5 54.5 33.5 54.5 33.5" stroke="#B45309" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;

// Foreground only (no background) for Android adaptive icon
const svgForeground = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(512 512) scale(6.5) translate(-50 -50)">
    <ellipse cx="24" cy="36" rx="18" ry="10" fill="white" fill-opacity="0.88" transform="rotate(-28 24 36)"/>
    <ellipse cx="22" cy="48" rx="12" ry="6.5" fill="white" fill-opacity="0.55" transform="rotate(-18 22 48)"/>
    <ellipse cx="76" cy="36" rx="18" ry="10" fill="white" fill-opacity="0.88" transform="rotate(28 76 36)"/>
    <ellipse cx="78" cy="48" rx="12" ry="6.5" fill="white" fill-opacity="0.55" transform="rotate(18 78 48)"/>
    <path d="M50 30 C33 36 26 50 26 64 C26 79 37 92 50 92 C63 92 74 79 74 64 C74 50 67 36 50 30Z" fill="#7C3A00"/>
    <path d="M29 52 Q50 58 71 52" stroke="#FBBF24" stroke-width="5.5" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M28 64 Q50 70 72 64" stroke="#FBBF24" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.65"/>
    <path d="M31 76 Q50 80 69 76" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.42"/>
    <circle cx="50" cy="30" r="17" fill="#D97706"/>
    <circle cx="50" cy="30" r="13.5" fill="#FDE68A"/>
    <path d="M43 17 C41 11 36 8 33 6" stroke="#7C3A00" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="32" cy="5.5" r="3.5" fill="#7C3A00"/>
    <path d="M57 17 C59 11 64 8 67 6" stroke="#7C3A00" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="68" cy="5.5" r="3.5" fill="#7C3A00"/>
    <path d="M43.5 29 C44.5 27.5 46.5 27 47.5 28.5" stroke="#7C3A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M52.5 29 C53.5 27.5 55.5 27 56.5 28.5" stroke="#7C3A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M46 34 C47.5 35.5 50 36 52.5 35 C53.5 34.5 54.5 33.5 54.5 33.5" stroke="#B45309" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;

// Splash icon — bee on midnight background
const svgSplash = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(100 100) scale(1.3) translate(-50 -50)">
    <ellipse cx="24" cy="36" rx="18" ry="10" fill="#F59E0B" fill-opacity="0.88" transform="rotate(-28 24 36)"/>
    <ellipse cx="22" cy="48" rx="12" ry="6.5" fill="#F59E0B" fill-opacity="0.55" transform="rotate(-18 22 48)"/>
    <ellipse cx="76" cy="36" rx="18" ry="10" fill="#F59E0B" fill-opacity="0.88" transform="rotate(28 76 36)"/>
    <ellipse cx="78" cy="48" rx="12" ry="6.5" fill="#F59E0B" fill-opacity="0.55" transform="rotate(18 78 48)"/>
    <path d="M50 30 C33 36 26 50 26 64 C26 79 37 92 50 92 C63 92 74 79 74 64 C74 50 67 36 50 30Z" fill="#F59E0B"/>
    <path d="M29 52 Q50 58 71 52" stroke="#080E1A" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M28 64 Q50 70 72 64" stroke="#080E1A" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.9"/>
    <path d="M31 76 Q50 80 69 76" stroke="#080E1A" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
    <circle cx="50" cy="30" r="17" fill="#FBBF24"/>
    <circle cx="50" cy="30" r="13.5" fill="#FEF3C7"/>
    <path d="M43 17 C41 11 36 8 33 6" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="32" cy="5.5" r="3.8" fill="#FBBF24"/>
    <path d="M57 17 C59 11 64 8 67 6" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="68" cy="5.5" r="3.8" fill="#FBBF24"/>
    <path d="M43.5 29 C44.5 27.5 46.5 27 47.5 28.5" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M52.5 29 C53.5 27.5 55.5 27 56.5 28.5" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M46 34 C47.5 35.5 50 36 52.5 35 C53.5 34.5 54.5 33.5 54.5 33.5" stroke="#B45309" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;

async function generate() {
  // Main app icon (1024x1024)
  await sharp(Buffer.from(svgIcon))
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, "icon.png"));
  console.log("Generated icon.png (1024x1024)");

  // Favicon (48x48)
  await sharp(Buffer.from(svgIcon))
    .resize(48, 48)
    .png()
    .toFile(join(assetsDir, "favicon.png"));
  console.log("Generated favicon.png (48x48)");

  // Android adaptive icon foreground
  await sharp(Buffer.from(svgForeground))
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, "android-icon-foreground.png"));
  console.log("Generated android-icon-foreground.png");

  // Android adaptive icon background (solid amber)
  const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="#F59E0B"/></svg>`;
  await sharp(Buffer.from(bgSvg))
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, "android-icon-background.png"));
  console.log("Generated android-icon-background.png");

  // Monochrome icon
  await sharp(Buffer.from(svgForeground))
    .resize(1024, 1024)
    .grayscale()
    .png()
    .toFile(join(assetsDir, "android-icon-monochrome.png"));
  console.log("Generated android-icon-monochrome.png");

  // Splash icon (bee on transparent for midnight bg)
  await sharp(Buffer.from(svgSplash))
    .resize(200, 200)
    .png()
    .toFile(join(assetsDir, "splash-icon.png"));
  console.log("Generated splash-icon.png");
}

generate().catch(console.error);
