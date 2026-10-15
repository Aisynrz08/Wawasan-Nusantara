const requiredKeys = new Set(["KeyW", "KeyA", "KeyD"]);
const pressedKeys = new Set();
function handleTutorialKey(code) {
    if (!requiredKeys.has(code))
        return;
    pressedKeys.add(code);
    // Perbarui tampilan indikator di sini.
    if (pressedKeys.size === requiredKeys.size) {
        // Sembunyikan panel tutorial.
    }
}
export {};
