import { HtmlPanel, esc } from "./ui.js";
const ITEMS = [
    { action: "resume", label: "Lanjut main" },
    { action: "restart", label: "Ulangi level" },
    { action: "settings", label: "Pengaturan" },
    { action: "stats", label: "Statistik" },
    { action: "quit", label: "Keluar" },
];
const TOGGLE = ["Escape", "KeyP"]; // KeyP cadangan: browser sering ngambil ESC saat fullscreen
const UP = ["ArrowUp", "KeyW"];
const DOWN = ["ArrowDown", "KeyS"];
const OK = ["Enter", "Space", "KeyE"];
class PauseMenuSystem {
    panel = new HtmlPanel();
    runtime = null;
    open = false;
    index = 0;
    note = "";
    handlers = new Map();
    /** Kembalikan false untuk melarang pause (mis. saat dialog terbuka). */
    canOpen = () => true;
    /** Dipanggil sebelum restart (untuk mereset state global). */
    onBeforeRestart;
    constructor() {
        this.on("resume", () => this.close());
        this.on("restart", () => this.restart());
        this.on("stats", () => { });
        this.on("settings", () => { });
    }
    get isOpen() {
        return this.open;
    }
    /** Pasang fungsi sebuah menu. Menu tanpa handler tampil redup "(segera)". */
    on(action, fn) {
        this.handlers.set(action, fn);
        return this;
    }
    /** Panggil tiap layout start. */
    bind(runtime, inst) {
        this.runtime = runtime;
        this.open = false;
        runtime.timeScale = 1; // jaga-jaga jika layout dimulai saat pause
        this.panel.bind(inst);
        this.panel.visible = false;
        const el = this.panel.element;
        if (!el)
            return;
        el.addEventListener("click", e => {
            const i = this.itemIndex(e);
            if (this.open && i >= 0) {
                this.index = i;
                this.pick(i);
            }
        });
        el.addEventListener("mouseover", e => {
            const i = this.itemIndex(e);
            if (this.open && i >= 0)
                this.setIndex(i);
        });
    }
    /** Dipanggil dari OnKeyDown. Return true jika tombol dimakan. */
    handleKey(code) {
        if (TOGGLE.includes(code)) {
            if (this.open)
                this.close();
            else if (this.panel.element && this.canOpen())
                this.show();
            else
                return false;
            return true;
        }
        if (!this.open)
            return false;
        if (UP.includes(code))
            this.setIndex(this.index - 1);
        else if (DOWN.includes(code))
            this.setIndex(this.index + 1);
        else if (OK.includes(code))
            this.pick(this.index);
        return true; // pause menelan semua tombol
    }
    close() {
        if (!this.open)
            return;
        this.open = false;
        if (this.runtime)
            this.runtime.timeScale = 1;
        this.panel.visible = false;
    }
    // ---------- Internal ----------
    show() {
        if (!this.runtime)
            return;
        this.open = true;
        this.index = 0;
        this.note = "";
        this.runtime.timeScale = 0;
        this.panel.visible = true;
        this.render();
    }
    restart() {
        const rt = this.runtime;
        if (!rt)
            return;
        this.onBeforeRestart?.();
        this.close(); // kembalikan timeScale sebelum pindah layout
        rt.goToLayout(rt.layout.name);
    }
    pick(i) {
        const fn = this.handlers.get(ITEMS[i].action);
        if (!fn) {
            this.note = "Belum tersedia";
            this.render();
            return;
        }
        fn();
    }
    setIndex(i) {
        const n = ITEMS.length;
        const next = ((i % n) + n) % n;
        if (next === this.index && !this.note)
            return;
        this.index = next;
        this.note = "";
        this.render();
    }
    itemIndex(e) {
        const li = e.target?.closest?.("[data-index]");
        return li ? Number(li.getAttribute("data-index")) : -1;
    }
    render() {
        const list = ITEMS.map((it, i) => {
            const cls = [
                i === this.index ? "is-active" : "",
                this.handlers.has(it.action) ? "" : "is-disabled",
            ].filter(Boolean).join(" ");
            return `<li data-index="${i}" class="${cls}">${esc(it.label)}</li>`;
        }).join("");
        const hint = this.note || "W/S pilih - Enter OK - Esc lanjut";
        void this.panel.setHtml(".pause-card", `<h2 class="pause-title">JEDA</h2>
       <ul class="pause-list">${list}</ul>
       <p class="pause-hint">${esc(hint)}</p>`);
    }
}
export const PauseMenu = new PauseMenuSystem();
