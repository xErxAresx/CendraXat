const socket = io('http://localhost:3002')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

//Comprovem que no sigui null
if (messageForm != null) {
    //Definim el nom de l'usuari
    const name = prompt('Quin es el teu nom??')
    appendMessage('Has entrat')
    socket.emit('new-user', roomName, name)
        //Afegim un event al boto submit
    messageForm.addEventListener('submit', e => {
        e.preventDefault()
        const message = messageInput.value
        appendMessage(`Tú: ${message}`)
        socket.emit('send-chat-message', roomName, message)
        messageInput.value = ''
    })
}

//Quan es crea una sala
socket.on('room-created', room => {
    const roomElement = document.createElement('div')
    roomElement.innerText = room
    const roomLink = document.createElement('a')
    roomLink.href = `/${room}`
    roomLink.innerText = 'Entrar'
    roomContainer.append(roomElement)
    roomContainer.append(roomLink)
})

//Aqui es quan algu escriu
socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`)
})

//Quan un usuari es connecta
socket.on('user-connected', name => {
    appendMessage(`${name} connectat`)
})

//Quan un usuari es desconnecta
socket.on('user-disconnected', name => {
    appendMessage(`${name} desconnectat`)
})

//Funció que afegeix el missatge al chat
function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}