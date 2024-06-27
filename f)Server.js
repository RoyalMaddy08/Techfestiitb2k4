const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend/build')));

mongoose.connect('mongodb://localhost:27017/accommodation', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});

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

const User = mongoose.model('User', UserSchema);
const Group = mongoose.model('Group', GroupSchema);
const Hostel = mongoose.model('Hostel', HostelSchema);

const SECRET_KEY = 'your_secret_key';

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    await User.create({ username, password: hashedPassword });
    res.sendStatus(200);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).send('User not found');
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).send({ auth: false, token: null });
    }
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }
        req.userId = decoded.id;
        next();
    });
};

app.post('/upload-groups', verifyToken, async (req, res) => {
    await Group.insertMany(req.body);
    res.sendStatus(200);
    io.emit('update', { message: 'Groups updated' });
});

app.post('/upload-hostels', verifyToken, async (req, res) => {
    await Hostel.insertMany(req.body);
    res.sendStatus(200);
    io.emit('update', { message: 'Hostels updated' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
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
