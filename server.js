const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

//Variable on guardarem les salas
const rooms = {}

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    res.redirect(req.body.room)
        //Enviem un missatge que la sala esta creada
    io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room })
})

//Numero del port on escolta
server.listen(3002)

//Quan es conecta
io.on('connection', socket => {
    socket.on('new-user', (room, name) => {
            socket.join(room)
            rooms[room].users[socket.id] = name
            socket.to(room).broadcast.emit('user-connected', name)
        })
        //Quan envia un missatge
    socket.on('send-chat-message', (room, message) => {
            socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
        })
        //Quan es desconecta
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]
        })
    })
})

//Funció que retorna els noms dels usuaris
function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}