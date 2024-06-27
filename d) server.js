const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/accommodation', { useNewUrlParser: true, useUnifiedTopology: true });

const GroupSchema = new mongoose.Schema({
    groupId: Number,
    members: Number,
    gender: String,
});
const HostelSchema = new mongoose.Schema({
    hostelName: String,
    roomNumber: Number,
    capacity: Number,
    gender: String,
});
const Group = mongoose.model('Group', GroupSchema);
const Hostel = mongoose.model('Hostel', HostelSchema);

app.use(express.json());

app.post('/upload-groups', async (req, res) => {
    await Group.insertMany(req.body);
    res.sendStatus(200);
    io.emit('update', { message: 'Groups updated' });
});

app.post('/upload-hostels', async (req, res) => {
    await Hostel.insertMany(req.body);
    res.sendStatus(200);
    io.emit('update', { message: 'Hostels updated' });
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(5000, () => {
    console.log('listening on *:5000');
});
