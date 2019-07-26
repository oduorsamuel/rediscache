const express=require('express')
const app = express();
const mongoose=require('mongoose')
const bodyParser=require('body-parser')
var access = require('./access.js');
var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

app.use(bodyParser.json())

mongoose.connect('mongodb://localhost:27017/Redis', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('connected to MongoDB');
})
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

 app.post('/book', function (req, res) {
        if (!req.body.title || !req.body.author) res.status(400).send("Please send a title and an author for the book");
        else if (!req.body.text) res.status(400).send("Please send some text for the book");
        else {
            access.saveBook(connection, req.body.title, req.body.author, req.body.text, function (err) {
                if (err) res.status(500).send("Server error");
                else res.status(201).send("Saved");
            });
        }
    });

    app.get('/book/:title', function (req, res) {
        if (!req.param('title')) res.status(400).send("Please send a proper title");
        else {
            access.findBookByTitleCached(connection, redis, req.param('title'), function (book) {
                if (!book) res.status(500).send("Server error");
                else res.status(200).send(book);
            });
        }
    });

app.listen(3000, () => console.log('Server running on port 3000'));