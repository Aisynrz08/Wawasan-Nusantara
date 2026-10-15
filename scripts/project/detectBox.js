class DetectBoxSystem {
    runtime = null;
    box = null;
    zones = new Map();
    auto = 0;
    bind(runtime) {
        this.runtime = runtime;
        this.zones.clear();
        this.box = runtime.objects.detectBox.getFirstInstance() ?? null;
        if (!this.box) {
            console.warn("DetectBox: sprite 'detectBox' tidak ada di layout ini.");
            return;
        }
        this.box.isVisible = false;
        this.box.isCollisionEnabled = true;
    }
    watch(opts) {
        const id = opts.id ?? `zone-${this.auto++}`;
        this.zones.set(id, {
            id,
            target: opts.target,
            width: opts.width,
            height: opts.height ?? opts.width,
            offsetX: opts.offsetX ?? 0,
            offsetY: opts.offsetY ?? 0,
            once: opts.once ?? false,
            delay: opts.delay ?? 0,
            cooldown: opts.cooldown ?? 0,
            when: opts.when,
            onEnter: opts.onEnter,
            onExit: opts.onExit,
            inside: false,
            fired: false,
            waited: 0,
            cooldownLeft: 0,
        });
        return id;
    }
    watchAll(type, opts) {
        for (const inst of type.instances())
            this.watch({ ...opts, target: inst });
    }
    unwatch(id) {
        this.zones.delete(id);
    }
    /** Panggil tiap tick: DetectBox.update(runtime.dt). */
    update(dt) {
        const rt = this.runtime;
        const box = this.box;
        const player = rt?.objects.player.getFirstInstance();
        if (!rt || !box || !player)
            return;
        for (const z of [...this.zones.values()]) {
            const c = this.center(z.target);
            if (!c) {
                this.zones.delete(z.id);
                continue;
            }
            if (z.cooldownLeft > 0)
                z.cooldownLeft -= dt;
            box.width = z.width;
            box.height = z.height;
            box.x = c.x + z.offsetX;
            box.y = c.y + z.offsetY;
            const hit = rt.collisions.testOverlap(player, box);
            if (hit) {
                if (!z.inside) {
                    z.inside = true;
                    z.waited = 0;
                    z.fired = false;
                }
                if (z.fired)
                    continue;
                const ready = z.cooldownLeft <= 0 && (z.when?.(z.target) ?? true);
                if (!ready) {
                    z.waited = 0;
                    continue;
                }
                z.waited += dt;
                if (z.waited >= z.delay) {
                    z.fired = true;
                    z.cooldownLeft = z.cooldown;
                    this.run(z.onEnter, z.target);
                    if (z.once)
                        this.zones.delete(z.id);
                }
            }
            else if (z.inside) {
                z.inside = false;
                if (z.fired)
                    this.run(z.onExit, z.target);
                z.fired = false;
                z.waited = 0;
            }
        }
    }
    center(t) {
        if (!("getBoundingBox" in t))
            return t;
        if (!t)
            return null;
        const r = t.getBoundingBox();
        return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
    }
    run(fn, t) {
        if (!fn)
            return;
        Promise.resolve(fn(t)).catch(console.error);
    }
}
export const DetectBox = new DetectBoxSystem();
