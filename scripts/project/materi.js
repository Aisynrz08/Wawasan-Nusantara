export const MATERI = [
    // ---------- LEVEL 1: Mengenal ----------
    {
        id: "m1",
        judul: "Pengertian",
        isi: [
            "Wawasan = cara pandang. Nusantara = pulau-pulau yang diapit dua benua dan dua samudera.",
            "Wawasan Nusantara: cara pandang bangsa tentang dirinya, dengan mengutamakan persatuan dan kesatuan wilayah.",
        ],
        kuis: {
            tanya: "Apa yang diutamakan Wawasan Nusantara?",
            pilihan: [
                { label: "Kekuatan militer", value: "a" },
                { label: "Persatuan dan kesatuan", value: "b" },
                { label: "Perdagangan bebas", value: "c" },
            ],
            benar: "b",
            petunjuk: "Persatuan bangsa dan kesatuan wilayah.",
        },
    },
    {
        id: "m2",
        judul: "Kedudukan & Tujuan",
        isi: [
            "Kedudukan: landasan visional bangsa untuk mencapai cita-cita nasional.",
            "Tujuan ke dalam: persatuan di semua aspek kehidupan.",
            "Tujuan ke luar: ikut mewujudkan ketertiban dan perdamaian dunia.",
        ],
        kuis: {
            tanya: "Apa tujuan ke luar Wawasan Nusantara?",
            pilihan: [
                { label: "Memperluas wilayah", value: "a" },
                { label: "Menutup diri dari dunia", value: "b" },
                { label: "Perdamaian dan ketertiban dunia", value: "c" },
            ],
            benar: "c",
            petunjuk: "Indonesia berperan aktif di dunia.",
        },
    },
    // ---------- LEVEL 2: Membangun ----------
    {
        id: "m3",
        judul: "Tiga Unsur Dasar",
        isi: [
            "Wadah (contour): wilayah Indonesia dan tata kelola negaranya.",
            "Isi (content): cita-cita bangsa dalam Pembukaan UUD 1945.",
            "Tata laku (conduct): perilaku hasil interaksi wadah dan isi.",
        ],
        kuis: {
            tanya: "Apa yang dimaksud wadah (contour)?",
            pilihan: [
                { label: "Cita-cita nasional", value: "a" },
                { label: "Wilayah dan tata kelola negara", value: "b" },
                { label: "Sikap dan perilaku", value: "c" },
            ],
            benar: "b",
            petunjuk: "Wadah itu 'tempatnya': wilayah Indonesia.",
        },
    },
    {
        id: "m4",
        judul: "Latar Belakang",
        isi: [
            "Historis: Deklarasi Djuanda, 13 Desember 1957. Laut teritorial 3 mil jadi 12 mil.",
            "Sosiologis: menyatukan keberagaman agar tidak terjadi disintegrasi.",
            "Politis: berlandaskan UUD 1945 dan peraturan perundang-undangan.",
        ],
        kuis: {
            tanya: "Apa isi Deklarasi Djuanda 1957?",
            pilihan: [
                { label: "Indonesia merdeka", value: "a" },
                { label: "Laut teritorial 3 mil jadi 12 mil", value: "b" },
                { label: "Pembentukan MPR", value: "c" },
            ],
            benar: "b",
            petunjuk: "Tentang batas wilayah laut Indonesia.",
        },
    },
    // ---------- LEVEL 3: Menerapkan ----------
    {
        id: "m5",
        judul: "Empat Kesatuan",
        isi: [
            "Indonesia adalah satu kesatuan politik, ekonomi, sosial-budaya, dan pertahanan-keamanan.",
        ],
        kuis: {
            tanya: "Mana yang BUKAN salah satu kesatuan?",
            pilihan: [
                { label: "Kesatuan ekonomi", value: "a" },
                { label: "Kesatuan agama tunggal", value: "b" },
                { label: "Kesatuan pertahanan-keamanan", value: "c" },
            ],
            benar: "b",
            petunjuk: "Yang ada: politik, ekonomi, sosial-budaya, hankam.",
        },
    },
    {
        id: "m6",
        judul: "Jati Diri & Dunia",
        isi: [
            "Wawasan Nusantara adalah benteng jati diri bangsa di tengah globalisasi.",
            "Ia juga pijakan politik luar negeri bebas aktif.",
        ],
        kuis: {
            tanya: "Politik luar negeri Indonesia adalah...",
            pilihan: [
                { label: "Bebas aktif", value: "a" },
                { label: "Memihak satu blok", value: "b" },
                { label: "Tertutup", value: "c" },
            ],
            benar: "a",
            petunjuk: "Tidak memihak blok mana pun, tapi tetap berperan.",
        },
    },
];
export const terkumpul = new Set();
/** Reset semua (quit ke menu / mulai game baru). */
export function resetMateri() {
    terkumpul.clear();
}
/** Reset hanya fragmen milik satu level (restart level). */
export function resetMateriLevel(ids) {
    for (const id of ids)
        terkumpul.delete(id);
}
/** Peta level -> fragmen yang dibutuhkan. */
export const LEVEL_MATERI = {
    level1: ["m1", "m2"],
    level2: ["m3", "m4"],
    level3: ["m5", "m6"],
};
export function progresLevel(id) {
    const ids = Object.values(LEVEL_MATERI).find(l => l.includes(id)) ?? [];
    return { done: ids.filter(i => terkumpul.has(i)).length, total: ids.length };
}
