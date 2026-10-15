import { Dialogue } from "./Dialogue.js";
import { Guidance } from "./GuidanceCard.js";
import { Subtitle } from "./Subtitle.js";
import { Wait } from "./wait.js";
import { KEYS, LAYOUTS } from "./vars.js";
import { LEVEL_MATERI, MATERI, progresLevel, resetMateri, terkumpul } from "./materi.js";
// =====================================================
//                       NASKAH
// =====================================================
const SCRIPT = {
    intro: [
        "Hmm... tempat apa ini?",
        "Sepi sekali. Aku harus mulai bergerak.",
    ],
    tutorialHint: "Coba tekan tombolnya...",
    retryAsk: "Mau latihan lagi?",
    retryYes: "Oke, sekali lagi deh..",
    retryNo: "Baiklah, ayo jalan.",
    objective: "Kayaknya ada sesuatu di depan. Ayo cari tahu.",
    firstFragmen: ["Fragmen...?", "Kayaknya penting.", "Mungkin masih ada yang lain."],
    nextFragmen: [
        "Satu lagi. Rasanya makin dekat.",
        "Potongannya mulai terhubung...",
        "Tinggal sedikit lagi.",
    ],
    // Cadangan kalau fragmen lebih banyak dari daftar di atas.
    moreFragmen: "Fragmen lagi!",
    enemy: "Kamu berani mendekat?",
    guard: ["Berhenti! Siapa kamu?"],
};
// =====================================================
// Helper
// =====================================================
const played = new Set();
export async function kumpulkan(id) {
    const m = MATERI.find(x => x.id === id);
    if (!m || terkumpul.has(id))
        return;
    let benar = false;
    do {
        await Dialogue.say("Ay", m.isi);
        const jawab = await Dialogue.choose("Ay", m.kuis.tanya, m.kuis.pilihan);
        benar = jawab === m.kuis.benar;
        if (!benar) {
            await Dialogue.say("Ay", "Hmm, sepertinya belum tepat...");
            void Subtitle.say("Ay", m.kuis.petunjuk, { replace: true });
        }
    } while (!benar);
    terkumpul.add(id);
    const { done, total } = progresLevel(id);
    void Subtitle.say("Ay", `Fragmen ${done}/${total}: ${m.judul}`, { replace: true });
}
const PORTAL_HOLD = 1.5;
const NEXT_LAYOUT = {
    level1: "level2",
    level2: "level3",
    level3: LAYOUTS.Main,
};
let portalNeed = [];
let portalNext = null;
let portalOpen = null;
let portalHeld = 0;
let portalHinted = false;
let portalBusy = false;
export function setupPortal(layout) {
    portalNeed = LEVEL_MATERI[layout] ?? [];
    portalNext = NEXT_LAYOUT[layout] ?? null;
    portalOpen = null;
    portalHeld = 0;
    portalHinted = false;
    portalBusy = false;
}
export function PortalHandler(runtime) {
    if (!portalNext || portalBusy)
        return;
    const portal = runtime.objects.portal.getFirstInstance();
    const player = runtime.objects.player.getFirstInstance();
    if (!portal || !player)
        return;
    const ready = portalNeed.every(id => terkumpul.has(id));
    // Visual: redup saat terkunci, terang saat aktif
    if (ready !== portalOpen) {
        portalOpen = ready;
        portal.opacity = ready ? 1 : 0.35;
        if (ready) {
            void Subtitle.say("Ay", "Portalnya menyala!", { replace: true });
        }
    }
    const inside = runtime.collisions.testOverlap(player, portal);
    if (!inside) {
        portalHeld = 0;
        portalHinted = false;
        return;
    }
    if (!ready) {
        if (!portalHinted) {
            portalHinted = true;
            void Subtitle.say("Ay", "Portalnya belum aktif. Kumpulkan fragmennya dulu.", { replace: true });
        }
        return;
    }
    portalHeld += runtime.dt;
    if (portalHeld < PORTAL_HOLD)
        return;
    portalBusy = true;
    const next = portalNext;
    if (next === LAYOUTS.Main) { // tamat: bersihkan progres
        resetScenes();
        resetMateri();
    }
    runtime.goToLayout(next);
}
export function resetScenes() {
    played.clear();
}
/** Jalankan scene sekali saja. */
export function once(id, scene) {
    if (played.has(id))
        return;
    played.add(id);
    scene().catch(console.error);
}
/**
 * Tampilkan kartu dan tunggu sampai selesai.
 * Jika pemain belum selesai setelah `hint.after` detik, muncul subtitle petunjuk (paralel).
 */
async function guide(opts, hint) {
    const card = Guidance.show(opts);
    if (hint) {
        const finished = await Promise.race([
            card.then(() => true),
            Wait.seconds(hint.after).then(() => false),
        ]);
        if (!finished)
            void Subtitle.say(hint.speaker, hint.lines);
    }
    await card;
}
const MOVE_TUTORIAL = {
    title: "TUTORIAL GERAK",
    message: "Tekan kiri, kanan, dan lompat.",
    keys: [
        { code: KEYS.left, label: "A" },
        { code: KEYS.right, label: "D" },
        { code: KEYS.jump, label: "W" },
    ],
};
// =====================================================
// Zona, once
// =====================================================
export function level1Zones(runtime) {
    // const player = () => runtime.objects.player.getFirstInstance();
    // let ditemukan = 0;
    // DetectBox.watchAll(runtime.objects.fragmens, {
    //   width: 200,
    //   height: 80,
    //   when: () => player()?.behaviors.Platform.isOnFloor ?? false,
    //   once: true,
    //   onEnter: async () => {
    //     const n = ditemukan++;
    //     if (n === 0) {
    //       await Dialogue.say("Ay", SCRIPT.firstFragmen);
    //     } else {
    //       const line = SCRIPT.nextFragmen[n - 1] ?? SCRIPT.moreFragmen;
    //       void Subtitle.say("Ay", line, { replace: true });
    //     }
    //   },
    // });
    // const musuh = runtime.objects.enemy.getFirstInstance();
    // if (musuh) {
    //   DetectBox.watch({
    //     target: musuh, width: 240, height: 120,
    //     delay: 0.3, cooldown: 8,
    //     onEnter: () => Subtitle.say("Musuh", SCRIPT.enemy, { replace: true }),
    //   });
    // }
    // DetectBox.watch({
    //   target: { x: 800, y: 400 }, width: 200, once: true,
    //   onEnter: () => Dialogue.say("Penjaga", SCRIPT.guard),
    // });
}
// =====================================================
// Scene
// =====================================================
export async function level1Intro() {
    await Wait.seconds(0.2);
    await Dialogue.say("Ay", SCRIPT.intro);
    await Wait.seconds(0.4);
    let ulang = false;
    do {
        await guide(MOVE_TUTORIAL, {
            after: 6,
            speaker: "Ay",
            lines: SCRIPT.tutorialHint,
        });
        await Wait.seconds(0.2);
        const pilihan = await Dialogue.choose("Ay", SCRIPT.retryAsk, [
            { label: "Ya", value: "Y" },
            { label: "Tidak", value: "no" },
        ]);
        ulang = pilihan === "Y";
        await Dialogue.say("Ay", ulang ? SCRIPT.retryYes : SCRIPT.retryNo);
    } while (ulang);
    // Tujuan berikutnya: pasif, pemain langsung bebas bergerak.
    await Wait.seconds(0.5);
    void Subtitle.say("Ay", SCRIPT.objective);
}
export const npcGuard = () => once("guard", () => Dialogue.say("Penjaga", SCRIPT.guard));
