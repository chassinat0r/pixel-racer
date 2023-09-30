/* Function to draw an input box
- Continually check for characters to be entered
- Supported characters: upper and lowercase letters, and numbers
- Up to 8 characters
*/

function Input(x, y) {
    // 200x70 grey rectangle
    add([
        rect(220, 70),
        color(130, 130, 130),
        area(),
        fixed(),
        anchor("center"),
        pos(x, y)
    ])

    // 215x65 darker rectangle on top
    add([
        rect(215, 65),
        color(80, 80, 80),
        area(),
        fixed(),
        anchor("center"),
        pos(x, y)
    ])

    // White text on top
    const input = add([
        text("", { size: 20 }),
        color(255, 255, 255),
        area(),
        fixed(),
        anchor("center"),
        pos(x, y)
    ])

    /* Continually check for supported characters to be entered 
    - If shift key is pressed, add uppercase
    - Do not exceed 8 characters
    - If backspace pressed, delete last character of input
    */
    
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890".split('')

    onKeyPress(k => {
        if (chars.includes(k)) {
            if (isKeyDown("shift")) { // Shift pressed
                k = k.toUpperCase() // Convert to uppercase
            }

            if (input.text.length < 8) { // If less than 8 characters in input
                input.text += k // Add to input
            }
        }

        if (k === "backspace") { // Backspace pressed
            input.text = input.text.substring(0, input.text.length - 1) // Delete last character
        }
    })

    return input
}
