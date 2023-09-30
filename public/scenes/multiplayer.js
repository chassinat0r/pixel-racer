/* Multiplayer scene
- Shown after clicking play button
- Input box for entering room code
- Buttons to join room or create new room
- Instruction text for each option
*/

function multiplayerScene() {
    socket.off()

    // Instruction text for joining a room
    add([
        text("Enter an eight-digit room code", { size: 20 }),
        color(150, 150, 150),
        area(),
        fixed(),
        anchor("center"),
        pos(center().x, center().y - 160) // 160px above centre
    ])

    const roomInput = Input(center().x, center().y - 100) // Input for room code

    const joinRoomButton = Button(center().x, center().y, "Join Room") // Button to join room

    // Instruction text for creating a new room
    add([
        text("Or, create a new room", { size: 20 }),
        color(150, 150, 150),
        area(),
        fixed(),
        anchor("center"),
        pos(center().x, center().y + 100)
    ])

    const newRoomButton = Button(center().x, center().y + 160, "New Room") // Button to create new room
    
    joinRoomButton.onClick(() => { // Join button clicked
        if (roomInput.text.length == 8) { // Player has entered 8 character code
            socket.emit('join room', roomInput.text) // Ask server to join room
        }
    })

    newRoomButton.onClick(() => {
        socket.emit('new room')
    })

    socket.on('new room', room => { // On receiving room, request to join
        socket.emit('join room', room)
    })

    socket.on('join room', room => { // Successfully joined room
        go("wait", room) // Go to wait scene
    })

    socket.on('room error', err => { // Error occured joining room
        alert("Error joining room: " + err) // Display error in popup alert
    })
}
