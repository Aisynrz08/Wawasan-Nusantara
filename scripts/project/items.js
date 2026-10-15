import { bobPhases, LAYOUTS, ITEM_BOB, LIFT, } from "./vars.js";
// Posisi awal setiap item disimpan terpisah dari fase animasinya.
const bobOrigins = new WeakMap();
function updateBob(instance, dt, config) {
    let originY = bobOrigins.get(instance);
    if (originY === undefined) {
        originY = instance.y;
        bobOrigins.set(instance, originY);
    }
    const phase = ((bobPhases.get(instance) ?? 0) + config.speed * dt)
        % (Math.PI * 2);
    bobPhases.set(instance, phase);
    const amplitude = config.amplitude ?? config.amplitudo ?? 0;
    // Posisi dihitung dari titik awal, bukan ditambahkan terus-menerus.
    instance.y = originY - Math.sin(phase) * amplitude;
}
function updateFloatingItems(runtime) {
    const dt = runtime.dt;
    for (const box of runtime.objects.box.instances()) {
        updateBob(box, dt, ITEM_BOB.BOX);
    }
    for (const fragment of runtime.objects.fragmens.instances()) {
        updateBob(fragment, dt, ITEM_BOB.FRAGMEN);
    }
}
const fadeStates = new WeakMap();
const FADE_OUT_DEFAULT = 2; // detik solid -> transparan
const FADE_IN_DEFAULT = 0.6; // detik transparan -> solid
const HIDE_DEFAULT = 1.5; // detik tetap hilang
const MIN_SOLID_OPACITY = 0.3; // di bawah ini lift tidak bisa dipijak
const BASE_X = 0; // arah dasar saat dinaiki. 1 = ke kanan, -1 = ke kiri
const BASE_Y = -1; // -1 = naik, 1 = turun
const IDLE_OPACITY = 0.6;
const FADE_SPEED = 4;
function updateFade(lift, riding, dt) {
    const pingPong = (lift.instVars.fadePingPong || 0) === 1;
    // Mode lama: redup saat tidak dinaiki, terang saat dinaiki
    if (!pingPong) {
        const target = riding ? 1 : IDLE_OPACITY;
        const k = 1 - Math.exp(-FADE_SPEED * dt);
        lift.opacity += (target - lift.opacity) * k;
        lift.isCollisionEnabled = true;
        return;
    }
    let s = fadeStates.get(lift);
    if (!s) {
        s = { phase: "solid", timer: 0 };
        fadeStates.set(lift, s);
    }
    const outTime = lift.instVars.fadeOutTime || FADE_OUT_DEFAULT;
    const hideTime = lift.instVars.fadeHideTime || HIDE_DEFAULT;
    switch (s.phase) {
        case "solid":
            // Mulai memudar begitu pemain naik
            lift.opacity = 1;
            lift.isCollisionEnabled = true;
            if (riding)
                s.phase = "fading";
            break;
        case "fading":
            lift.opacity = Math.max(0, lift.opacity - dt / outTime);
            if (lift.opacity <= 0) {
                s.phase = "hidden";
                s.timer = hideTime;
            }
            break;
        case "hidden":
            // Collision dimatikan setelah benar-benar hilang, supaya pemain jatuh
            lift.opacity = 0;
            lift.isCollisionEnabled = false;
            s.timer -= dt;
            if (s.timer <= 0)
                s.phase = "returning";
            break;
        case "returning":
            lift.isCollisionEnabled = true;
            lift.opacity = Math.min(1, lift.opacity + dt / FADE_IN_DEFAULT);
            if (lift.opacity >= 1)
                s.phase = "solid";
            break;
    }
}
function updateLifts(runtime) {
    const player = runtime.objects.player.getFirstInstance();
    if (!player)
        return;
    const playerBox = player.getBoundingBox();
    if (!playerBox)
        return;
    const lifts = Array.from(runtime.objects.lift.instances());
    const feetTolerance = 4;
    let standingLift = null;
    for (const lift of lifts) {
        const liftBox = lift.getBoundingBox();
        if (!liftBox)
            continue;
        const overlapsX = playerBox.right > liftBox.left &&
            playerBox.left < liftBox.right;
        const feetOnTop = Math.abs(playerBox.bottom - liftBox.top) <= feetTolerance;
        if (overlapsX && feetOnTop) {
            standingLift = lift;
            break;
        }
    }
    for (const lift of lifts) {
        const inv = lift.instVars.inverse || 0;
        const dx = (inv & 1) ? -BASE_X : BASE_X;
        const dy = (inv & 2) ? -BASE_Y : BASE_Y;
        const speed = lift.instVars.speed || LIFT.speed;
        const base = speed * runtime.dt;
        const riding = lift === standingLift;
        const len = lift.instVars.yLen;
        updateFade(lift, riding, runtime.dt);
        if (riding) {
            lift.instVars.moved = true;
            lift.instVars.yLen = len + base;
            lift.x += dx * base;
            lift.y += dy * base;
        }
        else {
            lift.instVars.moved = false;
            if (len > 0) {
                const back = Math.min(base, len);
                lift.x -= dx * back;
                lift.y -= dy * back;
                lift.instVars.yLen = len - back;
            }
            else {
                lift.instVars.yLen = 0;
            }
        }
    }
}
export function ItemHandler(runtime) {
    if (!LAYOUTS.Level1.hasInit)
        return;
    updateFloatingItems(runtime);
    updateLifts(runtime);
}
