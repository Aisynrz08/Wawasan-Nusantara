class WaitSystem {
    list = new Set();
    /** Tunggu sekian detik waktu game. */
    seconds(s) {
        return new Promise(resolve => {
            this.list.add({ left: s, resolve: () => resolve() });
        });
    }
    /**
     * Tunggu sampai kondisi true. Resolve `true` kalau kondisi terpenuhi,
     * false jika timeout (detik) habis duluan.
     */
    until(cond, timeout = Infinity) {
        return new Promise(resolve => {
            this.list.add({ left: timeout, cond, resolve });
        });
    }
    /** Panggil tiap tick: Wait.update(runtime.dt). */
    update(dt) {
        for (const p of [...this.list]) {
            if (p.cond) {
                if (p.cond()) {
                    this.list.delete(p);
                    p.resolve(true);
                    continue;
                }
                p.left -= dt;
                if (p.left <= 0) {
                    this.list.delete(p);
                    p.resolve(false);
                }
            }
            else {
                p.left -= dt;
                if (p.left <= 0) {
                    this.list.delete(p);
                    p.resolve(true);
                }
            }
        }
    }
    /* Panggil pas pindah layout: scene lama dibiarin menggantung. */
    clear() {
        this.list.clear();
    }
}
export const Wait = new WaitSystem();
