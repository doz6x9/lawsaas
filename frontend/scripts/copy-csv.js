const fs = require('fs');
const path = require('path');

const backendDataDir = path.resolve(__dirname, '../../../backend/data');
const frontendDataDir = path.resolve(__dirname, '../../public/data');

if (!fs.existsSync(frontendDataDir)) {
  fs.mkdirSync(frontendDataDir, { recursive: true });
}

fs.readdir(backendDataDir, (err, files) => {
  if (err) {
    console.error('Could not list the directory.', err);
    process.exit(1);
  }

  files.forEach((file, index) => {
    if (path.extname(file) === '.csv') {
      const sourceFile = path.join(backendDataDir, file);
      const destFile = path.join(frontendDataDir, file);
      fs.copyFileSync(sourceFile, destFile);
      console.log(`Copied ${file} to public/data`);
    }
  });
});
