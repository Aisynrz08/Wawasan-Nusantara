import { LAYOUTS, ItemSystem, panelState, ANIM } from "./vars.js";
import { fragment } from "./FragmenData.js";
import { kumpulkan } from "./Story.js";
let idMateri = 0;
function fragmenPanel(runtime) {
    const panel = runtime.objects.fragmenPanel.getFirstInstance();
    const root = panel?.getElement();
    if (!panel || !root)
        return;
    const isCollide = ItemSystem.isCollide;
    if (!isCollide)
        return;
    const titleElement = root.querySelector("#fragment-title");
    const bodyElement = root.querySelector("#fragment-body");
    if (!titleElement || !bodyElement) {
        throw new Error("Elemen fragmen tidak ditemukan");
    }
    titleElement.textContent = fragment[idMateri].title;
    bodyElement.replaceChildren(...fragment[idMateri].paragraphs.map((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        return p;
    }));
    runtime.objects.player.getFirstInstance()?.setAnimation(ANIM.idle);
    panelState.open = true;
}
export function FragmenHandler(runtime) {
    if (LAYOUTS.ActiveLayout === LAYOUTS.Main)
        return;
    if (!ItemSystem.isCollide)
        return;
    const frag = ItemSystem.getCurrentItem;
    if (!frag)
        return;
    const id = frag.instVars.materi;
    ItemSystem.destroy();
    void kumpulkan(id);
}
