import { dialogueState } from "./vars.js";
const OPTIONS = [
    {
        id: "opt-defensive",
        label: "Defensive moves",
        action: "defensive",
    },
    {
        id: "opt-other",
        label: "Other moves",
        action: "other",
    },
    {
        id: "opt-training",
        label: "Free training",
        action: "training",
    },
    {
        id: "opt-no",
        label: "No",
        action: "no",
    },
];
let root = null;
let menu = null;
let items = [];
let index = 0;
let previousOpen = false;
let initialized = false;
function setActive(i) {
    if (!menu || items.length === 0)
        return;
    // Membungkus indeks agar pilihan terakhir dan pertama saling terhubung.
    index = ((i % items.length) + items.length) % items.length;
    items.forEach((item, n) => {
        item.setAttribute("aria-selected", String(n === index));
    });
    menu.setAttribute("aria-activedescendant", items[index].id);
    items[index].scrollIntoView({
        block: "nearest",
    });
}
function choose(runtime) {
    if (!menu || items.length === 0 || !dialogueState.open) {
        return;
    }
    const selected = items[index];
    if (!selected)
        return;
    const action = selected.dataset.action;
    if (!action)
        return;
    // Hasil pilihan dibaca oleh Event Sheet Construct 3.
    runtime.globalVars.DialogAction = action;
    runtime.globalVars.DialogConfirmed = 1;
    // Event DOM juga disediakan jika dibutuhkan script HTML lain.
    menu.dispatchEvent(new CustomEvent("menu-select", {
        bubbles: true,
        detail: { action },
    }));
}
function createMenu() {
    if (!root)
        return null;
    const content = root.querySelector(".dialog-content");
    if (!content) {
        console.warn("Dialogue: .dialog-content tidak ditemukan.");
        return null;
    }
    let existingMenu = content.querySelector(".menu-options");
    if (!existingMenu) {
        existingMenu = document.createElement("ul");
        existingMenu.className = "menu-options";
        content.appendChild(existingMenu);
    }
    existingMenu.setAttribute("role", "listbox");
    existingMenu.setAttribute("tabindex", "0");
    existingMenu.setAttribute("aria-label", "Pilihan dialog");
    if (!existingMenu.querySelector('[role="option"]')) {
        for (const option of OPTIONS) {
            const item = document.createElement("li");
            item.id = option.id;
            item.dataset.action = option.action;
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", "false");
            item.textContent = option.label;
            existingMenu.appendChild(item);
        }
    }
    return existingMenu;
}
function bindMenuEvents(runtime) {
    if (!menu || initialized)
        return;
    menu.addEventListener("pointermove", (event) => {
        if (!dialogueState.open || !menu)
            return;
        const target = event.target;
        if (!(target instanceof Element))
            return;
        const option = target.closest('[role="option"]');
        if (!option || !menu.contains(option))
            return;
        const i = items.indexOf(option);
        if (i >= 0 && i !== index) {
            setActive(i);
        }
    });
    menu.addEventListener("click", (event) => {
        if (!dialogueState.open || !menu)
            return;
        const target = event.target;
        if (!(target instanceof Element))
            return;
        const option = target.closest('[role="option"]');
        if (!option || !menu.contains(option))
            return;
        const i = items.indexOf(option);
        if (i < 0)
            return;
        setActive(i);
        choose(runtime);
        menu.focus({ preventScroll: true });
    });
    menu.addEventListener("keydown", (event) => {
        if (!dialogueState.open || items.length === 0)
            return;
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                setActive(index - 1);
                break;
            case "ArrowDown":
            case "KeyS":
                setActive(index + 1);
                break;
            case "Home":
                setActive(0);
                break;
            case "End":
                setActive(items.length - 1);
                break;
            case "Enter":
            case "Space":
                if (event.repeat)
                    return;
                choose(runtime);
                break;
            default:
                return;
        }
        event.preventDefault();
        event.stopPropagation();
    });
    initialized = true;
}
export function initDialogue(runtime) {
    const dialogue = runtime.objects.Dialogue.getFirstInstance();
    if (!dialogue) {
        console.warn("Dialogue: instance Dialogue tidak ditemukan.");
        return;
    }
    dialogueState.obj = dialogue;
    dialogueState.root = dialogue.getElement();
    root = dialogueState.root;
    if (!root) {
        console.warn("Dialogue: elemen HTML belum tersedia.");
        return;
    }
    menu = createMenu();
    if (!menu)
        return;
    items = Array.from(menu.querySelectorAll('[role="option"]'));
    if (items.length === 0)
        return;
    const selectedIndex = items.findIndex(item => item.getAttribute("aria-selected") === "true");
    index = selectedIndex >= 0 ? selectedIndex : 0;
    bindMenuEvents(runtime);
    setActive(index);
    previousOpen = false;
}
export function DialogueHandler(runtime) {
    const dialogue = runtime.objects.Dialogue.getFirstInstance();
    if (!dialogue)
        return;
    dialogue.isVisible = dialogueState.open;
    if (!dialogueState.open) {
        previousOpen = false;
        return;
    }
    // Inisialisasi ulang bila root belum ada.
    if (!root || !menu) {
        initDialogue(runtime);
        if (!menu)
            return;
    }
    // Fokus hanya ketika dialog baru dibuka.
    if (!previousOpen) {
        menu?.focus({ preventScroll: true });
        previousOpen = true;
    }
}
