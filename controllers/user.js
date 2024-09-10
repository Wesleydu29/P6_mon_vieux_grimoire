const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.signup = (req, res, next) => {
    const minLength = 6;
    const hasNumber = /\d/;
    if (passeword.length < minLength) {
        return res.status(400).json({message : 'Le mot de passe doit contenir au minimum 6 caractères'})
    }
    if (!hasNumber.test(password)) {
        return res.status(400).json({message : 'Le mot de passe doit contenir au minimum 1 chiffre'})
    }
    const regexEmail = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/
    if (regexEmail.test(email) === false){
        return res.status(400).json({message : "l'email n'est pas valide"})
    }

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email : req.body.email,
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({message: 'Utilisateur crée'}))
        .catch(error => res.status(400).json({error}))
    })
    .catch(error => res.status(500).json({error}));

};


exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            } else {
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    } else {
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                {userId: user._id},
                                'RANDOM_TOKEN_SECRET',
                                {expriresIn: '24h'}
                            )
                        });
                    }
                    
                })
                .catch(error => {
                    res.status(500).json({ error });
                })
            }
        })
        .catch(error => {

          res.status(500).json({ error });
        })
 };