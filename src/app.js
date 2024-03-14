// dependencies
const express = require('express');
const { match } = require('node:assert');
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

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
}

// serve other endpoints here

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/chat', (req, res) => {
    // also pass connection params
    res.render('chat.html');
});

let chatQueue = [];
let pairedClients = [];

io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`);

    // upon connection, add client to queue
    chatQueue.push(socket.id);

    if (pairedClients.includes(socket.id) == false && chatQueue.length >= 2){
        // relay client to another client
        chatQueue.pop();
        matched = chatQueue.pop();

        pairedClients.push({
            u1: socket.id,
            u2: matched
        });

        socket.emit('user matched', matched);
        socket.to(matched).emit('user matched', socket.id);
    }

    // other events
    socket.on(`message sent`, (msg) => {
        // pass message to user
        socket.to(msg.to).emit('relay message', msg);
    });
    socket.on('disconnect', () => {
        // remove from paired clients
        let pairedIdx = pairedClients.filter(c => c.u1 == socket.id || c.u2 == socket.id);
        if (pairedIdx.length != 0){
            // remove
            let pair = pairedIdx[0];
            // send notice to its partner (if any) that its no longer connected
            let partner = pair.u1 == socket.id ? pair.u2 : pair.u1;
            //socket.to(pair.u1 == socket.id ? pair.u2 : pair.u1).emit('pair disconnected');
            socket.to(partner).emit('pair disconnected');
            chatQueue.push(partner);
            // also: add pair to queue again.

            removeItemOnce(pairedClients, pair);
            
        }

        // check if it exists as unpaired
        let queueIdx = chatQueue.indexOf(socket.id);
        if (queueIdx.length != 0){
            removeItemOnce(chatQueue, socket.id);
        }

        console.log(`user ${socket.id} disconnected`);
    });
})

server.listen(port, () => {
    console.log(`App listening at port ${port}.`);
});

