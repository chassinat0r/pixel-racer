kaboom({
    background: [135, 206, 235] // RGB for light blue
})

loadRoot("/Graphics/")
loadSprite("dirt", "dirt.png")
loadSprite("grass", "grass.png")
loadSprite("chest", "chest.png")
loadSprite("tree", "tree.png")
loadSprite("finish", "finish.png")
loadSprite("car_red", "car_red.png")
loadSprite("car_green", "car_green.png")
loadSprite("car_blue", "car_blue.png")
loadSprite("car_yellow", "car_yellow.png")
loadSprite("car_purple", "car_purple.png")
loadSprite("heart", "heart.png")
loadSprite("heart_empty", "heart_empty.png")
loadSprite("powerup_container", "powerup_container.png")
loadSprite("powerup_blindness", "powerup_blindness.png")
loadSprite("powerup_fireball", "powerup_fireball.png")
loadSprite("powerup_healing", "powerup_healing.png")
loadSprite("powerup_monster-army", "powerup_monster-army.png")
loadSprite("powerup_regeneration", "powerup_regeneration.png")
loadSprite("powerup_speed", "powerup_speed.png")
loadSprite("powerup_tnt", "powerup_tnt.png")
loadSprite("aim", "aim.png")
loadSprite("explosion_small", "explosion_small.png")
loadSprite("explosion_large", "explosion_large.png")
loadSprite("tnt", "tnt.png")
loadSprite("zombie", "zombie.png")
loadSprite("skeleton", "skeleton.png")
loadSprite("creeper", "creeper.png")
loadSprite("arrow", "arrow.png")
loadSprite("sand", "sand.png")
loadSprite("sandstone", "sandstone.png")
loadSprite("cactus", "cactus.png")
loadSprite("redsand", "redsand.png")
loadSprite("terracota", "terracota.png")
loadSprite("deadbush", "deadbush.png")
loadSprite("snow", "snow.png")
loadSprite("stone", "stone.png")
loadSprite("sprucetree", "sprucetree.png")

// Define all scenes
scene("title", titleScene)
scene("login info", loginInfoScene)
scene("multiplayer", multiplayerScene)
scene("wait", waitScene)
scene("level", levelScene)
scene("leaderboard", leaderboardScene)
scene("final leaderboard", finalLeaderboardScene)

let username
let socket

let session = document.cookie.split("=")[1]

/* Send get-username POST request
- Include session value
- If successful, go to title scene and connect to Socket.IO server
- If error, go to login info scene
*/

$.post({
    url: "/get-username",
    data: {
        session: session
    },
    success: res => { // Username found
        username = res
            
        socket = io() // Establish connection to Socket.IO server
        socket.emit('give username', username) // Send username to server

        go("title") // Go to title scene
    },
    error: () => { // Error while getting username
        go("login info") // Go to login info scene
    }
})
