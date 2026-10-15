import { KEYS, GameState, ANIM, ItemSystem, debugText } from "./vars.js";
export function PlayerHandler(runtime) {
    const kb = runtime.keyboard;
    const player = runtime.objects.player.getFirstInstance();
    let anim = ANIM.idle;
    if (!kb || !player)
        return;
    const platform = player.behaviors.Platform;
    const left = KEYS.left.some(k => kb.isKeyDown(k));
    const right = KEYS.right.some(k => kb.isKeyDown(k));
    const gsps = GameState.Player;
    const direction = (right ? 1 : 0) - (left ? 1 : 0);
    gsps.direction = direction;
    if (direction < 0)
        platform.simulateControl("left");
    else if (direction > 0)
        platform.simulateControl("right");
    if (direction !== 0 && (direction > 0) !== gsps.facingRight) {
        gsps.facingRight = direction > 0;
        player.width = Math.abs(player.width) * (gsps.facingRight ? 1 : -1);
    }
    if (player.behaviors.Platform.isJumping || player.behaviors.Platform.isFalling) {
        anim = ANIM.jump;
        debugText.println("Anim: " + anim);
    }
    else {
        anim = direction === 0 ? ANIM.idle : ANIM.run;
    }
    if (player.animationName !== anim)
        player.setAnimation(anim);
    const fragmens = runtime.objects.fragmens;
    ItemSystem.bindCurrentObject(fragmens);
    ItemSystem.testCollision(player);
}
