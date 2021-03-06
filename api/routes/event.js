const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const router = express.Router();
let middleware = require('./../../middleware');


router.use(bodyParser.json({ limit: '50mb', extended: true }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'meet4sports'
});

router.post('/joinEvent/:id', middleware.checkToken, (req, res) => {
    let query = `CALL join_event(${req.params.id},${req.body.userId})`;
    db.query(query, (error, result) => {
        if (error) {
            res.status(500).json(error);
            return;
        }
        res.status(200).json({ success: true, message: 'You have joined the event' });
    })
});

router.post('/leaveEvent/:id', middleware.checkToken, (req, res) => {
    let query = `CALL leave_Event(${req.params.id},${req.body.userId})`;
    db.query(query, (error, result) => {
        if (error) {
            res.status(500).json(error);
            return;
        }
        res.status(200).json({ success: true, message: 'You have left the event' });
    })
});

router.get('/allEvents/:id', middleware.checkToken, (req, res) => {
    let eventList = [];
    let getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE userId !=${req.params.id}`
    db.query(getAllQuery, (error, result) => {
        if (error) {
            res.status(500).json(error);
            return;
        }
        Object.keys(result).forEach((key) => {
            let item = result[key];
            event = {
                eventId: item.id,
                eventName: item.eventName,
                sport: item.sport,
                place: {
                    lat: item.lat,
                    long: item.long
                },
                numberParticipants: item.numberParticipants,
                userId: item.userId,
                dateStart: item.dateStart,
                dateFinish: item.dateFinish,
                profileImage: item.profileImage
            };
            eventList.push(event);

        });
        res.status(200).json(eventList);
    });
});

router.get('/getParticipants/:id', middleware.checkToken, (req, res) => {
    let participants = [];
    let user;
    let getAllQuery = `SELECT * FROM User INNER JOIN JoinedEvents ON User.id = JoinedEvents.userId WHERE JoinedEvents.eventId = ${req.params.id}`;
    db.query(getAllQuery, (error, result) => {
        if (error) {
            res.status(500).json(error);
            return;
        }
        Object.keys(result).forEach((key) => {
            let item = result[key];
            console.log(result[key]);
            user = {
                id: item.userId,
                name: item.name,
                email: item.email,
                birthday: item.birthday,
                city: item.city,
                state: item.state,
                country: item.country,
                profileImage: item.profileImage,
                coverImage: item.coverImage,
                created_date: item.created_date
            };
            participants.push(user);
        });
        res.status(200).json(participants);
    })
});

router.get('/allEvents/:id', middleware.checkToken, (req, res) => {
    let eventList = [];
    let getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE userId !=${req.params.id}`

    db.query(getAllQuery, (error, result) => {
        if (error) {
            res.status(500).json(error);
            return;
        }
        Object.keys(result).forEach((key) => {
            let item = result[key];
            event = {
                eventId: item.id,
                eventName: item.eventName,
                sport: item.sport,
                place: {
                    lat: item.lat,
                    long: item.long
                },
                numberParticipants: item.numberParticipants,
                userId: item.userId,
                dateStart: item.dateStart,
                dateFinish: item.dateFinish,
                profileImage: item.profileImage
            };
            eventList.push(event);
        });
        res.status(200).json(eventList);
    })
});

router.get('/userEvents/:id', middleware.checkToken, (req, res) => {
    let eventList = [];
    let getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE Event.userId = ${req.params.id};
    `
    db.query(getAllQuery, (error, result) => {
        if (error) {
            res.status(500).json(error);
            return;
        }
        Object.keys(result).forEach((key) => {
            let item = result[key];
            event = {
                eventId: item.id,
                eventName: item.eventName,
                sport: item.sport,
                place: {
                    lat: item.lat,
                    long: item.long
                },
                numberParticipants: item.numberParticipants,
                userId: item.userId,
                dateStart: item.dateStart,
                dateFinish: item.dateFinish,
                profileImage: item.profileImage
            };
            eventList.push(event);
        });
        res.status(200).json(eventList);
    })
});

router.post('/createEvent/:id', middleware.checkToken, (req, res) => {
    let eventName = req.body.eventName;
    let sport = req.body.sport;
    let lat = req.body.lat;
    let long = req.body.long;
    let nrParticipants = req.body.nrParticipants;
    let dateStart = req.body.dateStart;
    let dateFinish = req.body.dateFinish;
    let userId = req.params.id;
    let event;
    let getAllQuery = `CALL create_event('${eventName}','${sport}',${lat},${long},${nrParticipants},${userId},'${dateStart}','${dateFinish}')`;
    db.query(getAllQuery, (error, result) => {
        if (error) {
            res.status(500).json(error);
            return;
        }
        Object.keys(result).forEach((key) => {
            let item = result[key];
            event = {
                eventId: item.id,
                eventName: item.eventName,
                sport: item.sport,
                place: {
                    lat: item.lat,
                    long: item.long
                },
                numberParticipants: item.numberParticipants,
                userId: item.userId,
                dateStart: item.dateStart,
                dateFinish: item.dateFinish,
                profileImage: item.profileImage
            };
        });
        res.status(200).json(event);
    })
});

router.post('/search', middleware.checkToken, (req, res) => {
    let eventName = req.body.eventName;
    let sports = req.body.sport;
    let eventList = [];
    let getAllQuery;
    if (sports.length > 0) {
        sports.forEach(sport => {
            console.log(eventName);
            if (eventName === '') {
                getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE Event.eventName LIKE '%${eventName}%' OR Event.sport = '${sport}';
         `;
            } else {
                getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE Event.eventName LIKE '%${eventName}%' AND Event.sport = '${sport}';
         `;
            }
            db.query(getAllQuery, (error, result) => {
                if (error) {
                    res.status(500).json(error);
                    return;
                }
                Object.keys(result).forEach((key) => {
                    let item = result[key];
                    let event = {
                        eventId: item.id,
                        eventName: item.eventName,
                        sport: item.sport,
                        place: {
                            lat: item.lat,
                            long: item.long
                        },
                        numberParticipants: item.numberParticipants,
                        userId: item.userId,
                        dateStart: item.dateStart,
                        dateFinish: item.dateFinish,
                        profileImage: item.profileImage
                    };
                    eventList.push(event);
                });
            })
        });
        console.log(eventList);
        res.status(200).json(eventList);

    } else {
        getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE Event.eventName LIKE '%${eventName}%'`;
        db.query(getAllQuery, (error, result) => {
            if (error) {
                res.status(500).json(error);
                return;
            }
            Object.keys(result).forEach((key) => {
                let item = result[key];
                event = {
                    eventId: item.id,
                    eventName: item.eventName,
                    sport: item.sport,
                    place: {
                        lat: item.lat,
                        long: item.long
                    },
                    numberParticipants: item.numberParticipants,
                    userId: item.userId,
                    dateStart: item.dateStart,
                    dateFinish: item.dateFinish,
                    profileImage: item.profileImage
                };
                eventList.push(event);
            });
            console.log(eventList);
            res.status(200).json(eventList);
        });
    }
});

module.exports = router;