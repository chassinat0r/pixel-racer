/* Wait scene
- Display code of room
- Display list of players
- Button to start gameplay
*/

function waitScene(room) {
    socket.off()

    // Text displaying room code
    add([
        text("Your room code is " + room, { size: 25 }),
        color(150, 150, 150),
        area(),
        fixed(),
        anchor("center"),
        pos(center().x, center().y - 200)
    ])

    // Text for list of usernames
    const usernamesList = add([
        text("", { size: 20 }),
        color(150, 150, 150),
        area(),
        fixed(),
        anchor("center"),
        pos(center())
    ])

    // Continually request updated list
    onUpdate(() => {
        socket.emit('update usernames')
    })

    /* On receiving list of usernames, 
    reset text and add each username
    on a new line
    */
    socket.on('update usernames', us => {
        usernamesList.text = ""

        us.forEach(u => {
            usernamesList.text += u + "\n"
        })
    })

    const startButton = Button(center().x, center().y + 120, "Start")

    startButton.onClick(() => { // Broadcast to start game when button clicked
        socket.emit('start game')
    })
    
    socket.on('start game', () => { // Player requested to start game
        go("level") // Go to level scene
    })
}
