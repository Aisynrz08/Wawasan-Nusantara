// vars.ts
// [DEBUG]
class DebugText {
    str = null;
    bind(instance) {
        this.str = instance ?? null;
    }
    get live() {
        if (!this.str || !this.str) {
            this.str = null;
            return null;
        }
        return this.str;
    }
    println(str) {
        const t = this.live;
        if (t)
            t.text += str + "\n";
    }
    print(str) {
        const t = this.live;
        if (t)
            t.text += str;
    }
    reset() {
        const t = this.live;
        if (t)
            t.text = "";
    }
    get isBind() {
        return this.live !== null;
    }
}
export const debugText = new DebugText();
export const KEYS = {
    left: ["KeyA", "ArrowLeft"],
    right: ["KeyD", "ArrowRight"],
    jump: ["KeyW", "Space", "ArrowUp"],
};
export const ITEM_BOB = {
    BOX: {
        speed: 2, amplitude: 8
    },
    FRAGMEN: {
        speed: 2.3,
        amplitudo: 6,
    }
};
export const bobPhases = new WeakMap();
export const ANIM = { idle: "idle", run: "run", jump: "jump" };
export const LIFT = { speed: 80 };
export const LAYOUTS = {
    Main: "Main",
    Level1: {
        alias: "level1",
        hasInit: false,
    },
    Level2: {
        alias: "level2",
        hasInit: false,
    },
    ActiveLayout: "Main",
};
export const GameState = {
    Player: {
        Personal: {
            Persatuan: 0,
        },
        direction: 0,
        facingRight: true,
    }
};
class ItemSys {
    obj;
    curItem = null;
    runtime = null;
    _isCollide = false;
    bindRuntime(runtime) {
        this.runtime = runtime;
    }
    bindCurrentObject(obj) {
        this.obj = obj;
    }
    get getCurrentItem() {
        if (!this.curItem)
            return;
        return this.curItem;
    }
    destroy() {
        if (!this.curItem)
            return;
        this.curItem.destroy();
        this.curItem = null;
    }
    testCollision(player) {
        if (!this.runtime || !this.obj)
            return -1;
        this._isCollide = false;
        this.curItem = null;
        for (const ins of this.obj.instances()) {
            if (this.runtime.collisions.testOverlap(player, ins)) {
                this._isCollide = true;
                this.curItem = ins;
                return 1;
            }
        }
        return 0;
    }
    get isCollide() {
        return this._isCollide;
    }
}
;
export const ItemSystem = new ItemSys();
// ---------- State ----------
export const panelState = { root: null, open: false };
