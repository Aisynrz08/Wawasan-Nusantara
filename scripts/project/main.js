import { KEYS, LAYOUTS, ItemSystem, panelState } from "./vars.js";
import { PlayerHandler } from "./player.js";
import { ItemHandler } from "./items.js";
import { FragmenHandler } from "./fragmen.js";
import { once, level1Intro, level1Zones, resetScenes, setupPortal, PortalHandler } from "./Story.js";
import { Dialogue } from "./Dialogue.js";
import { Guidance } from "./GuidanceCard.js";
import { DetectBox } from "./detectBox.js";
import { Wait } from "./wait.js";
import { PauseMenu } from "./PauseMenu.js";
import { Subtitle } from "./Subtitle.js";
import { LEVEL_MATERI, MATERI, resetMateri, resetMateriLevel, terkumpul } from "./materi.js";
import { FreeCamera } from "./freecam.js";
runOnStartup(async (runtime) => {
    runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
    console.log("Main TypeScript loaded");
});
async function OnBeforeProjectStart(runtime) {
    FreeCamera.canPan = () => !PauseMenu.isOpen && !Dialogue.isOpen && !panelState.open;
    runtime.addEventListener("mousedown", e => FreeCamera.onDown(e));
    runtime.addEventListener("mousemove", e => FreeCamera.onMove(e));
    runtime.addEventListener("mouseup", e => FreeCamera.onUp(e));
    runtime.addEventListener("tick", () => Tick(runtime));
    runtime.addEventListener("keydown", e => OnKeyDown(runtime, e));
    PauseMenu.canOpen = () => !Dialogue.isOpen && !panelState.open;
    PauseMenu.onBeforeRestart = () => {
        resetScenes();
        resetMateriLevel(LEVEL_MATERI[LAYOUTS.ActiveLayout] ?? []);
    };
    PauseMenu.on("quit", () => {
        PauseMenu.close();
        resetScenes();
        resetMateri();
        runtime.goToLayout(LAYOUTS.Main);
    });
    PauseMenu.on("stats", () => {
        const baris = MATERI.map(m => `${terkumpul.has(m.id) ? "[x]" : "[ ]"} ${m.judul}`);
        void Subtitle.say("Catatan", baris, { replace: true, duration: 3 });
    });
    // Hentikan player saat dialog terbuka
    Dialogue.onOpenChange = open => {
        const p = runtime.objects.player.getFirstInstance();
        if (open && p)
            p.behaviors.Platform.vectorX = 0;
        Subtitle.suspend(open);
    };
    runtime.addEventListener("afteranylayoutstart", e => afteranylayoutstart(runtime, e));
    ItemSystem.bindRuntime(runtime);
}
function afteranylayoutstart(runtime, event) {
    LAYOUTS.ActiveLayout = event.layout.name;
    Wait.clear();
    Dialogue.bind(runtime.objects.Dialogue.getFirstInstance() ?? null);
    FreeCamera.bind(runtime);
    Guidance.bind(runtime.objects.GuidanceCard.getFirstInstance() ?? null);
    PauseMenu.bind(runtime, runtime.objects.PauseMenu.getFirstInstance() ?? null);
    DetectBox.bind(runtime);
    Subtitle.bind(runtime.objects.Subtitle.getFirstInstance() ?? null);
    setupPortal(LAYOUTS.ActiveLayout);
    if (LAYOUTS.ActiveLayout === LAYOUTS.Level1.alias) {
        LAYOUTS.Level1.hasInit = true;
        once("level1-intro", level1Intro);
        level1Zones(runtime);
    }
}
// ---------- Handler ----------
let panel = null;
let panelRoot = null;
function PanelHandler(runtime) {
    const currentPanel = runtime.objects.fragmenPanel.getFirstInstance();
    if (!currentPanel) {
        panel = null;
        panelRoot = null;
        return;
    }
    // Sinkronkan visibilitas dengan state aplikasi.
    currentPanel.isVisible = panelState.open;
    const element = currentPanel.getElement();
    if (!element)
        return;
    // Listener hanya dipasang saat elemen berubah.
    if (element === panelRoot)
        return;
    panel = currentPanel;
    panelRoot = element;
    panelState.root = element;
    element.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element))
            return;
        // Klik di luar area gulungan menutup panel.
        if (!target.closest(".scroll-container")) {
            if (panelState.open) {
                panelState.open = false;
            }
            return;
        }
        const action = target
            .closest("[data-action]")
            ?.dataset.action;
        if (action === "continue") {
            panelState.open = false;
            runtime.callFunction("OnpanelClosed");
        }
    });
}
// ---------- Entry points ----------
const LAYARR = ["level1", "level2", "level3", "Main"];
let NextLAYARR = 0;
function OnKeyDown(runtime, event) {
    if (event.repeat)
        return;
    // Cheat
    if (runtime.keyboard.isKeyDown("KeyL")) {
        console.log(LAYARR[NextLAYARR]);
        runtime.goToLayout(LAYARR[NextLAYARR]);
        NextLAYARR++;
    }
    if (PauseMenu.handleKey(event.code)) {
        event.preventDefault();
        return;
    }
    // Dialog menelan semua tombol saat terbuka
    if (Dialogue.handleKey(event.code)) {
        event.preventDefault();
        return;
    }
    if (panelState.open)
        return;
    Guidance.handleKey(event.code);
    if (!KEYS.jump.includes(event.code))
        return;
    runtime.objects.player.getFirstInstance()
        ?.behaviors.Platform.simulateControl("jump");
}
function Tick(runtime) {
    Wait.update(runtime.dt);
    PanelHandler(runtime);
    if (PauseMenu.isOpen || panelState.open || Dialogue.isOpen) {
        runtime.objects.player.getFirstInstance()?.setAnimation("idle");
        return;
    }
    DetectBox.update(runtime.dt);
    FreeCamera.update(runtime.dt);
    PlayerHandler(runtime);
    ItemHandler(runtime);
    FragmenHandler(runtime);
    PortalHandler(runtime);
}
