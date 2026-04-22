const fs = require('fs');
const sizeOf = require('image-size');
const dim = sizeOf('C:/Users/sethk/dmc/dmc/public/assets/game_images/samplemap.png');
console.log(dim);
fs.writeFileSync('C:/Users/sethk/dmc/dmc/dim.txt', JSON.stringify(dim));