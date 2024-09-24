const sharp = require('sharp');
path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
  };
// module optimize
const optimize = (req, res, next) => {
    if (!req.file) {
        return next(); // S'il n'y a pas de fichier, passer à la suite
    }
    const extension = MIME_TYPES['image/webp'] || 'webp'
    const name = req.file.originalname.split(' ').join('_').split('.')[0]
    const filename = `${name}_${Date.now()}.${extension}`
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

  exports.optimize = optimize;