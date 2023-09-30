function Stopwatch() {
    return add([
        text("00:00", { size: 35 }),
        color(200, 200, 200),
        area(),
        fixed(),
        anchor("topright"),
        pos(width() - 20, 20),
        z(3),
        {
            minutes: 0,
            seconds: 0
        }
    ])
}

function startStopwatch(stopwatch) {
    let s

    function updateStopwatch() {
        stopwatch.seconds++

        if (stopwatch.seconds == 60) {
            stopwatch.minutes++
            stopwatch.seconds = 0
        }

        const secondsFormat = ('0' + stopwatch.seconds).slice(-2)
        const minutesFormat = stopwatch.minutes < 10 ? ('0' + stopwatch.minutes).slice(-2) : stopwatch.minutes

        stopwatch.text = `${minutesFormat}:${secondsFormat}`

        s = setTimeout(updateStopwatch, 1000)
    }

    s = setTimeout(updateStopwatch, 1000)

    window.addEventListener('finish', () => {
        clearTimeout(s)
    })
}
