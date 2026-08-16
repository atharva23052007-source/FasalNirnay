import fs from 'fs';
import path from 'path';

const srcDir = 'C:\\Users\\d0in\\.gemini\\antigravity-ide\\brain\\73159291-edb7-45b7-a058-137e7904c93b';
const destDir = 'c:\\Users\\d0in\\Downloads\\Fasal Nirnay\\public\\assets';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.startsWith('onion_crop_')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, 'onion.jpg'));
    console.log('Copied onion.jpg');
  }
  if (file.startsWith('blinkit_scooter_')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, 'scooter.jpg'));
    console.log('Copied scooter.jpg');
  }
  if (file.startsWith('tomato_crop_')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, 'tomato.jpg'));
    console.log('Copied tomato.jpg');
  }
  if (file.startsWith('leafy_crop_')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, 'leafy.jpg'));
    console.log('Copied leafy.jpg');
  }
  if (file.startsWith('farmer_banner_')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, 'farmer_banner.jpg'));
    console.log('Copied farmer_banner.jpg');
  }
}
