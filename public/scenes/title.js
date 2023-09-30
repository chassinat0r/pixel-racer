/* Title scene
- This will be shown to signed in users
- Game title
- Play and Sign Out buttons
- Username displayed below buttons
*/

function titleScene() {
    socket.off()

    add([
        text("PIXEL RACER", { size: 96 }),
        color(160, 160, 160), // Grey
        area(),
        fixed(),
        anchor("top"),
        pos(center().x, 10) // Top middle of screen
    ])

    // Add buttons for play and sign out to the centre of the screen
    const playButton = Button(center().x, center().y - 40, "Play")
    const signOutButton = Button(center().x, center().y + 40, "Sign Out")

    // Add text showing username below buttons
    add([
        text("Signed in as: " + username, { size: 22 }),
        color(150, 150, 150),
        area(),
        fixed(),
        anchor("center"),
        pos(center().x, center().y + 100) // 100px below centre
    ])

    playButton.onClick(() => {
        go("multiplayer")
    })
}
