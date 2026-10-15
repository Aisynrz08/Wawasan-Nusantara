import { bobPhases, LAYOUTS, ITEM_BOB, debugText, LIFT } from "./vars.js";
export function ItemHandler(runtime) {
    if (!LAYOUTS.Level1.hasInit)
        return;
    const player = runtime.objects.player.getFirstInstance();
    if (!player)
        return;
    for (const box of runtime.objects.box.instances()) {
        const phase = ((bobPhases.get(box) ?? 0) + ITEM_BOB.BOX.speed * runtime.dt) % (Math.PI * 2);
        bobPhases.set(box, phase);
        box.y -= Math.sin(phase) * ITEM_BOB.BOX.amplitude * runtime.dt;
    }
    for (const fragmen of runtime.objects.fragmens.instances()) {
        const phase = ((bobPhases.get(fragmen) ?? 0) + ITEM_BOB.FRAGMEN.speed * runtime.dt) % (Math.PI * 2);
        bobPhases.set(fragmen, phase);
        fragmen.y -= Math.sin(phase) * ITEM_BOB.FRAGMEN.amplitudo * runtime.dt;
    }
    const FEET_TOLERANCE = 4;
    const playerBox = player.getBoundingBox();
    if (!playerBox)
        return;
    let onLift = null;
    for (const lift of runtime.objects.lift.instances()) {
        const liftBox = lift.getBoundingBox();
        const overlapX = playerBox.right > liftBox.left && playerBox.left < liftBox.right;
        const feetOnTop = Math.abs(playerBox.bottom - liftBox.top) <= FEET_TOLERANCE;
        if (overlapX && feetOnTop) {
            onLift = lift;
            onLift.instVars.moved = true;
            break;
        }
    }
    const liftspeed = LIFT.speed * runtime.dt;
    if (onLift && onLift.instVars.moved) {
        onLift.instVars.yLen += liftspeed;
        onLift.y -= liftspeed;
    }
    for (const lift of runtime.objects.lift.instances()) {
        if (lift.instVars.yLen > 0 && lift.instVars.moved === false) {
            lift.y += liftspeed;
            lift.instVars.yLen -= liftspeed;
        }
        else {
            lift.instVars.moved = false;
        }
    }
    if (!onLift)
        return;
    debugText.println("LIFT ====");
    debugText.println("Lift y: " + onLift.y.toString());
    debugText.println("Lift yLen: " + onLift.instVars.yLen.toString());
}
