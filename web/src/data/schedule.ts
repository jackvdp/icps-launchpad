export type Event = {
    time: string;
    description: string;
};

export type Day = {
    title: string;
    events: Event[];
};

export const schedule: Day[] = [
    {
        title: "Day 0 (Sunday, 29 November) — Arrivals",
        events: [
            { time: "All day", description: "<p>Arrival &amp; Registration</p>" },
            { time: "18:00", description: "<p>Welcome drinks and informal networking</p>" },
        ]
    },
    {
        title: "Day 1 (Monday, 30 November) — Cultural Tour & Cultural Night",
        events: [
            { time: "Morning", description: "<p>Cultural Tour</p>" },
            { time: "Evening", description: "<p>Cultural Night</p>" },
        ]
    },
    {
        title: "Day 2 (Tuesday, 1 December) — Symposium (Part 1)",
        events: [
            { time: "08:30", description: "<p>Symposium Registration</p>" },
            { time: "09:00 – 10:00", description: "<p><strong>Opening &amp; Welcoming Session</strong></p><p>Addresses from COMELEC and ICPS leadership</p>" },
            { time: "10:00 – 10:15", description: "<p>Group Photo</p>" },
            { time: "10:15 – 10:45", description: "<p>Coffee Break</p>" },
            { time: "10:45 – 11:30", description: "<p><strong>Keynote</strong></p><p>Atty. Ian Michel G. Geonanga, Commission on Elections of the Philippines</p>" },
            { time: "11:45 – 12:30", description: "<p><strong>Panel</strong></p><p>Commission on Elections of the Philippines</p><ul><li>Atty. Nick A. Mendroz</li><li>Atty. Vanessa M. Roncal</li><li>Atty. Jayvee Villagracia</li><li>Atty. Edgar Feliciano D. Aringay</li></ul>" },
            { time: "12:30 – 14:00", description: "<p>Lunch</p>" },
            { time: "14:00 – 14:30", description: "<p><strong>Keynote</strong></p><p>Professor Jung Ok Lee, Emeritus Professor of Sociology, Daegu Catholic University, and 8th Minister of Gender Equality and Family, Republic of Korea</p>" },
            { time: "14:45 – 15:45", description: "<p><strong>Panel</strong></p><p>Speakers to be confirmed</p>" },
            { time: "15:45 – 16:00", description: "<p>Coffee Break</p>" },
            { time: "16:00 – 16:45", description: "<p><strong>Partner presentation — NOMOS</strong></p>" },
            { time: "16:45 – 17:30", description: "<p><strong>Partner panel and presentation — BSV Association</strong></p>" },
            { time: "14:00 – 17:00", description: "<p>(Parallel) Syndicate room — NOMOS</p>" },
            { time: "17:30 – 18:30", description: "<p>(Parallel) Fringe events and industry demonstrations</p>" },
            { time: "20:00", description: "<p>Dinner</p>" },
        ]
    },
    {
        title: "Day 3 (Wednesday, 2 December) — Symposium (Part 2) & Awards Ceremony",
        events: [
            { time: "09:00 – 09:30", description: "<p><strong>Keynote</strong></p><p>Professor Ferran Mart&iacute;nez i Coma, Griffith University</p>" },
            { time: "09:30 – 10:00", description: "<p><strong>Keynote &ndash; Securing elections in a rapidly changing environment: experiences from the Swedish elections 2026</strong></p><p>Anna Nyqvist, Chief Executive, Swedish Electoral Authority</p>" },
            { time: "10:15 – 11:15", description: "<p><strong>Panel</strong></p><p>Speakers to be confirmed</p>" },
            { time: "11:15 – 11:30", description: "<p>Coffee Break</p>" },
            { time: "11:30 – 12:00", description: "<p><strong>Keynote</strong></p><p>Professor Sarah Birch, Professor of Political Science, King's College London</p>" },
            { time: "12:00 – 12:30", description: "<p><strong>Keynote</strong></p><p>Speaker to be confirmed</p>" },
            { time: "12:45 – 13:00", description: "<p><strong>Symposium Closing</strong></p>" },
            { time: "09:30 – 13:00", description: "<p>(Parallel) Fringe events and industry demonstrations</p>" },
            { time: "13:00", description: "<p>Lunch</p>" },
            { time: "13:00 – 15:00", description: "<p><strong>Workshop — Who's Trained, Who's Cleared? Trusted Records for the Election Workforce</strong></p><p>A two-hour working session designed with the BSV Association. <a href='/awards/workshops#trusted-records'>Details and booking</a></p>" },
            { time: "Afternoon", description: "<p>Rest or optional local tours prior to the Awards Ceremony</p>" },
            { time: "19:00 – 22:00", description: "<h3>The International Electoral Awards</h3><p>Dinner, entertainment &amp; presentation of the 22nd International Electoral Awards</p>" }
        ]
    },
    {
        title: "Day 4 (Thursday, 3 December) — Departures",
        events: [
            { time: "Morning", description: "<p>Optional city or cultural tour for delegates on later flights</p>" },
            { time: "All day", description: "<p>Departures</p>" }
        ]
    },
];
