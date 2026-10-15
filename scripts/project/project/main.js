import { KEYS, debugText, LAYOUTS, ItemSystem, panelState } from "./vars.js";
import { PlayerHandler } from "./player.js";
import { ItemHandler } from "./items.js";
import { FragmenHandler } from "./fragmen.js";
runOnStartup(async (runtime) => {
    runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
    console.log("Main TypeScript loaded");
});
async function OnBeforeProjectStart(runtime) {
    runtime.addEventListener("tick", () => Tick(runtime));
    runtime.addEventListener("keydown", (e) => OnKeyDown(runtime, e));
    runtime.addEventListener("afteranylayoutstart", (event) => {
        LAYOUTS.ActiveLayout = event.layout.name;
        if (LAYOUTS.ActiveLayout !== LAYOUTS.Main) {
            const dbgtxt = runtime.objects.DebugText.getFirstInstance();
            if (!dbgtxt) {
                console.warn("DebugText instance tidak ditemukan");
                return;
            }
            debugText.bind(dbgtxt);
            debugText.reset();
            if (!LAYOUTS.Level1.hasInit && LAYOUTS.ActiveLayout === LAYOUTS.Level1.alias)
                LAYOUTS.Level1.hasInit = true;
        }
    });
    ItemSystem.bindRuntime(runtime);
    console.log("End of OnBeforeProjectStart");
}
// ---------- Handler ----------
let panel;
let root;
function PanelHandler(runtime) {
    if (panel)
        panel.isVisible = panelState.open;
    if (root === panelState.root)
        return; // sudah terpasang
    panel = runtime.objects.fragmenPanel.getFirstInstance();
    root = panel?.getElement();
    if (!panel || !root)
        return;
    root.addEventListener("click", (e) => {
        const target = e.target;
        if (!(target instanceof Element))
            return;
        // Klik di luar panel gulungan
        if (!target.closest(".scroll-container")) {
            if (panelState.open) {
                panelState.open = false;
                // runtime.callFunction("OnFragmentOutsideClick");
            }
            return;
        }
        const action = target.closest("[data-action]")?.dataset.action;
        if (action === "continue") {
            panelState.open = false;
            runtime.callFunction("OnpanelClosed"); // opsional: kabari event sheet
        }
    });
    panelState.root = root;
}
// ---------- Entry points ----------
function OnKeyDown(runtime, e) {
    if (e.repeat || !KEYS.jump.includes(e.code))
        return;
    runtime.objects.player.getFirstInstance()?.behaviors.Platform.simulateControl("jump");
}
function Tick(runtime) {
    debugText.reset();
    PanelHandler(runtime);
    debugText.println("panelState: " + (panelState.open ? "Ye" : "Na"));
    if (panelState.open) {
        return;
    }
    PlayerHandler(runtime);
    ItemHandler(runtime);
    FragmenHandler(runtime);
}
