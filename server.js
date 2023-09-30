const http = require('http') // Import HTTP library
const app = require('./app') // Import Express.js app

const server = http.createServer(app) // Create HTTP server running Express app

const PORT = 8080

server.listen(PORT, () => { // Run server on port 8080
    console.log("Server listening on port " + PORT)
})

const { Server } = require('socket.io') // Import Server class of Socket.IO library

const io = new Server(server) // Create new server running on HTTP server

const rooms = {}

io.on('connection', socket => { // Whenever a client connects to the server
    let room
    let username
    let level

    socket.on('give username', u => { // Store in variable when client sends username
        username = u
    })

    socket.on('new room', () => { // Client requested to create new room
        /* Generate room code
        - 8 characters
        - Upper/lowercase letters and numbers
        - Continually generate until unique one found
        */
        
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890" // Allowed characters
    
        let r
    
        // Continually generate code until unique one found
        do {
            r = "" // Set room to empty string
    
            // 8 random characters
            for (let i = 0; i < 8; i++) {
                r += chars[Math.floor(Math.random() * chars.length)]
            }
    
            if (!Object.keys(rooms).includes(r)) { // Unique
                break // Stop loop
            }
        } while (true)

        rooms[r] = {
            members: {},
            worlds: [
                World("grass", "dirt", "tree"),
                World("sand", "sandstone", "cactus"),
                World("redsand", "terracota", "deadbush"),
                World("snow", "stone", "sprucetree")
            ],
            leaderboards: [],
            started: false
        }

        socket.emit('new room', r) // Send client their room code
    })

    socket.on('join room', r => { // Client has requested to join room
        /* Check conditions for joining
        - Room exists
        - Room has less than 5 players already
        - Room has not started playing
        */
        
        if (!Object.keys(rooms).includes(r)) { // Room doesn't exist
            socket.emit('room error', 'Room does not exist.')
            return
        }
            
        if (Object.keys(rooms[r].members).length == 5) { // Room is full
            socket.emit('room error', 'Room is full.')
            return
        }
    
        if (rooms[r].started) { // Room has started playing
            socket.emit('room error', 'Room has already started playing.')
            return
        }

        room = r // Store room

        level = 0

        // Add entry to room members
        rooms[room].members[socket.id] = {
            username: username,
            index: Object.keys(rooms[room].members).length
        }

        // Join room and inform client
        socket.join(room)
        socket.emit('join room', room)
    })

    socket.on('update usernames', () => { // Client requested updated usernames
        const usernames = []
    
        // Go through each member and add their username to list
        Object.keys(rooms[room].members).forEach(id => {
                usernames.push(rooms[room].members[id].username)
        })
    
        socket.emit('update usernames', usernames) // Send new list
    })

    socket.on('start game', () => { // Player requested to start game
        io.to(room).emit('start game') // Broadcast to all players in the room to start
    })

    socket.on('load world', () => {
        try {
            socket.emit('load world', rooms[room].worlds[level])
        } catch {}
    })

    socket.on('disconnect', () => {
        try {
            const disconnectingIndex = rooms[room].members[socket.id].index

            delete rooms[room].members[socket.id]

            if (Object.keys(rooms[room].members).length == 0) {
                delete rooms[room]
            } else {
                Object.keys(rooms[room].members).forEach(id => {
                    if (rooms[room].members[id].index > disconnectingIndex) {
                        rooms[room].members[id].index--
                    }
                })
            }

        } catch {}
    })

    socket.on('get room numbers', () => {
        const index = rooms[room].members[socket.id].index
        const total = Object.keys(rooms[room].members).length

        socket.emit('get room numbers', {
            index: index,
            total: total
        })
    })

    socket.on('spawn monster', data => {
        socket.to(room).emit('spawn monster', data)
    })

    socket.on('update monster', data => {
        socket.to(room).emit('update monster', data)
    })
    
    socket.on('explode creeper', number => {
        socket.to(room).emit('explode creeper', number)
    })
    
    socket.on('shoot arrow', data => {
        socket.to(room).emit('shoot arrow', data)
    })

    socket.on('update car', data => {
        const index = rooms[room].members[socket.id].index

        socket.to(room).emit('update car', {
            index: index,
            position: data.position,
            angle: data.angle
        })
    })

    socket.on('open chest', data => {
        const { position, player } = data

        const { x, y } = position

        const chestIndex = rooms[room].worlds[level].findIndex(block => block.y == y && block.x == x && block.name === "chest")

        if (chestIndex != -1) {
            rooms[room].worlds[level].splice(chestIndex, 1)

            io.to(room).emit('load world', rooms[room].worlds[level])

            if (player) {
                socket.emit('open chest')
            }
        }
    })

    socket.on('spawn fireball', data => {
        io.to(room).emit('spawn fireball', data)
    })

    socket.on('place tnt', position => {
        io.to(room).emit('place tnt', position)
    })

    socket.on('died', () => {
        socket.to(room).emit('died', rooms[room].members[socket.id].index)
    })

    socket.on('revived', () => {
        socket.to(room).emit('revived', rooms[room].members[socket.id].index)
    })

    socket.on('finish', position => {
        if (!rooms[room].leaderboards[level]) {
            rooms[room].leaderboards[level] = []
        }

        const points = [10, 5, 4, 2, 0]

        rooms[room].leaderboards[level].push({
            username: username,
            points: points[position]
        })

        const totalPlayers = Object.keys(rooms[room].members).length
        const finishedPlayers = Object.keys(rooms[room].leaderboards[level]).length

        if (totalPlayers == finishedPlayers) {
            io.to(room).emit('go to leaderboard')
        }
    })

    socket.on('get leaderboard', () => {
        socket.emit('get leaderboard', rooms[room].leaderboards[level])

        setTimeout(() => {
            if (level == 3) {
                socket.emit('go to final leaderboard')
            } else {
                level++
                socket.emit('next level')
            }
        }, 5000)
    })

    socket.on('get final leaderboard', () => {
        const finalLeaderboard = []

        Object.keys(rooms[room].members).forEach(member => {
            const { username } = rooms[room].members[member]
            
            let points = 0

            rooms[room].leaderboards.forEach(leaderboard => {
                const index = leaderboard.findIndex(entry => entry.username === username)
                points += leaderboard[index].points
            })

            finalLeaderboard.push({
                username: username,
                points: points
            })
        })

        while (true) {
            let swapped = false

            for (let i = 0; i < finalLeaderboard.length - 1; i++) {
                if (finalLeaderboard[i].points < finalLeaderboard[i + 1].points) {
                    const backup = finalLeaderboard[i]

                    finalLeaderboard[i] = finalLeaderboard[i + 1]
                    finalLeaderboard[i + 1] = backup

                    swapped = true
                }
            }

            if (!swapped) {
                break
            }
        }

        socket.emit('get final leaderboard', finalLeaderboard)
    })
})

