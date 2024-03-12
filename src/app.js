// dependencies
const express = require('express');
const {createServer} = require('node:http');
const {Server} = require('socket.io');

// core variables
const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/views/css/'))

console.log(__dirname);

// serve other endpoints here

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/chat', (req, res) => {
    // also pass connection params
    res.render('chat.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('clicked button', (msg) => {
        console.log(msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

server.listen(port, () => {
    console.log(`App listening at port ${port}.`)
});

