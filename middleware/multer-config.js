const multer = require('multer');
const sharp = require('sharp');
path = require('path');
fs = require('fs')

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_')[0];
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});


//ensure that files are always images
/*const filter = (req, file, callback) => {
  if (file.mimetype.split("/")[0] === 'image') {
      callback(null, true);
  } else {
      callback(new Error("Only image files are supported"));
  }
};*/

//upload module
const upload = multer({ storage }).single('image');

//optimize module
const optimize = (req, res, next) => {
  if (!req.file) {
      return next(); // S'il n'y a pas de fichier, passer à la suite
  }
  const extension = MIME_TYPES['image/webp'] || 'webp'
  const name = req.file.originalname.split(' ').join('_').split('.')[0]
  const filename = `${name}_${Date.now()}.${extension}`
  const inputPath = req.file.path // chemin d'entrée
  const outputPath = path.join('images', filename)
  sharp(req.file.path)
      .resize(206, 260)
      .toFormat('webp')
      .toFile(outputPath)
      .then(() => {
          req.file.path = outputPath
          req.file.filename = filename
          next()
      })
      .catch((error) => {
          res.status(500).json({ error })
      });
}


exports.upload = upload;
exports.optimize = optimize;

