import { HtmlPanel, esc } from "./ui.js";
const NEXT = ["Enter", "Space", "KeyE", "KeyF"];
const UP = ["ArrowUp", "KeyW"];
const DOWN = ["ArrowDown", "KeyS"];
class DialogueSystem {
    panel = new HtmlPanel();
    open = false;
    speaker = "";
    text = "";
    options = null;
    index = 0;
    resolver = null;
    chain = Promise.resolve();
    /** Dipanggil saat dialog dibuka/ditutup (mis. untuk menghentikan player). */
    onOpenChange;
    get isOpen() {
        return this.open;
    }
    // ---------- API untuk alur game ----------
    /** Satu atau beberapa baris. Lanjut dengan Enter/Space/E/F atau klik. */
    say(speaker, lines) {
        const list = Array.isArray(lines) ? lines : [lines];
        return this.enqueue(async () => {
            for (const line of list)
                await this.show(speaker, line, null);
            this.close();
        });
    }
    /** Menampilkan pilihan dan mengembalikan `value` yang dipilih. */
    choose(speaker, text, options) {
        return this.enqueue(async () => {
            const v = await this.show(speaker, text, options);
            this.close();
            return v;
        });
    }
    // ---------- Dihubungkan dari menu.ts ----------
    /** Panggil tiap layout start. */
    bind(inst) {
        this.cancel();
        this.panel.bind(inst);
        this.panel.visible = false;
        const el = this.panel.element;
        if (!el)
            return;
        el.addEventListener("click", e => this.onClick(e));
        el.addEventListener("mouseover", e => this.onHover(e));
    }
    /** Return true jika tombol "dimakan" dialog. */
    handleKey(code) {
        if (!this.open)
            return false;
        if (this.options) {
            if (UP.includes(code))
                this.setIndex(this.index - 1);
            else if (DOWN.includes(code))
                this.setIndex(this.index + 1);
            else if (NEXT.includes(code))
                this.pick(this.index);
        }
        else if (NEXT.includes(code)) {
            this.finish(null);
        }
        return true;
    }
    // ---------- Internal ----------
    enqueue(job) {
        const run = this.chain.then(job);
        this.chain = run.then(() => { }, () => { });
        return run;
    }
    show(speaker, text, options) {
        return new Promise(resolve => {
            this.speaker = speaker;
            this.text = text;
            this.options = options;
            this.index = 0;
            this.resolver = resolve;
            if (!this.open) {
                this.open = true;
                this.panel.visible = true;
                this.onOpenChange?.(true);
            }
            this.render();
        });
    }
    finish(value) {
        const r = this.resolver;
        this.resolver = null;
        r?.(value);
    }
    close() {
        if (!this.open)
            return;
        this.open = false;
        this.options = null;
        this.panel.visible = false;
        this.onOpenChange?.(false);
    }
    /** Dipanggil saat pindah layout: instance lama sudah hancur. */
    cancel() {
        this.resolver = null; // scene lama dibiarkan menggantung
        this.chain = Promise.resolve();
        this.open = false;
        this.options = null;
    }
    pick(i) {
        const o = this.options?.[i];
        if (o)
            this.finish(o.value);
    }
    setIndex(i) {
        if (!this.options)
            return;
        const n = this.options.length;
        const next = ((i % n) + n) % n;
        if (next === this.index)
            return;
        this.index = next;
        this.render();
    }
    itemIndex(e) {
        const li = e.target?.closest?.("[data-index]");
        return li ? Number(li.getAttribute("data-index")) : -1;
    }
    onClick(e) {
        if (!this.open)
            return;
        if (!this.options)
            return this.finish(null);
        const i = this.itemIndex(e);
        if (i >= 0)
            this.pick(i);
    }
    onHover(e) {
        if (!this.open || !this.options)
            return;
        const i = this.itemIndex(e);
        if (i >= 0)
            this.setIndex(i);
    }
    render() {
        const menu = this.options
            ? `<ul class="menu-options">${this.options
                .map((o, i) => `<li data-index="${i}"${i === this.index ? ' class="is-active"' : ""}>${esc(o.label)}</li>`)
                .join("")}</ul>`
            : "";
        const name = this.speaker
            ? `<div class="character-name">${esc(this.speaker)}</div>`
            : "";
        const prompt = this.options ? "W/S pilih - Enter OK" : "Enter / Klik";
        void this.panel.setHtml(".dialog-container", `${name}
       <div class="dialog-content">
         <div class="body-content">${esc(this.text)}</div>
         ${menu}
       </div>
       <div class="input-prompt">${prompt}</div>`);
    }
}
export const Dialogue = new DialogueSystem();