/* Function for generating world
- Takes surrounding block, road block, and prop as parameters.
- Generates 20x1000 block world with road in the horizontal middle.
- Scatters given prop on the surroundings.
- Scatters chest on the road.
*/

function World(main, road, prop) {
    const world = []

    for (let y = 0; y < 1000; y++) { // 1000 blocks down
        for (let x = 0; x < 20; x++) { // 20 blocks across
            /*
            - If X is outside of road, block is surrounding.
            - If X is inside of road, block is road.
            - Z is 1 so it appears as the furthest back layer.
            */

            world.push({
                name: (x < 8 || x > 12) ? main : (y == 20) ? "finish" : road,
                x: x,
                y: y,
                z: 1
            })
        }
    }

    // Add props to world

    addProps(world, prop, 1000, 0, 7)

    scatterChests(world, 30)

    addProps(world, prop, 1000, 13, 20)

    return world
}

/* Function to add specified prop to a part of the world
- Runs for the amount of props given
- Randomly generates X and Y
- Adds entry to the world for the prop
- Z is 2 so it appears on top of the base layer.
*/

function addProps(world, prop, number, startX, endX) {
    for (let i = 0; i < number; i++) {
        let x = randomBetween(startX, endX) // Generate random number between start and end of region
        let y = Math.floor(Math.random() * 1000) // Generate random number between 0 and 999

        world.push({
            x: x,
            y: y,
            z: 2,
            name: prop
        })
    }
}

function scatterChests(world, space) {
    const start = Math.floor(Math.random() * 5) + 20
    const end = 960

    const numberOfRows = Math.floor((end - start) / space)

    for (let y = start; y < numberOfRows + start; y++) {
        for (let x = 8; x < 13; x++) {
            world.push({
                x: x,
                y: y * space,
                z: 2,
                name: "chest"
            })
        }
    }
}

function randomBetween(start, end) {
    return Math.floor(Math.random() * (end - start + 1)) + start
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}
