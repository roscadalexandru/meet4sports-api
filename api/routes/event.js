const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const router = express.Router();


router.use(bodyParser.json({ limit: '50mb', extended: true }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'meet4sports'
});

router.get('/joinedByUser/:id', (req, res) => {
    let query = `CALL JoinedEventsByUser(${req.params.id}); `;
    let events = [];
    let item;
    db.query(query, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.length) {
            for (var i = 0; i < result[0].length; i++) {
                events.push(result[0][i]);
            }
        }
        res.status(200).json(events);
    })
});


router.get('/all/:id', (req, res) => {
    let eventList = [];
    let getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE userId !=${req.params.id}`
    db.query(getAllQuery, (error, result) => {
        if (error) {
            throw error;
        }
        Object.keys(result).forEach((key)=>{
            let item = result[key];
            event = {
                eventId : item.id,
                eventName: item.eventName,
                sport : item.sport,
                place:{
                    lat: item.lat,
                    long: item.long
                },
                numberParticipants : item.numberParticipants,
                userId: item.userId,
                dateStart : item.dateStart,
                dateFinish: item.dateFinish,
                profileImage: item.profileImage
            };
            eventList.push(event);
        });
        res.status(200).json(eventList);
    })
})

router.get('/userEvents/:id', (req, res) => {
    let eventList = [];
    let getAllQuery = `SELECT  Event.*, User.profileImage as profileImage FROM Event INNER JOIN User ON User.id = userId WHERE Event.userId = ${req.params.id};
    `
    db.query(getAllQuery, (error, result) => {
        if (error) {
            throw error;
        }
        Object.keys(result).forEach((key)=>{
            let item = result[key];
            event = {
                eventId : item.id,
                eventName: item.eventName,
                sport : item.sport,
                place:{
                    lat: item.lat,
                    long: item.long
                },
                numberParticipants : item.numberParticipants,
                userId: item.userId,
                dateStart : item.dateStart,
                dateFinish: item.dateFinish,
                profileImage: item.profileImage
            };
            eventList.push(event);
        });
        res.status(200).json(eventList);
    })
});

router.post('/createEvent/:id', (req, res) => {
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
            throw error;
        }
        Object.keys(result).forEach((key)=>{
            let item = result[key];
            event = {
                eventId : item.id,
                eventName: item.eventName,
                sport : item.sport,
                place:{
                    lat: item.lat,
                    long: item.long
                },
                numberParticipants : item.numberParticipants,
                userId: item.userId,
                dateStart : item.dateStart,
                dateFinish: item.dateFinish,
                profileImage: item.profileImage
            };
        }); 
        res.status(200).json(event);
    })
});

module.exports = router;