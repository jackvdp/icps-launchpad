// Data for the 2026 Delegate Acquisition Comms Plan dashboard

export interface CommEmail {
    id: number;
    wc: string;       // w/c date
    weekStart: string; // ISO date for calendar positioning
    primary: string;
    secondary: string;
    subject: string;
    cta: string;
    audience: string;
    detail: string;
    status: 'drafted' | 'sent' | 'pending';
    phase: number;
    tags: string[];    // e.g. ['registration', 'nominations', 'speakers']
    templateFile?: string; // .eml filename in web/src/data/comms-templates/
}

export interface Phase {
    id: number;
    name: string;
    period: string;
    goal: string;
    targetRegistrations: string;
    colour: string;
    phoneWave?: string;
}

export interface SocialPost {
    wc: string;
    weekStart: string; // ISO date for calendar positioning and matching to emails
    count: number;
    description: string;
}

export interface CommsPlanData {
    title: string;
    subtitle: string;
    coHost: string;
    targetDelegates: string;
    phases: Phase[];
    emails: CommEmail[];
    socialPosts: SocialPost[];
    sellingPoints: { icon: string; text: string }[];
    notes: string[];
    calendarMonths: { name: string; year: number; month: number }[];
    eventMarker: { label: string; position: number };
    keyDates: { label: string; position: number; colour: string }[];
}

