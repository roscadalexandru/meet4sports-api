const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 5;
let jwt = require('jsonwebtoken');
let config = require('./../../config');
let middleware = require('./../../middleware');
const fs = require('fs');


router.use(bodyParser.json({ limit: '50mb', extended: true }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'meet4sports'
});

router.post('/signUp', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;

    bcrypt.hash(password, saltRounds, function (err, hash) {
        let queryAccounts = `CALL insert_user('${email}', '${hash}','${name}')`;
        db.query(queryAccounts, (error, result) => {
            if (error) {
                res.sendStatus(500);
            }
            console.log(result);
            res.json({
                message: 'User created',
            });
        })
    });
});

router.get('/', (req, res) => {
    res.status(200).send('Hello!');
});

router.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user;

    // For the given username fetch user from DB
    if (email && password) {
        let queryCheck = `CALL check_email('${email}')`;
        db.query(queryCheck, (error, result) => {
            if (error)
                throw error;
            user = result[0][0];
            if (email === user.email) {
                bcrypt.compare(password, user.passwordHash, function (err, isMatching) {
                    if (err)
                        throw err;
                    if (isMatching === true) {
                        let token = jwt.sign({ email: user.email, password: user.passwordHash },
                            config.secret,
                            {
                                expiresIn: '24h' // expires in 24 hours
                            }
                        );
                        // return the JWT token for the future API calls
                        res.status(200).json({
                            success: true,
                            message: `Authentication successful! Hi ${user.name}`,
                            token: token,
                            exp: 'Expires in 24h',
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                birthday: user.birthday,
                                city: user.city,
                                state: user.state,
                                country: user.country,
                                profileImage: user.profileImage,
                                coverImage: user.coverImage,

                                created_date: user.created_date
                            }
                        });

                    } else {
                        res.status(403).json({
                            success: false,
                            message: 'Incorrect username or password'
                        });
                    }
                });
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            }
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Authentication failed! Please check the request'
        });
    }
});

router.post('/updateUser/:id', middleware.checkToken, (req, res) => {
    let city = req.body.city;
    let user;
    let query = `UPDATE User SET City = '${city}' WHERE Id = ${req.params.id}`
    db.query(query, async (error, result) => {
        if (error)
            throw error;
        console.log(result);
    });
    let sql = db.query(`SELECT * FROM User WHERE Id = ${req.params.id}`, (error, result) => {
        if (error)
            throw error;

        user = result[0];
        res.status(201).json({
            success: true,
            message: `Update successful!`,
            exp: 'Expires in 24h',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                city: user.city,
                state: user.state,
                country: user.country,
                profileImage: user.profileImage,
                coverImage: user.coverImage,
                created_date: user.created_date
            }
        });

    });

})

router.use(express.static('public'));

router.post("/updateProfilePhoto/:id", function (req, res) {
    let userId = req.params.id;
    let name = req.body.name;
    let userDirectory = req.body.user;
    let img = req.body.image;
    let url = `${req.protocol}://${req.hostname}:${3000}/user/${userDirectory}/images/profile/${name}`;
    console.log('Update profile started');

    let realFile = Buffer.from(img, "base64");

    if (!fs.existsSync(`./public/${userDirectory}`)) {
        fs.mkdirSync(`./public/${userDirectory}`);
        if (!fs.existsSync(`./public/${userDirectory}/images`)) {
            fs.mkdirSync(`./public/${userDirectory}/images`);
            if (!fs.existsSync(`./public/${userDirectory}/images/profile`)) {
                fs.mkdirSync(`./public/${userDirectory}/images/profile`);
            }
        }
    }

    fs.writeFile(`./public/${userDirectory}/images/profile/${name}`, realFile, function (err) {
        if (err)
            console.log(err);
    });

    let query = `CALL update_profile_photo(${userId},'${url}')`;
    db.query(query, (error, result) => {
        if (error)
            throw error;
        console.log(url);
        res.status(200).json({
            message: 'Successfuly updated',
            photoUrl: url
        });
    });
});

router.post("/updateCoverPhoto/:id", function (req, res) {
    let userId = req.params.id;
    let name = req.body.name;
    let userDirectory = req.body.user;
    let img = req.body.image;
    let url = `${req.protocol}://${req.hostname}:${3000}/user/${userDirectory}/images/cover/${name}`;

    let realFile = Buffer.from(img, "base64");

    if (!fs.existsSync(`./public/${userDirectory}`)) {
        fs.mkdirSync(`./public/${userDirectory}`);
        if (!fs.existsSync(`./public/${userDirectory}/images`)) {
            fs.mkdirSync(`./public/${userDirectory}/images`);
            if (!fs.existsSync(`./public/${userDirectory}/images/cover`)) {
                fs.mkdirSync(`./public/${userDirectory}/images/cover`);
            }
        }
    }

    fs.writeFile(`./public/${userDirectory}/images/cover/${name}`, realFile, function (err) {
        if (err)
            console.log(err);
    });

    let query = `CALL update_cover_photo(${userId},'${url}')`;
    db.query(query, (error, result) => {
        if (error)
            throw error;
        console.log(url);
        res.status(200).json({
            message: 'Successfuly updated',
            photoUrl: url
        });
    });
});

router.get('/getUser/:id', middleware.checkToken, (req, res) => {
    let query = `SELECT * FROM User`;
    let user;
    db.query(query, async (error, result) => {
        if (error)
            throw error;
        user = result[0]
        res.status(200).json({
            success: true,
            exp: 'Expires in 24h',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                city: user.city,
                state: user.state,
                country: user.country,
                profileImage: user.profileImage,
                coverImage: user.coverImage,
                created_date: user.created_date
            }
        });
    });


})



module.exports = router;