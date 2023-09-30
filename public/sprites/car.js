function Car(x, y, index) {
    console.log("car" + index)
    const colours = ["red", "green", "blue", "yellow", "purple"]

    return add([
        sprite("car_" + colours[index]),
        area(),
        body(),
        anchor("center"),
        pos(x, y),
        z(2),
        {
            angle: 0,
            index: index,
            dead: false
        },
        "car",
        "entity"
    ])
}

function addMechanics(car) {
    car.controls = {
        "forward": false,
        "reverse": false,
        "left": false,
        "right": false
    }

    car.acceleration = 0.2
    car.speed = 0
    car.maxSpeed = 10
    car.friction = 0.05

    onUpdate(() => {
        if (car.controls.forward) {
            car.speed += car.acceleration
        }
        if (car.controls.reverse) {
            car.speed -= car.acceleration
        }

        if (car.controls.left) {
            car.angle--
        }
        if (car.controls.right) {
            car.angle++
        }

        if (car.speed > 0) {
            car.speed -= car.friction
        }
        if (car.speed < 0) {
            car.speed += car.friction
        }
        if (Math.abs(car.speed) < car.friction) {
            car.speed = 0
        }

        if (car.speed > car.maxSpeed) {
            car.speed = car.maxSpeed
        }
        if (car.speed < -car.maxSpeed / 2) {
            car.speed = -car.maxSpeed / 2
        }

        car.pos.x += Math.sin(toRadians(car.angle)) * car.speed
        car.pos.y -= Math.cos(toRadians(car.angle)) * car.speed

        camPos(1000, car.pos.y - 200)

        socket.emit('update car', {
            position: car.pos,
            angle: car.angle
        })
    })

    const keyDefinitions = {
        "w": "forward",
        "s": "reverse",
        "a": "left",
        "d": "right"
    }

    window.addEventListener("go", () => {
        onKeyDown(k => {
            if (Object.keys(keyDefinitions).includes(k)) {
                const control = keyDefinitions[k]
                car.controls[control] = true
            }
        })
    
        onKeyRelease(k => {
            if (Object.keys(keyDefinitions).includes(k)) {
                const control = keyDefinitions[k]
                car.controls[control] = false
            }
        })
    })
}

function handleCollisions(car) {
    car.onCollide("finish", () => {
        car.acceleration = 0

        const finishEvent = new CustomEvent('finish')
        window.dispatchEvent(finishEvent)

        const finishText = add([
            text("FINISH!", { size: 144 }),
            area(),
            fixed(),
            z(3),
            anchor("center"),
            pos(center())
        ])

        setTimeout(() => {
            destroy(finishText)
        }, 5000)
    })

    car.onCollide("chest", c => {
        const position = {
            x: c.pos.x / 100,
            y: c.pos.y / 100
        }

        socket.emit('open chest', {
            position: position,
            player: true
        })
    })

    car.onCollide("explosion", () => {
        takeDamage(car, 4)
    })

    car.onCollide("explosion_large", () => {
        takeDamage(car, 8)
    })
    
    car.onCollideUpdate("zombie", zombie => {
        if (!zombie.timeout && zombie.allegience != car.index) {
            takeDamage(car)

            zombie.timeout = true

            setTimeout(() => {
                zombie.timeout = false
            }, 2000)
        }

    })

    car.onCollide("arrow", () => {
        takeDamage(car, 2)
    })
}

function setupHealth(car) {
    car.health = 10

    onUpdate(() => {
        if (car.health < 0) {
            car.health = 0
        }

        if (car.health > 10) {
            car.health = 10
        }

        destroyAll("heart")
        for (let i = 0; i < 10; i++) {
            add([
                sprite(i < car.health ? "heart" : "heart_empty"),
                area(),
                fixed(),
                z(3),
                pos(20 + (i * 30), 20),
                "heart"
            ])
        }

        if (car.health == 0) {
            die(car)
        }
    })
}

function die(car) {
    car.acceleration = 0
    car.speed = 0
    car.angle = 0
    car.dead = true

    car.pos.x = 800 + (car.index * 100)
    car.pos.y -= 200

    socket.emit('died')

    function revive(o = 1) {
        car.health++

        destroyAll("black")

        add([
            rect(width(), height()),
            color(0, 0, 0),
            opacity(o),
            area(),
            fixed(),
            pos(0, 0),
            z(4),
            "black"
        ])

        if (o > 0) {
            setTimeout(() => {
                revive(o - 0.1)
            }, 1000)
        } else {
            car.acceleration = 0.2
            car.dead = false
            socket.emit('revived')
        }
    }

    revive()
}

function takeDamage(car, n = 1) {
    if (!car.dead) {
        car.health -= n
    }
}