export const commsPlan2026: CommsPlanData = {
    title: '2026 Programme: 22nd International Electoral Awards & Symposium | Webinars',
    subtitle: '29 November – 3 December 2026 | The Manila Hotel, Manila, Philippines',
    coHost: 'Co-hosted by ICPS & COMELEC',
    targetDelegates: '150–200',

    calendarMonths: [
        { name: 'Mar', year: 2026, month: 2 },
        { name: 'Apr', year: 2026, month: 3 },
        { name: 'May', year: 2026, month: 4 },
        { name: 'Jun', year: 2026, month: 5 },
        { name: 'Jul', year: 2026, month: 6 },
        { name: 'Aug', year: 2026, month: 7 },
        { name: 'Sep', year: 2026, month: 8 },
        { name: 'Oct', year: 2026, month: 9 },
        { name: 'Nov', year: 2026, month: 10 },
    ],

    eventMarker: { label: 'EVENT: 29 Nov – 3 Dec', position: (8 + 4.2 / 5) / 9 },

    keyDates: [
        { label: 'Noms open', position: (3 + 1.0 / 5) / 9, colour: '#45c4a0' },
        { label: 'Webinar 1', position: (1 + 2.4 / 5) / 9, colour: '#e8a317' },
        { label: 'Webinar 2', position: (3 + 0.5 / 5) / 9, colour: '#e8a317' },
        { label: 'Webinar 3', position: (4 + 1.5 / 5) / 9, colour: '#e8a317' },
        { label: 'Noms close', position: (5 + 4.2 / 5) / 9, colour: '#e2626b' },
        { label: 'Webinar 4', position: (6 + 2.3 / 5) / 9, colour: '#e8a317' },
    ],

    phases: [
        { id: 1, name: 'Launch & Early Momentum', period: 'March – April', goal: 'Announce the event, drive early registrations, open nominations', targetRegistrations: '30–40', colour: '#3f78e0', phoneWave: 'Wave 1: w/c 24 Mar – 11 Apr — VIPs, past attendees, Asia-Pacific EMBs' },
        { id: 2, name: 'Build Awareness & Credibility', period: 'May – June', goal: 'Sustain momentum, announce programme milestones, convert interest', targetRegistrations: '60–80', colour: '#45c4a0', phoneWave: 'Wave 2: 12–30 May — Contacts who opened but didn\'t register, under-represented regions' },
        { id: 3, name: 'Summer Push & Nominations Close', period: 'July – August', goal: 'Drive registrations through summer, close nominations strongly', targetRegistrations: '100–120', colour: '#f78b77', phoneWave: 'Wave 3: 14 Jul – 1 Aug — Remaining priority contacts, nomination pipeline leads' },
        { id: 4, name: 'Final Conversion', period: 'September – October', goal: 'Convert remaining prospects, build anticipation, lock in numbers', targetRegistrations: '140–160', colour: '#7c69ef', phoneWave: 'Wave 4: 22 Sep – 10 Oct — Final fence-sitters, new leads from nominations' },
        { id: 5, name: 'Final Countdown', period: 'November', goal: 'Confirm logistics, build excitement, last-chance registrations', targetRegistrations: '150–200', colour: '#e2626b', phoneWave: 'Wave 5: 3–14 Nov — Last-chance personal outreach to high-value contacts' },
    ],

    emails: [
        {
            id: 1, wc: '16 Mar', weekStart: '2026-03-16', phase: 1,
            primary: 'Formal invitation & event launch',
            secondary: 'Register now; introduce 2026 co-host',
            subject: 'Invitation to the 22nd International Electoral Awards — Manila',
            cta: 'Register now',
            audience: 'Full database. Personalised versions for 2025 attendees.',
            detail: 'Full event details, dates, venue, COMELEC co-host, free attendance, accommodation covered.',
            status: 'drafted',
            tags: ['registration'],
            templateFile: '2026-03-email-01-invitation.eml',
        },
        {
            id: 2, wc: '30 Mar', weekStart: '2026-03-30', phase: 1,
            primary: '2026 programme announcement',
            secondary: 'Introduce the year ahead; tease nominations',
            subject: 'Our 2026 programme — Awards, webinars, and more',
            cta: 'Register now / Save the dates',
            audience: 'Full database.',
            detail: 'Announce the full 2026 programme: the 22nd International Electoral Awards in Manila (29 Nov – 3 Dec), plus four webinars — Empowering the Election Workforce (17 Apr), Strengthening the Electoral Profession (4 Jun), Speed in Election Results Transmission (14 Jul), and Inclusive Elections (16 Sep). Recap 2025 highlights and set the tone for the year. Soft tease that nominations open in April.',
            status: 'drafted',
            tags: ['registration', 'nominations', 'webinars'],
            templateFile: '2026-03-email-02-programme-announcement.eml',
        },
        {
            id: 3, wc: '13 Apr', weekStart: '2026-04-13', phase: 1,
            primary: 'Speaker update: Empowering the Election Workforce',
            secondary: 'Nominations opening soon; register for Manila',
            subject: 'Speakers confirmed — Empowering the Election Workforce | 24 April',
            cta: 'Register for webinar',
            audience: 'Full database.',
            detail: 'Follow-up to the webinar invitation (Email 3). Announce five confirmed speakers: Fernanda Buril (IFES), Abubakarr Koroma (Electoral Commission for Sierra Leone), Baidessou Soukolgue (EISA), Asgeir Oskarsson (BSV Association), Charles Symons (Buzzmint). Include full programme with timings. Mention nominations opening soon and the Awards in Manila.',
            status: 'drafted',
            tags: ['webinars', 'speakers'],
            templateFile: '2026-04-email-04-workforce-speaker-update.eml',
        },
        {
            id: 4, wc: '8 Jun', weekStart: '2026-06-08', phase: 2,
            primary: 'Nominations now open',
            secondary: 'Knowledge Sharing webinar recap; Speed webinar coming 14 July',
            subject: 'Nominations open — 22nd International Electoral Awards',
            cta: 'Submit a nomination / Register',
            audience: 'Full database.',
            detail: 'Explain the 8 categories, the process, the deadline (31 August). "Haven\'t registered yet? Attendance is free and accommodation at The Manila Hotel is covered." Recap of the Knowledge Sharing webinar (4 June) with link to recording. Tease the upcoming Speed in Election Results Transmission webinar on 14 July.',
            status: 'pending',
            tags: ['nominations', 'registration', 'webinars'],
        },
        {
            id: 6, wc: '4 May', weekStart: '2026-05-04', phase: 2,
            primary: 'Webinar invitation: Strengthening the Electoral Profession — 4 June',
            secondary: 'Nominations reminder; register for Manila',
            subject: 'Strengthening the Electoral Profession: How to Improve Knowledge Sharing | 4 June',
            cta: 'Register for webinar',
            audience: 'Full database, including expanded managerial-tier contacts.',
            detail: 'Dedicated invitation for the Knowledge Sharing webinar (4 June, 14:00 UTC). Electoral bodies build extraordinary institutional knowledge but much of it stays locked within institutions or disappears when staff move on. This webinar brings together leading voices across electoral management to ask what a practical improvement looks like — featuring an EMB speaker, an international NGO perspective, and a presentation from NOMOS. Speakers to be confirmed. "Three months left to register for Manila — free, with accommodation provided."',
            status: 'drafted',
            tags: ['webinars'],
            templateFile: '2026-05-email-06-intelligence-edge-invitation.eml',
        },
        {
            id: 7, wc: '22 Jun', weekStart: '2026-06-22', phase: 2,
            primary: 'Speed webinar — speakers confirmed',
            secondary: 'Theme & learning objectives; register for 14 July',
            subject: 'Speakers confirmed: Speed in Election Results Transmission | 14 July',
            cta: 'Register for webinar',
            audience: 'Full database.',
            detail: 'Confirm the two speakers for the Speed in Election Results Transmission webinar (14 July, 13:00–15:00 UTC / 14:00–16:00 BST): Rui Santos (Managing Director, Plus 351) and Eduardo Repilloza Fernández (Coordinador General, Transparencia Electoral). Set out the webinar theme — transparency and speed across the full results workflow, and how EMBs can improve efficiency and resilience within legally mandated processes — and the four learning objectives. Webinar-focused only.',
            status: 'drafted',
            tags: ['webinars', 'speakers'],
            templateFile: '2026-06-email-07-speed-transmission-speakers.eml',
        },
        {
            id: 9, wc: '25 May', weekStart: '2026-05-25', phase: 2,
            primary: 'Knowledge Sharing webinar — speakers confirmed',
            secondary: 'Webinar next Thursday (4 Jun)',
            subject: 'Speakers confirmed — Strengthening the Electoral Profession | 4 June, 14:00 UTC',
            cta: 'Register for webinar',
            audience: 'Full database (priority: non-registrants for webinar).',
            detail: 'Announce confirmed speakers for the Knowledge Sharing webinar (4 June, 14:00 UTC): Tammy Patrick (CEO for Programs, Election Center, US National Association of Election Officials), leading the CERA professional credential programme, and Sy Mamabolo (Chief Electoral Officer, Electoral Commission of South Africa). Brief profiles, what each will bring to the discussion of knowledge sharing across electoral bodies, and the full programme with timings.',
            status: 'drafted',
            tags: ['webinars', 'speakers'],
            templateFile: '2026-05-email-09-knowledge-sharing-speaker-update.eml',
        },
        {
            id: 10, wc: '1 Jun', weekStart: '2026-06-01', phase: 2,
            primary: 'Final reminder: Knowledge Sharing webinar — this Thursday',
            secondary: 'Register for Manila; nominations open',
            subject: 'This Thursday — Strengthening the Electoral Profession | 4 June, 14:00 UTC',
            cta: 'Register for webinar',
            audience: 'Full database (priority: non-registrants for webinar).',
            detail: 'Final reminder for the Knowledge Sharing webinar (4 June, 14:00 UTC). Last chance to register. "Join us this Thursday — and join delegates from around the world in Manila this November."',
            status: 'drafted',
            tags: ['webinars'],
            templateFile: '2026-06-email-10-knowledge-sharing-final-reminder.eml',
        },
        {
            id: 31, wc: '5 Jun', weekStart: '2026-06-05', phase: 2,
            primary: 'Webinar invitation: Speed in Election Results Transmission — 14 July',
            secondary: 'Nominations open; register for Manila',
            subject: 'Speed in Election Results Transmission: Getting Results Right, and Fast | 14 July',
            cta: 'Register for webinar',
            audience: 'Full database.',
            detail: 'Dedicated invitation for the third webinar (14 July, 13:00–15:00 UTC / 14:00–16:00 BST). End-to-end results workflows, transparency servers, and public communication during results consolidation — how EMBs deliver results quickly without sacrificing accuracy or trust. Speakers to be confirmed. Reminder that attendance in Manila is free with accommodation covered.',
            status: 'drafted',
            tags: ['webinars'],
            templateFile: '2026-06-email-31-speed-transmission-invitation.eml',
        },
        {
            id: 11, wc: '29 Jun', weekStart: '2026-06-29', phase: 2,
            primary: 'Category spotlight (remaining categories)',
            secondary: 'Knowledge Sharing webinar recap; nominations reminder',
            subject: 'Award categories in focus — could your work be recognised?',
            cta: 'Submit a nomination / Register',
            audience: 'Full database (emphasis on non-nominators).',
            detail: 'Spotlight remaining award categories not covered in Email 5. Past winner testimonials or case study excerpts. Short recap of the Knowledge Sharing webinar — key takeaways and link to recording for those who missed it. Upcoming: Speed in Election Results Transmission webinar on 14 July.',
            status: 'pending',
            tags: ['nominations', 'speakers', 'webinars'],
        },
        {
            id: 12, wc: '15 Jun', weekStart: '2026-06-15', phase: 2,
            primary: 'Partnership Campaign 1',
            secondary: 'Awareness: information environment & electoral management',
            subject: '[Partnership Campaign 1 — subject TBC with partner]',
            cta: 'Learn more',
            audience: 'Full ICPS Electoral Members database (board + managerial tier).',
            detail: 'First awareness campaign linking partner solution features to contemporary challenges facing EMBs in the information environment. Copy drafted by ICPS editorial team and approved by partner before send. Followed up by ICPS staff.',
            status: 'pending',
            tags: ['partnership'],
        },
        {
            id: 13, wc: '22 Jun', weekStart: '2026-06-22', phase: 2,
            primary: 'Speaker announcement #2',
            secondary: 'Nominations midpoint (2 months left); Speed webinar (14 Jul)',
            subject: 'More speakers join the programme — Manila 2026',
            cta: 'Register to attend',
            audience: 'Full database.',
            detail: 'Second speaker announcement (2–3 more names). "Here\'s who you\'ll hear from." Nominations midpoint reminder. Coming up: Speed in Election Results Transmission webinar on 14 July — register now.',
            status: 'pending',
            tags: ['speakers', 'nominations', 'registration', 'webinars'],
        },
        {
            id: 14, wc: '6 Jul', weekStart: '2026-07-06', phase: 3,
            primary: 'Registration milestone + Webinar: Speed in Election Results Transmission — 14 July',
            secondary: 'Nominations update; programme preview',
            subject: '[X] delegates from [Y] countries — and join us next week',
            cta: 'Register now / Register for webinar',
            audience: 'Non-registered contacts (milestone); full database (webinar invite).',
            detail: 'Social proof with country list or notable organisations. "[X] delegates from [Y] countries have registered. Join them." Dedicated invitation for Speed in Election Results Transmission (14 July, 14:00 UTC): end-to-end results workflows, transparency servers, public communication during results consolidation.',
            status: 'pending',
            tags: ['registration', 'webinars'],
        },
        {
            id: 15, wc: '13 Jul', weekStart: '2026-07-13', phase: 3,
            primary: 'Partnership Campaign 2 — Content providers',
            secondary: 'Network expansion: reach the people who produce electoral content',
            subject: '[Partnership Campaign 2 — subject TBC with partner]',
            cta: 'Join the Network / Learn more',
            audience: 'Expanded list built in three tranches by Jack and Tracy: (1) close personal contacts, (2) existing Network contacts without a personal relationship, (3) scoping-list targets — content-producing organisations and academics we want in the database.',
            detail: 'Second partnership campaign, repurposed as the content-providers drive (per the 29 May session notes): expand the Electoral Members\' Network into the organisations and academics who produce electoral content — programme directors, heads of research, senior advisers, leading scholars. Audience built across three tranches; see the content-providers scoping list and research brief. ICPS staff follow-up.',
            status: 'pending',
            tags: ['partnership'],
        },
        {
            id: 16, wc: '20 Jul', weekStart: '2026-07-20', phase: 3,
            primary: 'Nominations push — 6 weeks left',
            secondary: 'Results Transmission webinar thank-you; register for Manila',
            subject: 'Six weeks left to nominate — 22nd International Electoral Awards',
            cta: 'Submit a nomination',
            audience: 'Full database (emphasis on non-nominators).',
            detail: 'Nominations-focused push at the six-week mark. Deadline 31 August; winners announced at the ceremony in Manila on 1 December. Walk through the award categories with a link to the full criteria, explain the simple online submission, and encourage recipients to nominate their own work or a peer\'s. Brief thank-you for the Speed in Election Results Transmission webinar (14 July). Reminder that attendance in Manila is free with accommodation covered.',
            status: 'drafted',
            tags: ['nominations', 'registration', 'webinars'],
            templateFile: '2026-07-email-16-nominations-six-weeks.eml',
        },
        {
            id: 32, wc: '27 Jul', weekStart: '2026-07-27', phase: 3,
            primary: 'Workshops debut — BSVA election workforce workshop',
            secondary: 'Delegate acquisition: reserve a workshop place; register for Manila',
            subject: 'New for Manila: hands-on workshops - reserve your place',
            cta: 'Put your name down / Register',
            audience: 'Full database (emphasis on registered delegates and interested non-registered contacts).',
            detail: 'First-time introduction of hands-on workshops at the symposium, led with the BSVA-ICPS session "Who\'s Trained, Who\'s Cleared? Trusted Records for the Election Workforce": a two-hour interactive working session on vetting, training records, and verifying election workforce status, with delegates leaving with a one-page solution sketch for their own jurisdiction. Ask recipients to put their name down now to avoid disappointment from oversubscription. Mauritius team follow-up. Proposed by Tracy 20 July; slotted into the free week between the six-week and final-call nominations pushes.',
            status: 'drafted',
            tags: ['registration', 'partnership'],
            templateFile: '2026-07-email-32-workshops-debut.eml',
        },
        {
            id: 18, wc: '17 Aug', weekStart: '2026-08-17', phase: 3,
            primary: 'Partnership Campaign 3 — sharing published work',
            secondary: 'Ask content-producing organisations and academics to share published work',
            subject: 'A: An invitation to share your work with the Network / B: Getting your research to the officials who need it',
            cta: 'Arrange a short call',
            audience: 'Content-producing organisations and academics (content-providers shortlist). Split in two: version A to one half, version B to the other.',
            detail: 'Invites a select number of organisations and academics to share published work with the Network: existing output can be fed through automatically, with an option to write for members against the annual editorial schedule. ICPS contributes editorial content on the same basis. Copy rewritten 20 Aug 2026 to Tracy\'s two letters, adopted verbatim (version A is her letter 1 with the red paragraph removed, version B her second letter). That rewrite repositions NOMOS: the earlier copy called ICPS a convening partner of NOMOS and recruited contributors as thought partners, which is gone. NOMOS is now described only as somewhere Network content may also be made available, "a separate professional network" in A and "an independently operated professional network" in B, and the clarification box about sponsorship has been dropped along with the thought-partner framing it explained. Note the two versions no longer test a variable: the earlier A/B split led on reach against the funding squeeze, whereas Tracy\'s letters differ only in three phrases. Matt Gokhool is joining the review at his own request (Tracy, 20 Aug 2026), so treat the copy as still under review. Version B template: 2026-08-email-18-partnership-campaign-3-version-b.eml. Two dependencies before sending: the annual editorial schedule must exist (both versions reference it), and the recipient list is still being settled with Sean. Moved from w/c 10 August to w/c 17 August (17 Aug 2026).',
            status: 'drafted',
            tags: ['partnership'],
            templateFile: '2026-08-email-18-partnership-campaign-3-version-a.eml',
        },
        {
            id: 20, wc: '25 Aug', weekStart: '2026-08-25', phase: 3,
            primary: 'Nominations push — three weeks to the deadline',
            secondary: 'Webinar invitation: Inclusive Elections (16 Sep); register for Manila',
            subject: 'Three weeks left to nominate — deadline 15 September',
            cta: 'Submit a nomination / Register for webinar',
            audience: 'Full database (emphasis on non-nominators).',
            detail: 'Main nominations push ahead of the revised 15 September deadline (moved from 31 August, decided 16 Aug 2026). Walk through the award categories with emphasis on those still uncontested, link to the full criteria, and explain the simple online submission. Winners announced at the ceremony in Manila on 1 December. Secondary: dedicated invitation for the fourth webinar (16 September, 14:00 UTC) — voter-centred design, accessibility, frontline staff training, preserving independence and secrecy. Reminder that attendance in Manila is free with accommodation covered. Replaces the former Email 17 (nominations final call, w/c 3 Aug) and Email 19 (past winner case study, w/c 17 Aug), both removed 17 Aug 2026.',
            status: 'pending',
            tags: ['nominations', 'webinars', 'registration'],
        },
        {
            id: 21, wc: '31 Aug', weekStart: '2026-08-31', phase: 3,
            primary: 'Nominations closed — what\'s next',
            secondary: 'Thank nominators; upcoming webinar; register to see winners',
            subject: 'Nominations closed — thank you',
            cta: 'Register to attend',
            audience: 'Full database. Personalised thank-you to nominators.',
            detail: 'Thank all nominators. Share headline stats. "Winners announced at the Awards Ceremony on 1 December. Register to be there." Reminder: Inclusive Elections webinar on 16 September.',
            status: 'pending',
            tags: ['nominations', 'registration', 'webinars'],
        },
        {
            id: 22, wc: '12 Oct', weekStart: '2026-10-12', phase: 4,
            primary: 'Webinar invitation: Inclusive Elections — 27 October',
            secondary: 'Register for Manila',
            subject: 'Webinar invitation: Inclusive Elections | 27 October',
            cta: 'Register for webinar / Register for Manila',
            audience: 'Full database.',
            detail: 'Dedicated invitation for the Inclusive Elections webinar, moved from 16 September to Tuesday 27 October (14:00–15:30 UTC). Moves from legal commitments to practical implementation: polling-place design, voter information, communication and staff training, and offering assistance while protecting independence and secrecy. Speakers to be announced. Short reminder that Symposium registration is still open, free with accommodation covered.',
            status: 'drafted',
            tags: ['webinars', 'registration'],
            templateFile: '2026-10-email-22-inclusive-elections-invitation.eml',
        },
        {
            id: 33, wc: '19 Oct', weekStart: '2026-10-19', phase: 4,
            primary: 'Inclusive Elections webinar: speakers confirmed',
            secondary: 'Register for 27 October; register for Manila',
            subject: 'Speakers confirmed: Inclusive Elections | 27 October',
            cta: 'Register for webinar / Register for Manila',
            audience: 'Full database.',
            detail: 'Speaker announcement for the Inclusive Elections webinar (Tuesday 27 October, 14:00–15:30 UTC): Whitney Quesenbery (Center for Civic Design), Virginia Atkinson (IFES), Colleen Roberts (Sightsavers) and Inge Volleberg (Inclusion Europe). Short reminder that Symposium registration is still open, free with accommodation covered.',
            status: 'drafted',
            tags: ['webinars', 'speakers', 'registration'],
            templateFile: '2026-10-email-33-inclusive-elections-speakers.eml',
        },
        {
            id: 23, wc: '14 Sep', weekStart: '2026-09-14', phase: 4,
            primary: 'Full programme published',
            secondary: 'Webinar this Wednesday; speaker line-up recap',
            subject: 'Full programme released — 22nd Electoral Awards',
            cta: 'Register now / Join webinar',
            audience: 'Full database (priority to non-registered).',
            detail: 'Day-by-day itinerary, all speakers, session titles, cultural tour, ceremony details. Major conversion moment. Reminder: Inclusive Elections webinar this Wednesday (16 September).',
            status: 'pending',
            tags: ['programme', 'registration', 'webinars'],
        },
        {
            id: 24, wc: '21 Sep', weekStart: '2026-09-21', phase: 4,
            primary: 'Partnership Campaign 4',
            secondary: 'Awareness: electoral integrity & trust',
            subject: '[Partnership Campaign 4 — subject TBC with partner]',
            cta: 'Learn more',
            audience: 'Full ICPS Electoral Members database.',
            detail: 'Fourth awareness campaign. Copy to draw linkage between partner solution features and electoral integrity and public trust challenges. Timed post Inclusive Elections webinar. ICPS staff follow-up.',
            status: 'pending',
            tags: ['partnership'],
        },
        {
            id: 25, wc: '28 Sep', weekStart: '2026-09-28', phase: 4,
            primary: 'Speaker deep-dive / session preview',
            secondary: 'Webinar recap; registration push; shortlist tease',
            subject: 'Session spotlight — [Topic/Speaker]',
            cta: 'Register to attend',
            audience: 'Full database.',
            detail: 'Deep-dive on one compelling panel or keynote. Why it matters, who\'s speaking, what to expect. Tease shortlist. Short recap of the Inclusive Elections webinar — key takeaways and link to recording.',
            status: 'pending',
            tags: ['speakers', 'programme', 'registration', 'webinars'],
        },
        {
            id: 26, wc: '12 Oct', weekStart: '2026-10-12', phase: 4,
            primary: 'Shortlist announced',
            secondary: 'Register to see the winners in person',
            subject: 'Shortlist announced — who will win in Manila?',
            cta: 'Register now',
            audience: 'Full database. Notify shortlisted organisations directly.',
            detail: 'Category-by-category shortlisted nominees. "Who will win? Join us in Manila to find out."',
            status: 'pending',
            tags: ['nominations', 'registration'],
        },
        {
            id: 27, wc: '19 Oct', weekStart: '2026-10-19', phase: 4,
            primary: 'Partnership Campaign 5',
            secondary: 'Awareness: pre-symposium engagement',
            subject: '[Partnership Campaign 5 — subject TBC with partner]',
            cta: 'Learn more / Register for Manila',
            audience: 'Full ICPS Electoral Members database.',
            detail: 'Fifth and final awareness campaign before the Symposium. Copy to build anticipation for the partner\'s presence at the Manila Symposium and encourage in-person engagement at the booth and presentation. ICPS staff follow-up.',
            status: 'pending',
            tags: ['partnership', 'registration'],
        },
        {
            id: 28, wc: '26 Oct', weekStart: '2026-10-26', phase: 5,
            primary: 'One month to go',
            secondary: 'Logistics preview; final speaker news',
            subject: 'One month to go — 22nd Electoral Awards, Manila',
            cta: 'Register (last chance) / Confirm details',
            audience: 'Split — registered (logistics) / non-registered (convert).',
            detail: 'Excitement-builder — delegate count, country count, programme highlights, Manila preview. Logistics for registered.',
            status: 'pending',
            tags: ['registration', 'programme'],
        },
        {
            id: 29, wc: '9 Nov', weekStart: '2026-11-09', phase: 5,
            primary: 'Final registration call',
            secondary: 'Logistics; delegate country count',
            subject: 'Final call — join [X] delegates in Manila',
            cta: 'Register now',
            audience: 'Non-registered contacts only.',
            detail: '"Registration closes [date]. [X] delegates confirmed. Free. Accommodation covered."',
            status: 'pending',
            tags: ['registration'],
        },
        {
            id: 30, wc: '23 Nov', weekStart: '2026-11-23', phase: 5,
            primary: 'Pre-event logistics & welcome',
            secondary: 'Programme at a glance; what to pack',
            subject: 'Your guide to the 22nd Electoral Awards — Manila',
            cta: 'Confirm attendance',
            audience: 'Registered delegates only.',
            detail: 'Arrival info, hotel check-in, programme, cultural tour, dress code, weather, emergency contacts.',
            status: 'pending',
            tags: ['logistics'],
        },
    ],

    socialPosts: [
        { wc: '16 Mar', weekStart: '2026-03-16', count: 4, description: 'Event announcement series — venue reveal, value prop, 2025 highlights' },
        { wc: '30 Mar', weekStart: '2026-03-30', count: 3, description: '2026 programme announcement — Awards + 4 webinars overview, save-the-dates graphic' },
        { wc: '6 Apr', weekStart: '2026-04-06', count: 2, description: 'Webinar 1 promo — Empowering the Election Workforce (17 Apr), speaker/topic teaser' },
        { wc: '13 Apr', weekStart: '2026-04-13', count: 3, description: 'Nominations open — category spotlights, winner testimonial' },
        { wc: '20 Apr', weekStart: '2026-04-20', count: 2, description: 'Webinar 1 recap — key findings graphic, link to recording, quote from speaker' },
        { wc: '11 May', weekStart: '2026-05-11', count: 2, description: 'Programme themes — poll/engagement post' },
        { wc: '18 May', weekStart: '2026-05-18', count: 2, description: 'Webinar 2 promo — Strengthening the Electoral Profession (4 Jun), topic preview and sign-up reminder' },
        { wc: '25 May', weekStart: '2026-05-25', count: 3, description: 'Speaker reveals with headshots and quotes; Knowledge Sharing webinar final reminder (next week)' },
        { wc: '1 Jun', weekStart: '2026-06-01', count: 2, description: 'Knowledge Sharing webinar final push — this Thursday, 14:00 UTC' },
        { wc: '8 Jun', weekStart: '2026-06-08', count: 3, description: 'Category deep-dive, nomination reminder, Knowledge Sharing webinar recap graphic' },
        { wc: '15 Jun', weekStart: '2026-06-15', count: 2, description: 'Partnership Campaign 1 — awareness post; Webinar 2 recap: Knowledge Sharing key insights' },
        { wc: '6 Jul', weekStart: '2026-07-06', count: 3, description: 'Milestone celebration — delegate map graphic; Webinar 3 promo — Speed in Election Results Transmission (14 Jul)' },
        { wc: '13 Jul', weekStart: '2026-07-13', count: 1, description: 'Partnership Campaign 2 — content-providers / network-expansion post' },
        { wc: '20 Jul', weekStart: '2026-07-20', count: 2, description: 'Webinar 3 recap — Speed in Election Results Transmission key insights graphic, link to recording' },
        { wc: '3 Aug', weekStart: '2026-08-03', count: 3, description: 'Nominations closing countdown (4 weeks, 2 weeks, final days)' },
        { wc: '17 Aug', weekStart: '2026-08-17', count: 1, description: 'Partnership Campaign 3 — awareness post' },
        { wc: '25 Aug', weekStart: '2026-08-25', count: 2, description: 'Webinar 4 promo — Inclusive Elections (16 Sep), topic preview, speaker teaser' },
        { wc: '7 Sep', weekStart: '2026-09-07', count: 2, description: 'Webinar 4 reminder — one week to go, sign up now' },
        { wc: '14 Sep', weekStart: '2026-09-14', count: 3, description: 'Programme release — infographic, session spotlight, Webinar 4 this week' },
        { wc: '21 Sep', weekStart: '2026-09-21', count: 3, description: 'Webinar 4 recap — key takeaways graphic, link to recording; Partnership Campaign 4 — awareness post' },
        { wc: '12 Oct', weekStart: '2026-10-12', count: 4, description: 'Shortlist announcement — category-by-category spotlights' },
        { wc: '19 Oct', weekStart: '2026-10-19', count: 1, description: 'Partnership Campaign 5 — pre-Symposium awareness post' },
        { wc: '26 Oct', weekStart: '2026-10-26', count: 4, description: 'Countdown series — one month, behind-the-scenes, two weeks, this week' },
    ],

    sellingPoints: [
        { icon: 'uil-check-circle', text: 'Free attendance — no registration fee' },
        { icon: 'uil-bed', text: 'Accommodation covered at The Manila Hotel' },
        { icon: 'uil-calendar-alt', text: '5-day programme including cultural tour & Awards Ceremony' },
        { icon: 'uil-users-alt', text: 'Co-hosted with COMELEC (Philippines)' },
        { icon: 'uil-globe', text: 'Networking with 150+ electoral leaders worldwide' },
    ],

    notes: [
        'Segment the database by region and engagement level. <strong>Asia-Pacific contacts</strong> should receive additional emphasis given the Manila location.',
        'Phone outreach is most effective <strong>1–2 weeks after an email campaign</strong>, when the event is fresh in recipients\' minds.',
        'LinkedIn posts should mix promotional content with engagement posts (polls, questions, throwbacks) to avoid being purely transactional.',
        'Track registration sources to understand which channels convert best and adjust resource allocation accordingly.',
        '2026 webinar programme: Webinar 1 — Empowering the Election Workforce (24 Apr) | Webinar 2 — Strengthening the Electoral Profession (4 Jun) | Webinar 3 — Speed in Election Results Transmission (14 Jul) | Webinar 4 — Inclusive Elections (16 Sep).',
        'Partnership campaigns (tagged <strong>partnership</strong>) run June–October alongside the main delegate acquisition programme. Subject lines and copy to be agreed with partner ahead of each send.',
    ],
};
