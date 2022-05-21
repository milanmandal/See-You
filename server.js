require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const cors = require("cors");

app.use(cors());

const users = {};
const socketToRoom = {};

io.on('connection', socket => {

    socket.on("join", roomID=>{
        if (users[roomID]) {
            const length = users[roomID].length;
            let  people = false;
            if (length === 4) {
                console.log("room is full");
                people = true;
            }
            socket.emit("room full",people);
        }
    })

    socket.on("join room", roomID => {
        if (users[roomID]) {
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID,  stream: payload.stream });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id, stream: payload.stream });
    });

    socket.on('disconnect', userid => {
        const roomID = socketToRoom[userid];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== userid);
            users[roomID] = room;
            socket.broadcast.to(roomID).emit('user left', userid);
        }
    });

});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log('server is running on port 8000'));

app.get("/", (req, res) => {
    res.send("Video Chat Server Running");
})


