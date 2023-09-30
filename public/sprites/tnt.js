function TNT(x, y, angle) {
    const tnt = add([
        sprite("tnt"),
        area(),
        pos(x, y),
        z(2),
        anchor("center"),
        "tnt",
        { 
            angle: angle,
            distance: 0,
            maxDistance: 400,
            speed: {
                x: Math.sin(toRadians(angle)) * 20,
                y: Math.cos(toRadians(angle)) * 20
            }
        }
    ])

    onUpdate(() => {
        if (tnt.distance < tnt.maxDistance) {
            tnt.pos.x -= tnt.speed.x
            tnt.pos.y += tnt.speed.y

            tnt.distance += 20
        } else {
            get("car").forEach(car => {
                const distance = Math.sqrt((tnt.pos.x - car.pos.x) ** 2 + (tnt.pos.y - car.pos.y) ** 2)
    
                if (distance < 150) {
                    explode(tnt)
                }
            })
        }
    })

    setTimeout(() => {
        explode(tnt)
    }, 3000)
}

function explode(tnt) {
    if (!tnt.exploded) {
        tnt.exploded = true

        const explosion = add([
            sprite("explosion_large"),
            area(),
            pos(tnt.pos),
            z(2),
            anchor("center"),
            "explosion_large"
        ])
    
        destroy(tnt)
    
        setTimeout(() => {
            destroy(explosion)
        }, 5000)
    }
    
}
