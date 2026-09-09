export type Sponsor = {
    name: string;
    logo?: string;
    page?: string;
}

export const sponsors: Array<Sponsor> = [
    {
        name: "Smartmatic",
        logo: "/img/sponsors/smartmatic.png",
        page: "/img/sponsors/pages/smartmatic.png"
    },
    {
        name: "Toppan Gravity",
        logo: "/img/sponsors/toppan.png",
        page: "/img/sponsors/pages/toppan.png"
    },
    {
        name: "Al Ghurair",
        logo: "/img/sponsors/al-ghurair.png",
        page: "/img/sponsors/pages/ghurair.png"
    },
    {
        name: "Neurotechnology",
        logo: "/img/sponsors/neurotec.png",
        page: "/img/sponsors/pages/neuro.png"
    },
    {
        name: "Laxton",
        logo: "/img/sponsors/laxton.jpg",
        page: "/img/sponsors/pages/laxton.png"
    },
    {
        name: "Scytl",
        logo: "/img/sponsors/scytl.png",
        page: "/img/sponsors/pages/scytl.png"
    },
    {
        name: "Biorugged",
        logo: "/img/sponsors/biorugged.png",
        page: "/img/sponsors/pages/biorugged.png"
    },
    {
        name: "Rayudu",
        logo: "/img/sponsors/rayudu.jpg",
        page: "/img/sponsors/pages/rayudu.png"
    }
]

// 22nd International Electoral Awards & Symposium (Manila, 2026).
// Sponsors without a logo file render as a placeholder card; add artwork as it arrives.
export const sponsors2026: Array<Sponsor> = [
    {
        name: "NOMOS"
    },
    {
        name: "BSV Association"
    },
    {
        name: "Gravity Group / Toppan",
        logo: "/img/sponsors/toppan.png"
    },
    {
        name: "Al Ghurair Printing & Publishing",
        logo: "/img/sponsors/al-ghurair.png"
    },
    {
        name: "Laxton",
        logo: "/img/sponsors/laxton.jpg"
    },
    {
        name: "BioRugged",
        logo: "/img/sponsors/biorugged.png"
    },
    {
        name: "Neuvote"
    },
    {
        name: "A Daga Steel and Industrial Corporation",
        logo: "/img/sponsors/a-daga.png"
    },
    {
        name: "Mantratec"
    },
    {
        name: "Rayudu",
        logo: "/img/sponsors/rayudu.jpg"
    }
]
