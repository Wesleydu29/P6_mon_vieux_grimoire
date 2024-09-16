const Book = require('../models/Book');
const fs = require('fs');

// ajout d'un livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => res.status(201).json({ message: 'le livre a été ajouté' }))
        .catch(error => res.status(400).json({ error}));
};

//obtenir un livre spécifique
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

// la notation des livres
exports.ratingBook = (req, res, next) => {
    const updatedRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    //verification de la note
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'la note doit être comprise entre 1 et 5' });
    }
    //find book
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            //on regarde si l'utilisateur n'a ps déjà noté le livre
            if (book.ratings.find(r => r.userId === req.auth.userId)) {
                return res.status(400).json({ message: 'Vous avez déjà voté pour ce livre' });
            } else {
                //ajout de la note
                book.ratings.push(updatedRating);
                //calcule de la note moyenne
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length;
                return book.save();
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
}


// modifier un livre
exports.modifyBook = (req, res, next) => {
    // on vient verifier s'il y a un changement d'image
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // on vient verifier si l'id  du livre correspond bien à l'utilisateur
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                // si l'id correspond bien, on vient mettre à jour
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'le livre a bien été modifié' });
                        // suppression de l'ancien fichier
                        const oldFile = book.imageUrl.split('/images')[1];
                        req.file && fs.unlink(`images/${oldFile}`, (err => {
                            if (err) console.log(err);
                        }))
                    })
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));

};

// suppression d'un livre
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // on vient verifier si l'id utilisateur correspond au livre
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.deleteOne({ _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Le livre a été supprimé' });
                        const filename = book.imageUrl.split('/images/')[1];
                        //unlink permet de supprimer un fichier, du système de fichiers
                        fs.unlink(`images/${filename}`, (err => {
                            if (err) console.log(err);
                        }))
                    })
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};

// on vient récuperer tous les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

// on récupère les 3 meilleurs livres via leur notes
exports.getBestRatings = (req, res, next) => {
    Book.find()
        //tri décroissant
        .sort({ averageRating: -1 })
        //on ne garde que les 3 meilleurs
        .limit(3)
        //return un tableau des 3 meilleurs livres
        .then((bestBooks) => res.status(200).json(bestBooks))
        .catch(error => res.status(400).json({ error }));
}