/**
 * Central config for the current awards edition.
 * Update the eventId each year once the event is created in the database.
 * Set to null to hide register buttons until the event exists.
 */
export const AWARDS_EVENT_ID: string | null = '69938de4f4f23e0fef2e3129';

/**
 * The current nominations period: roughly the end of the previous year through
 * to the start of the next awards ceremony. Drives both the "My Nominations"
 * list filter on the account page and the edit lock (nominations can only be
 * edited while the period is open). Update these dates each edition.
 */
export const NOMINATIONS_PERIOD = {
    edition: '22nd International Electoral Awards',
    opens: '2025-12-01T00:00:00.000Z',   // end of previous year
    // Hard close for the portal. The published deadline was 15 September 2026, but late
    // nominations are still accepted, so the form stays open until the eve of the ceremony.
    closes: '2026-11-30T23:59:59.000Z',
};

export const isNominationsOpen = (now: Date = new Date()): boolean =>
    now >= new Date(NOMINATIONS_PERIOD.opens) && now <= new Date(NOMINATIONS_PERIOD.closes);