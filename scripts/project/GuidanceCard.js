import { HtmlPanel, esc } from "./ui.js";
class GuidanceSystem {
    panel = new HtmlPanel();
    cur = null;
    gen = 0;
    bind(inst) {
        this.gen++;
        this.cur = null;
        this.panel.bind(inst);
        this.panel.visible = false;
    }
    /** Tampilkan kartu. Promise selesai saat semua tombol ditekan / complete(). */
    show(opts) {
        this.cur?.resolve(); // kartu sebelumnya dianggap selesai
        this.gen++;
        return new Promise(resolve => {
            this.cur = { opts, done: new Set(), resolve };
            this.panel.visible = true;
            void this.panel.setClass(".guidance-card", "is-complete", false);
            this.render();
        });
    }
    /** Selesaikan manual (mis. "ambil item pertama" di event sheet / script). */
    complete() {
        const c = this.cur;
        if (!c)
            return;
        this.cur = null;
        this.render(c);
        void this.panel.setClass(".guidance-card", "is-complete", true);
        const gen = ++this.gen;
        setTimeout(() => {
            if (this.gen === gen)
                this.panel.visible = false;
        }, 300);
        c.resolve();
    }
    hide() {
        this.cur = null;
        this.gen++;
        this.panel.visible = false;
    }
    /** Dipanggil dari OnKeyDown. */
    handleKey(code) {
        const c = this.cur;
        const keys = c?.opts.keys;
        if (!c || !keys?.length)
            return;
        const i = keys.findIndex(k => [k.code].flat().includes(code));
        if (i < 0 || c.done.has(i))
            return;
        c.done.add(i);
        this.render(c);
        if (c.done.size === keys.length)
            this.complete();
    }
    render(c = this.cur) {
        if (!c)
            return;
        const { title, message, keys = [] } = c.opts;
        const progress = keys.length
            ? `<span class="guidance-progress">${c.done.size}/${keys.length}</span>`
            : "";
        const keyHtml = keys.length
            ? `<div class="guidance-keys">${keys
                .map((k, i) => {
                const done = c.done.has(i);
                return `<div class="guidance-key${done ? " is-done" : ""}">
              <span class="guidance-key-label">${esc(k.label)}</span>
              <span class="guidance-key-status">${done ? "Selesai" : "Belum"}</span>
            </div>`;
            })
                .join("")}</div>`
            : "";
        void this.panel.setHtml(".guidance-card", `<div class="guidance-header">
         <h2 class="guidance-title">${esc(title)}</h2>${progress}
       </div>
       <p class="guidance-message">${esc(message)}</p>
       ${keyHtml}`);
    }
}
export const Guidance = new GuidanceSystem();
