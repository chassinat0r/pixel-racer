function Monster(x, y, type, allegience) {
    const monsters = get("monster")

    const monster = add([
        sprite(type),
        area(),
        body(),
        pos(x, y),
        anchor("center"),
        z(3),
        {
            number: (monsters.length) ? monsters[monsters.length-1].number + 1 : 0,
            angle: 0,
            dead: false,
            allegience: allegience
        },
        "monster",
        type
    ])

    setTimeout(() => {
        destroy(monster)
        monster.dead = true
    }, 30000)

    return monster
}

function zombieAI(monster) {
    onUpdate(() => {
        if (!monster.dead) {
            let nearestCarIndex = null
            let nearestCarDistance = null
    
            get("car").forEach(car => {
                const diffInX = car.pos.x - monster.pos.x
                const diffInY = car.pos.y - monster.pos.y
    
                const distance = Math.sqrt(diffInX ** 2 + diffInY ** 2)
    
                if (distance < 1200 && !car.dead && monster.allegience != car.index) {
                    if (distance < nearestCarDistance || nearestCarDistance == null) {
                        nearestCarIndex = car.index
                        nearestCarDistance = distance
                    }
                }
            })
    
            if (nearestCarIndex !== null) {
                const car = get("car")[nearestCarIndex]
                const diffInX = car.pos.x - monster.pos.x
                const diffInY = car.pos.y - monster.pos.y
    
                monster.angle = toDegrees(Math.atan2(diffInY, diffInX)) + 90
    
                monster.pos.x += Math.sin(toRadians(monster.angle)) * 5
                monster.pos.y -= Math.cos(toRadians(monster.angle)) * 5
        
                socket.emit('update monster', {
                    position: monster.pos,
                    angle: monster.angle,
                    number: monster.number
                })
            }       
        }
    })
}

function skeletonAI(monster) {
    onUpdate(() => {
        if (!monster.dead) {
            let nearestCarIndex = null
            let nearestCarDistance = null
    
            get("car").forEach(car => {
                const diffInX = car.pos.x - monster.pos.x
                const diffInY = car.pos.y - monster.pos.y
    
                const distance = Math.sqrt(diffInX ** 2 + diffInY ** 2)
    
                if (distance < 1000 && !car.dead && monster.allegience != car.index) {
                    if (distance < nearestCarDistance || nearestCarDistance == null) {
                        nearestCarIndex = car.index
                        nearestCarDistance = distance
                    }
                }
            })
    
            if (nearestCarIndex !== null) {
                const car = get("car")[nearestCarIndex]
                const diffInX = car.pos.x - monster.pos.x
                const diffInY = car.pos.y - monster.pos.y
    
                monster.angle = toDegrees(Math.atan2(diffInY, diffInX)) + 90

                if (nearestCarDistance > 500) {
                    monster.pos.x += Math.sin(toRadians(monster.angle)) * 5
                    monster.pos.y -= Math.cos(toRadians(monster.angle)) * 5    
                } else {
                    if (!monster.timeout) {
                        const arrow = Arrow(monster.pos.x, monster.pos.y, monster.angle)

                        socket.emit('shoot arrow', {
                            position: arrow.pos,
                            angle: arrow.angle
                        })

                        monster.timeout = true

                        setTimeout(() => {
                            monster.timeout = false
                        }, 1000)
                    }
                }
 
                socket.emit('update monster', {
                    position: monster.pos,
                    angle: monster.angle,
                    number: monster.number
                })
            }
        }
    })
}

function Arrow(x, y, angle) {
    const arrows = get("arrows")

    const arrow = add([
        sprite("arrow"),
        area(),
        body(),
        pos(x, y),
        anchor("center"),
        z(3),
        {
            number: (arrows.length) ? arrows[arrows.length-1].number + 1 : 0,
            angle: angle,
            dead: false,
            distance: 0,
            maxDistance: 2000
        },
        "arrow"
    ])

    onUpdate(() => {
        if (!arrow.dead) {
            if (arrow.distance < arrow.maxDistance) {
                arrow.pos.x += Math.sin(toRadians(arrow.angle)) * 6
                arrow.pos.y -= Math.cos(toRadians(arrow.angle)) * 6
                
                arrow.distance += 6
            } else {
                destroy(arrow)
                arrow.dead = true
            }
        }
    })

    arrow.onCollide("car", () => {
        destroy(arrow)
        arrow.dead = true
    })

    return arrow
}

function creeperAI(monster) {
    onUpdate(() => {
        if (!monster.dead) {
            let nearestCarIndex = null
            let nearestCarDistance = null
    
            get("car").forEach(car => {
                const diffInX = car.pos.x - monster.pos.x
                const diffInY = car.pos.y - monster.pos.y
    
                const distance = Math.sqrt(diffInX ** 2 + diffInY ** 2)
    
                if (distance < 1000 && !car.dead && monster.allegience != car.index) {
                    if (distance < nearestCarDistance || nearestCarDistance == null) {
                        nearestCarIndex = car.index
                        nearestCarDistance = distance
                    }
                }
            })
    
            if (nearestCarIndex !== null) {
                const car = get("car")[nearestCarIndex]
                const diffInX = car.pos.x - monster.pos.x
                const diffInY = car.pos.y - monster.pos.y
    
                monster.angle = toDegrees(Math.atan2(diffInY, diffInX)) + 90
    
                monster.pos.x += Math.sin(toRadians(monster.angle)) * 7
                monster.pos.y -= Math.cos(toRadians(monster.angle)) * 7
        
                socket.emit('update monster', {
                    position: monster.pos,
                    angle: monster.angle,
                    number: monster.number
                })
            }       
        }
    })

    monster.onCollide("car", car => {
        if (car.index != monster.allegience) {
            setTimeout(() => {
                socket.emit('explode creeper', monster.number)
                creeperExplode(monster)
            }, 1000)
        }
    })
}

function creeperExplode(creeper) {
    const explosion = add([
        sprite("explosion_small"),
        area(),
        pos(creeper.pos),
        anchor("center"),
        z(3),
        "explosion"
    ])

    destroy(creeper)
    creeper.dead = true

    setTimeout(() => {
        destroy(explosion)
    }, 3000)
}
