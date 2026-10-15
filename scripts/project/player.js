import { KEYS, GameState, ANIM, ItemSystem } from "./vars.js";
function updateMovement(player, runtime) {
    const keyboard = runtime.keyboard;
    if (!keyboard)
        return 0;
    const left = KEYS.left.some(key => keyboard.isKeyDown(key));
    const right = KEYS.right.some(key => keyboard.isKeyDown(key));
    // Jika kiri dan kanan ditekan bersamaan, arah menjadi 0.
    const direction = Number(right) - Number(left);
    const state = GameState.Player;
    const platform = player.behaviors.Platform;
    state.direction = direction;
    if (direction < 0) {
        platform.simulateControl("left");
    }
    else if (direction > 0) {
        platform.simulateControl("right");
    }
    // Balik sprite hanya saat arah berubah.
    if (direction !== 0 && (direction > 0) !== state.facingRight) {
        state.facingRight = direction > 0;
        player.width =
            Math.abs(player.width) * (state.facingRight ? 1 : -1);
    }
    return direction;
}
// Membantu TypeScript memahami tipe instance player.
function getPlayer(runtime) {
    return runtime.objects.player.getFirstInstance();
}
function updateAnimation(player, direction) {
    const platform = player.behaviors.Platform;
    let animation = ANIM.idle;
    if (platform.isJumping || platform.isFalling) {
        animation = ANIM.jump;
    }
    else if (direction !== 0) {
        animation = ANIM.run;
    }
    if (player.animationName !== animation) {
        player.setAnimation(animation);
    }
}
function updateItemCollision(runtime, player) {
    const fragments = runtime.objects.fragmens;
    ItemSystem.bindCurrentObject(fragments);
    ItemSystem.testCollision(player);
}
export function PlayerHandler(runtime) {
    const player = getPlayer(runtime);
    if (!runtime.keyboard || !player)
        return;
    const direction = updateMovement(player, runtime);
    updateAnimation(player, direction);
    updateItemCollision(runtime, player);
}
