function levelScene() {
    socket.off()

    camPos(1000, 95000)

    let world = []
    
    socket.emit('load world') // Request for world

    /* Continually render the world
    - Calculate the furthest top, bottom, left, and right blocks
    visible.
    - Go through each block in the world, if it fits within those
    limits, then render it.
    - Destroy unneeded blocks to reduce the strain on resources.
    */

    onUpdate(() => {
        destroyAll("block")

        // Calculate furthest top, bottom, left, right blocks visible by camera
        const top = (camPos().y - (height() / 2) - 100) / 100
        const bottom = (camPos().y + (height() / 2) + 100) / 100
        const left = (camPos().x - (width() / 2) - 100) / 100
        const right = (camPos().x + (width() / 2) + 100) / 100

        world.forEach(block => {
            // Check if block fits within horizontal and vertical limits
            const fitsHorizontally = block.x >= left && block.x <= right
            const fitsVertically = block.y >= top && block.y <= bottom

            if (fitsHorizontally && fitsVertically) { // Block is visible
                add([
                    sprite(block.name),
                    area(),
                    pos(block.x * 100, block.y * 100), // Translate block co-ordinates to pixels (1 block = 100 pixels)
                    z(block.z), // Layer of block; higher appear on top
                    anchor("center"),
                    "block",
                    (block.name === "chest" || block.name === "finish") ? block.name : null
                ])
            }
        })
    })

    socket.on('load world', w => { // On receiving world
        world = w // Set world variable
    })

    let positionIndicator

    socket.emit('get room numbers')

    let index
    let total

    let myCar

    socket.on('get room numbers', data => {
        index = data.index
        total = data.total

        for (let i = 0; i < total; i++) {
            Car(800 + (i * 100), 97000, i)
        }

        myCar = get("car")[index]
        addMechanics(myCar)
        handleCollisions(myCar)
        setupHealth(myCar)

        positionIndicator = PositionIndicator(myCar, index)

        countdown()
    })

    socket.on('spawn monster', data => {
        const { position, number, type } = data
        const monster = Monster(position.x, position.y, type)
        monster.number = number
    })

    socket.on('update monster', data => {
        const { position, number, angle } = data

        const monsters = get("monster")
        const monsterIndex = monsters.findIndex(monster => monster.number === number)

        const monster = monsters[monsterIndex]

        if (monster) {
            monster.angle = angle
            monster.pos.x = position.x
            monster.pos.y = position.y
        }
    })

    socket.on('explode creeper', number => {
        const monsters = get("monster")
        const monsterIndex = monsters.findIndex(monster => monster.number === number)

        const creeper = monsters[monsterIndex]

        if (creeper) {
            creeperExplode(creeper)
        }
    })

    socket.on('shoot arrow', data => {
        const { position, angle } = data

        Arrow(position.x, position.y, angle)
    })

    socket.on('update car', data => {
        const { index, position, angle } = data

        const otherCar = get("car")[index]

        if (otherCar) {
            otherCar.angle = angle
            otherCar.pos.x = position.x
            otherCar.pos.y = position.y
        }
    })

    const stopwatch = Stopwatch()

    window.addEventListener('go', () => {
        startStopwatch(stopwatch)
    })

    add([
        sprite("powerup_container"),
        area(),
        fixed(),
        z(3),
        pos(20, 70)
    ])

    socket.on('open chest', () => {
        if (!myCar.powerup) {
            const powerups = ["speed", "regeneration", "healing", "tnt", "fireball", "monster-army", "blindness"]

            if (myCar.health < 8) {
                for (let i = 0; i < Math.floor(myCar.health / 2); i++) {
                    powerups.push("regeneration")
                }
    
                for (let i = 0; i < myCar.health; i++) {
                    powerups.push("healing")
                }
            }

            let position = parseInt(positionIndicator.text)
    
            if (position > 1) {
                for (let i = total; i > position; i--) {
                    powerups.push("speed")
                }
            }
    
            const selectedPowerup = powerups[Math.floor(Math.random() * powerups.length)]

            myCar.powerup = selectedPowerup

            destroyAll("powerup")

            add([
                sprite("powerup_" + myCar.powerup),
                area(),
                fixed(),
                z(3),
                pos(28, 78),
                "powerup"
            ])
        }
        
    })

    onKeyDown("shift", () => {
        let fireballShot = false

        if (myCar.powerup != null) {
            switch (myCar.powerup) {
                case "fireball":
                    const aim = add([
                        sprite("aim"),
                        area(),
                        fixed(),
                        z(3),
                        anchor("center"),
                        pos(center())
                    ])

                    onMouseMove(mpos => {
                        aim.moveTo(mpos.x, mpos.y)
                    })

                    onClick(() => {
                        if (!fireballShot) {
                            destroy(aim)

                            const angle = Math.atan2(mousePos().y - myCar.screenPos().y, mousePos().x - myCar.screenPos().x)
    
                            socket.emit('spawn fireball', {
                                position: myCar.pos,
                                speed: {
                                    x: Math.cos(angle) * 15,
                                    y: Math.sin(angle) * 15
                                },
                                sender: index
                            })

                            fireballShot = true
                        }
                    })
                    break

                case "tnt":
                    socket.emit('place tnt', {
                        x: myCar.pos.x,
                        y: myCar.pos.y,
                        angle: myCar.angle
                    })
                    break

                case "speed":                    
                    myCar.maxSpeed = 15

                    setTimeout(() => {
                        myCar.maxSpeed = 10
                    }, 10000)
                    break

                case "healing":
                    myCar.health += 3
                    break

                case "regeneration":
                    function regenerate(s = 10) {
                        if (s > 0) {
                            myCar.health++
                            setTimeout(() => {
                                regenerate(s - 1)
                            }, 1000)
                        }
                    }

                    regenerate()
                    break
                
                case "monster-army":
                    for (let i = 0; i < 5; i++) {
                        const monsterType = (i < 2) ? "zombie" : (i == 4) ? "creeper" : "skeleton"

                        const x = 800 + (i * 100)
                        const y = myCar.pos.y + 300

                        const monster = Monster(x, y, monsterType, index)

                        socket.emit('spawn monster', {
                            position: monster.pos,
                            number: monster.number,
                            type: monsterType
                        })

                        switch (monsterType) {
                            case "zombie":
                                zombieAI(monster)
                                break

                            case "skeleton":
                                skeletonAI(monster)
                                break

                            case "creeper":
                                creeperAI(monster)
                                break
                        }

                    }
                    break

                default:
                    console.log("donothing")
                    break
            }

            myCar.powerup = null
            destroyAll("powerup")
        }
    })

    socket.on('spawn fireball', data => {
        const { position, sender, speed} = data
        Fireball(position.x, position.y, sender, speed)
    })

    socket.on('place tnt', position => {
        TNT(position.x, position.y, position.angle)
    })

    socket.on('died', index => {
        const otherCar = get("car")[index]

        if (otherCar) {
            otherCar.dead = true
        }
    })

    socket.on('revived', index => {
        const otherCar = get("car")[index]

        if (otherCar) {
            otherCar.dead = false
        }
    })

    let finished = false

    window.addEventListener('finish', () => {
        if (!finished) {
            socket.emit('finish', parseInt(positionIndicator.text) - 1)

            finished = true
        }
    })

    // onUpdate(() => {
    //     destroyAll("powerup")

    //     if (myCar.powerup) {
    //         add([
    //             sprite("powerup_" + myCar.powerup),
    //             area(),
    //             fixed(),
    //             z(3),
    //             pos(20, 70),
    //             "powerup"
    //         ])
    //     }
    // })

    socket.on('go to leaderboard', () => {
        go("leaderboard")
    })
}
