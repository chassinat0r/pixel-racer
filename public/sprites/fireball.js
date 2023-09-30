function Fireball(x, y, sender, speed) {
    const fireball = add([
        sprite("powerup_fireball"),
        area(),
        anchor("center"),
        pos(x, y),
        z(2),
        {
            speed: speed,
            sender: sender,
            distance: 0,
            maxDistance: 2000
        },
        "fireball"
    ])

    onUpdate(() => {
        fireball.pos.x += fireball.speed.x
        fireball.pos.y += fireball.speed.y

        fireball.distance += Math.sqrt(fireball.speed.x ** 2 + fireball.speed.y ** 2)

        if (fireball.distance > fireball.maxDistance) {
            destroy(fireball)
        }
    })

    fireball.onCollide("entity", e => {
        if (e.index != fireball.sender) {
            destroy(fireball)
            const explosion = add([
                sprite("explosion_small"),
                area(),
                anchor("center"),
                pos(e.pos.x, e.pos.y),
                z(3),
                "explosion"
            ])

            setTimeout(() => {
                destroy(explosion)
            }, 3000)
        }
    })
}
