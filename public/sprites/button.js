/* Function to draw a button with label
- Draw grey rectangle 200x60 at specified co-ordinates
- Add white text with label on top of it
*/

function Button(x, y, label) {
    const button = add([
        rect(200, 60),
        color(170, 170, 170),
        area(),
        fixed(),
        anchor("center"),
        pos(x, y)
    ])

    add([
        text(label, { size: 25 }),
        color(255, 255, 255),
        area(),
        fixed(),
        anchor("center"),
        pos(x, y)
    ])

    return button
}
