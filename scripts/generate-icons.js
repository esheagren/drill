// Simple icon generator for PWA
// This creates minimal placeholder icons - replace with proper icons for production

const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

const svgTemplate = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
  <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.4}" font-weight="300" text-anchor="middle" dominant-baseline="middle" fill="white">M</text>
</svg>`;

sizes.forEach(size => {
  const svg = svgTemplate(size);
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', `icon-${size}.svg`),
    svg
  );
  console.log(`Generated icon-${size}.svg`);
});

console.log('Icons generated. For production, convert SVGs to PNG or use a proper icon design.');
