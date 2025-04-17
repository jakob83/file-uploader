const fs = require('fs').promises;
const path = require('path');

module.exports = async (files) => {
  console.log(files);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await fs.unlink(path.resolve(__dirname, `../`, file.path));
  }
};
