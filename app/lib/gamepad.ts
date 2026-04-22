export function getConnectedGamepads() {
    return navigator.getGamepads? Array.from(navigator.getGamepads()).filter((gp): gp is Gamepad => gp !== null)
    : [];
}