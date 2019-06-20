const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const middleware = require('./middleware');

const userRoutes = require('./api/routes/user');
const eventRoutes = require('./api/routes/event');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'meet4sports'
});

db.connect((error) => {
    if (error) {
        throw error;
    }
    console.log('Mysql conected...');
})

const app = express();

app.use('/user', userRoutes);
app.use('/event', eventRoutes);

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen('3000', () => console.log('Server started on port 8080 '));

module.exports = app;