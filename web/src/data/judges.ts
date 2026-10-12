export type Judge = {
    name: string;
    title: string;
    organisation: string;
    country: string;
    image: string;
};

// Awarding Committee for the 22nd International Electoral Awards (2026)
export const judges: Judge[] = [
    {
        name: "Matt Gokhool",
        title: "Chief Executive Officer",
        organisation: "International Centre for Parliamentary Studies",
        country: "United Kingdom",
        image: "/img/judges/gokhool.jpeg"
    },
    {
        name: "Michael Bruter",
        title: "Director",
        organisation: "Electoral Psychology Observatory",
        country: "France",
        image: "/img/judges/bruter.jpg"
    },
    {
        name: "Thomas Hicks",
        title: "Commissioner",
        organisation: "U.S. Election Assistance Commission",
        country: "USA",
        image: "/img/judges/hicks.jpg"
    },
    {
        name: "Natia Zaalishvili",
        title: "Director",
        organisation: "Centre for Electoral Systems Development, Reforms and Trainings",
        country: "Georgia",
        image: "/img/judges/natia.jpg"
    },
    {
        name: "Alberto Guevara Castro",
        title: "Former Director",
        organisation: "Electoral Tribunal of the Federal Judiciary",
        country: "Mexico",
        image: "/img/judges/alberto.jpg"
    },
    {
        name: "Nasim Zaidi",
        title: "Former Chief Election Commissioner",
        organisation: "Election Commission",
        country: "India",
        image: "/img/judges/nasim.jpg"
    },
    {
        name: "Toby James",
        title: "Director",
        organisation: "Electoral Integrity Project",
        country: "United Kingdom",
        image: "/img/judges/james.png"
    }
];
