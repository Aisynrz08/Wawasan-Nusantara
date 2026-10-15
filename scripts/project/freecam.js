import { KEYS } from "./vars.js";
const PAN_BUTTON = 1; // 0 = kiri, 1 = tengah, 2 = kanan
const MAX_X = 640; // jarak maksimum dari pemain (layout px)
const MAX_Y = 360;
const RETURN_DELAY = 2; // detik setelah dilepas sebelum kembali
const RETURN_SPEED = 8; // makin besar makin cepat kembali
// const WHEEL_SPEED = 1;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
class FreeCam {
    runtime = null;
    dragging = false;
    free = false;
    returning = false;
    returnIn = Infinity;
    anchor = [0, 0];
    /** Kembalikan false untuk melarang geser (pause, dialog, dst). */
    canPan = () => true;
    /** Panggil tiap layout start. */
    bind(runtime) {
        this.runtime = runtime;
        this.dragging = false;
        this.free = false;
        this.returning = false;
        this.returnIn = Infinity;
    }
    // ---------- Event mouse ----------
    onDown(e) {
        if (e.button !== PAN_BUTTON || !this.canPan())
            return;
        const layer = this.layer();
        if (!layer)
            return;
        e.preventDefault(); // cegah autoscroll klik tengah browser
        this.dragging = true;
        this.goFree();
        this.returnIn = Infinity;
        this.anchor = layer.cssPxToLayer(e.clientX, e.clientY);
    }
    onMove(e) {
        if (!this.dragging)
            return;
        if (!this.canPan()) {
            this.dragging = false;
            this.returnIn = RETURN_DELAY;
            return;
        }
        const layer = this.layer();
        if (!layer)
            return;
        // Geser sampai titik awal kembali berada di bawah kursor.
        const [cx, cy] = layer.cssPxToLayer(e.clientX, e.clientY);
        this.pan(this.anchor[0] - cx, this.anchor[1] - cy);
    }
    onUp(e) {
        if (e.button !== PAN_BUTTON || !this.dragging)
            return;
        this.dragging = false;
        this.returnIn = RETURN_DELAY;
    }
    // onWheel(e: WheelEvent): void {
    //   if (!this.canPan()) return;
    //   const layer = this.layer();
    //   if (!layer) return;
    //   const dxCss = e.shiftKey ? e.deltaY : e.deltaX;
    //   const dyCss = e.shiftKey ? 0 : e.deltaY;
    //   const [ax, ay] = layer.cssPxToLayer(0, 0);
    //   const [bx, by] = layer.cssPxToLayer(dxCss * WHEEL_SPEED, dyCss * WHEEL_SPEED);
    //   this.goFree();
    //   this.pan(bx - ax, by - ay);
    //   this.returnIn = RETURN_DELAY;
    // }
    /** Dari OnKeyDown: tombol gerak mengembalikan kamera ke pemain. */
    handleKey(code) {
        if (!this.free || this.dragging)
            return;
        if (KEYS.left.includes(code) || KEYS.right.includes(code) || KEYS.jump.includes(code)) {
            this.returnIn = 0;
        }
    }
    /** Panggil tiap tick (di jalur yang tidak sedang pause). */
    // update(dt: number): void {
    //   if (!this.free || this.dragging) return;
    //   this.returnIn -= dt;
    //   if (this.returnIn > 0) return;
    //   this.returning = true;
    //   const rt = this.runtime;
    //   const p = rt?.objects.player.getFirstInstance();
    //   if (!rt || !p) return;
    //   const lay = rt.layout;
    //   const k = 1 - Math.exp(-RETURN_SPEED * dt);
    //   const x = lay.scrollX + (p.x - lay.scrollX) * k;
    //   const y = lay.scrollY + (p.y - lay.scrollY) * k;
    //   lay.scrollTo(x, y);
    //   if (Math.hypot(p.x - x, p.y - y) < 2) {
    //     this.free = false;
    //     this.returning = false;
    //   }
    // }
    update(dt) {
        const rt = this.runtime;
        const p = rt?.objects.player.getFirstInstance();
        if (!rt || !p)
            return;
        if (!this.free) {
            rt.layout.scrollTo(p.x, p.y);
            return;
        }
        if (this.dragging)
            return;
        this.returnIn -= dt;
        if (this.returnIn > 0)
            return;
        const lay = rt.layout;
        const k = 1 - Math.exp(-RETURN_SPEED * dt);
        const x = lay.scrollX + (p.x - lay.scrollX) * k;
        const y = lay.scrollY + (p.y - lay.scrollY) * k;
        lay.scrollTo(x, y);
        if (Math.hypot(p.x - x, p.y - y) < 2)
            this.free = false;
    }
    // ---------- Internal ----------
    layer() {
        return this.runtime?.objects.player.getFirstInstance()?.layer ?? null;
    }
    goFree() {
        this.returning = false;
        if (this.free)
            return;
        this.free = true;
        // this.setFollow(false);
    }
    // private setFollow(on: boolean): void {
    //   const st = this.runtime?.objects.player.getFirstInstance()?.behaviors.ScrollTo;
    // }
    pan(dx, dy) {
        const rt = this.runtime;
        const p = rt?.objects.player.getFirstInstance();
        if (!rt || !p)
            return;
        const lay = rt.layout;
        const x = clamp(lay.scrollX + dx, p.x - MAX_X, p.x + MAX_X);
        const y = clamp(lay.scrollY + dy, p.y - MAX_Y, p.y + MAX_Y);
        lay.scrollTo(clamp(x, 0, lay.width), clamp(y, 0, lay.height));
    }
}
export const FreeCamera = new FreeCam();
