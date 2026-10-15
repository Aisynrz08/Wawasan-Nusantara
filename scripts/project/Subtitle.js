import { HtmlPanel, esc } from "./ui.js";
import { Wait } from "./wait.js";
class SubtitleSystem {
    panel = new HtmlPanel();
    chain = Promise.resolve();
    gen = 0;
    pending = 0;
    showing = false;
    suspended = false;
    bind(inst) {
        this.gen++;
        this.chain = Promise.resolve();
        this.pending = 0;
        this.showing = false;
        this.suspended = false;
        this.panel.bind(inst);
        this.applyVisible();
    }
    say(speaker, lines, opts = {}) {
        const list = Array.isArray(lines) ? lines : [lines];
        if (opts.replace) {
            this.gen++;
            this.chain = Promise.resolve();
            this.pending = 0;
        }
        const g = this.gen;
        this.pending++;
        const run = this.chain.then(async () => {
            for (const line of list) {
                if (g !== this.gen)
                    return;
                this.show(speaker, line);
                await Wait.seconds(opts.duration ?? this.readTime(line));
            }
            if (g === this.gen && --this.pending === 0)
                this.hide();
        });
        this.chain = run.catch(console.error);
        return run;
    }
    clear() {
        this.gen++;
        this.chain = Promise.resolve();
        this.pending = 0;
        this.hide();
    }
    suspend(on) {
        this.suspended = on;
        this.applyVisible();
    }
    // ---------- Internal ----------
    readTime(line) {
        return Math.max(1.8, 0.9 + line.length * 0.045);
    }
    show(speaker, line) {
        this.showing = true;
        this.applyVisible();
        const name = speaker
            ? `<div class="character-name">${esc(speaker)}</div>`
            : "";
        void this.panel.setHtml(".sub-card", `${name}<p class="sub-text">${esc(line)}</p>`);
    }
    hide() {
        this.showing = false;
        this.applyVisible();
    }
    applyVisible() {
        this.panel.visible = this.showing && !this.suspended;
    }
}
export const Subtitle = new SubtitleSystem();
