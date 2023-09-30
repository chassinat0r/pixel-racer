function leaderboardScene() { 
    socket.off()

    add([
        text("Leaderboard", { size: 72 }),
        color(160, 160, 160),
        area(),
        fixed(),
        anchor("top"),
        pos(center().x, 10)
    ])

    const positionText = add([
        text("Position\n", { size: 20 }),
        color(255, 255, 255),
        area(),
        fixed(),
        z(2),
        anchor("center"),
        pos(center().x - 150, center().y)
    ])

    const usernameText = add([
        text("Username\n", { size: 20 }),
        color(255, 255, 255),
        area(),
        fixed(),
        z(2),
        anchor("center"),
        pos(center())
    ])

    const pointsText = add([
        text("New Points\n", { size: 20 }),
        color(255, 255, 255),
        area(),
        fixed(),
        z(2),
        anchor("center"),
        pos(center().x + 150, center().y)
    ])

    socket.emit('get leaderboard')
    
    socket.on('get leaderboard', leaderboard => {
        add([
            rect(450, (leaderboard.length + 1) * 22),
            color(100, 100, 100),
            area(),
            fixed(),
            z(1),
            anchor("center"),
            pos(center().x, center().y - 10)
        ])

        for (let i = 0; i < leaderboard.length; i++) {
            positionText.text += (i + 1) + "\n"
            usernameText.text += leaderboard[i].username + "\n"
            pointsText.text += leaderboard[i].points += "\n"
        }

    })

    socket.on('next level', () => {
        go("level")
    })

    socket.on('go to final leaderboard', () => {
        go("final leaderboard")
    })
}

function finalLeaderboardScene() {
    socket.off()

    add([
        text("Final Leaderboard", { size: 72 }),
        color(160, 160, 160),
        area(),
        fixed(),
        anchor("top"),
        pos(center().x, 10)
    ])

    const positionText = add([
        text("Position\n", { size: 20 }),
        color(255, 255, 255),
        area(),
        fixed(),
        z(2),
        anchor("center"),
        pos(center().x - 150, center().y)
    ])

    const usernameText = add([
        text("Username\n", { size: 20 }),
        color(255, 255, 255),
        area(),
        fixed(),
        z(2),
        anchor("center"),
        pos(center())
    ])

    const pointsText = add([
        text("Total Points\n", { size: 20 }),
        color(255, 255, 255),
        area(),
        fixed(),
        z(2),
        anchor("center"),
        pos(center().x + 150, center().y)
    ])

    socket.emit('get final leaderboard')

    socket.on('get final leaderboard', leaderboard => {
        add([
            rect(450, (leaderboard.length + 1) * 22),
            color(100, 100, 100),
            area(),
            fixed(),
            z(1),
            anchor("center"),
            pos(center().x, center().y - 10)
        ])

        for (let i = 0; i < leaderboard.length; i++) {
            positionText.text += (i + 1) + "\n"
            usernameText.text += leaderboard[i].username + "\n"
            pointsText.text += leaderboard[i].points += "\n"
        }
    })

    const titleButton = Button(center().x, center().y + 200, "Go to title")

    titleButton.onClick(() => {
        go("title")
    })
}
