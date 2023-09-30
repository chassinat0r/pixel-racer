function countdown(s = 3) {
    destroyAll("countdown")

    if (s >= 0) {
        add([
            text(s || "GO!", { size: 144 }),
            color(180, 180, 180),
            area(),
            fixed(),
            z(3),
            anchor("center"),
            pos(center()),
            "countdown"
        ])

        setTimeout(() => {
            countdown(s - 1)
        }, 1000)
    } else {
        const goEvent = new CustomEvent('go')
        window.dispatchEvent(goEvent)
    }
}
