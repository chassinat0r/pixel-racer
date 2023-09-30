function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

function getDistance(start, end) {
    return Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2)
}

function getAngle(start, end) {
    return toDegrees(Math.atan2(start.y - end.y, start.x - end.x))
}
