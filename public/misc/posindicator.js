function PositionIndicator(car, index) {
    const positionIndicator = add([
        text("", { size: 200 }),
        color(181, 148, 16),
        area(),
        fixed(),
        anchor("botleft"),
        z(3),
        pos(60, height() - 40)
    ])

    onUpdate(() => {
        let position = 1

        get("car").forEach(otherCar => {
            if (otherCar.index !== index) {
                if (otherCar.pos.y < car.pos.y) {
                    position++
                }

                if (otherCar.pos.y == car.pos.y) {
                    if (otherCar.index < index) {
                        position++
                    }
                }
            }
        })

        positionIndicator.text = position
    })

    return positionIndicator
}
