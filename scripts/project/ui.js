export function esc(v) {
    return v
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
/** Pembungkus tipis untuk satu instance HTML Element Construct 3. */
export class HtmlPanel {
    inst = null;
    queue = Promise.resolve();
    bind(inst) {
        this.inst = inst;
        this.queue = Promise.resolve();
    }
    get element() {
        return this.inst?.getElement() ?? null;
    }
    set visible(v) {
        if (this.inst)
            this.inst.isVisible = v;
    }
    /** Ganti isi elemen yang cocok dengan selector. Selalu berurutan. */
    setHtml(selector, html) {
        const inst = this.inst;
        if (!inst)
            return Promise.resolve();
        return (this.queue = this.queue
            .then(() => inst.setContent(html, "html", selector))
            .catch(e => console.warn("setContent gagal:", e)));
    }
    setClass(selector, cls, on) {
        const inst = this.inst;
        if (!inst)
            return Promise.resolve();
        return (this.queue = this.queue
            .then(() => inst.setContentClass(on ? "add" : "remove", [cls], selector))
            .catch(e => console.warn("setContentClass gagal:", e)));
    }
}
