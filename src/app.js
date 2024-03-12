// dependencies
const express = require('express');
const {createServer} = require('node:http');
const {Server} = require('socket.io');
// import express from 'express';
// import {createServer} from 'node:http';
// import {Server} from 'socket.io';
// import {ejs} from 'ejs';

// core variables
const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/views/'))

console.log(__dirname);

// serve other endpoints here

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/chat', (req, res) => {
    // also pass connection params
    res.render('chat.html');
});

let chatQueue = [];
let connections = [];

io.on('connection', (socket) => {
    // to do:
    // * pooling
    // * connection
    
    console.log(`user ${socket.id} connected`);

    socket.emit('user-matched', () => {
        if (chatQueue.size > 1){
            return true;
        }
        return false;
    });

    // other events
    socket.on(`message sent`, (msg) => {
        // pass message to user
        socket.broadcast.emit('relay message', msg);
    });
    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`);
    });
})

server.listen(port, () => {
    console.log(`App listening at port ${port}.`);
});

