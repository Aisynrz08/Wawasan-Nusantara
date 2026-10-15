// [DEBUG]
class DebugText {
    str = null;
    _isBinded = false;
    bind(instance) {
        if (this._isBinded)
            return;
        this.str = instance;
        this._isBinded = true;
    }
    println(str) {
        if (!this._isBinded)
            return;
        if (!this.str)
            return;
        this.str.text += str + '\n';
    }
    print(str) {
        if (!this._isBinded)
            return;
        if (!this.str)
            return;
        this.str.text += str;
    }
    reset() {
        if (!this._isBinded)
            return;
        if (!this.str)
            return;
        this.str.text = '';
    }
    get isBind() {
        return this._isBinded;
    }
}
;
export const debugText = new DebugText();
export const KEYS = {
    left: ["KeyA", "ArrowLeft"],
    right: ["KeyD", "ArrowRight"],
    jump: ["KeyW", "Space", "ArrowUp"],
};
export const ITEM_BOB = {
    BOX: {
        speed: 2, amplitude: 30
    },
    FRAGMEN: {
        speed: 1.5,
        amplitudo: 26,
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
export let dialogueState = { obj: null, root: undefined, open: false };
