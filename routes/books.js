const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp-config');
const booksCtrl = require('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRatings);
router.post('/', auth, multer.upload, sharp.optimize, booksCtrl.createBook);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer.upload, sharp.optimize, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.ratingBook);


module.exports = router