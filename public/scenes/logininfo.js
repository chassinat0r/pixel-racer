/* Login info scene
- This will be shown to signed out users
- Game title
- Message saying account is required
- Button that goes to login page
*/

function loginInfoScene() {
    add([
        text("PIXELRACER", { size: 96 }),
        color(160, 160, 160),
        area(),
        fixed(),
        anchor("top"),
        pos(center().x, 10)
    ])

    // Add text informing player they must sign in
    add([
        text("In order to play Pixel Racer, you must sign in.", { size: 20 }),
        color(150, 150, 150),
        area(),
        fixed(),
        anchor("center"),
        pos(center().x, center().y - 60) // 60px above centre
    ])

    const signInButton = Button(center().x, center().y, "Sign In") // Add sign in button to centre

    // When sign in button is clicked, go to sign in form
    signInButton.onClick(() => {
        location.href = "/sign-in.html"
    })
}
