# Sponsor welcome (first logistics email to a new sponsor or exhibitor)

## When to use

The first email to a newly signed sponsor or exhibitor for an Awards & Symposium edition, once Tracy confirms the package. It introduces Jack as the logistics point of contact and recaps what the package includes. Two variants: A is fuller and describes the event; B is shorter and skips the venue.

## Recipients

The sponsor's named contact. Jack is logistics, not finance: no prices, VAT or payment details.

## Subject

- Variant A: `[EDITION] International Electoral Awards & Symposium, [CITY]: your point of contact`
- Variant B: `Welcome to the [EDITION] International Electoral Awards & Symposium`

## Fields to substitute

- Contact name and company
- Edition number, co-host, city, dates and venue (Variant A only)
- Package bullets from the sponsor's booking form or the electoral dashboard (electoral-dashboard.vercel.app, sponsor table)
- Public event URL (currently https://www.electoralnetwork.org/awards)

## Body: Variant A (fuller)

```bash
.claude/skills/email-inbox/compose.sh \
  --to "placeholder@example.com" \
  --subject "[EDITION] International Electoral Awards & Symposium, [CITY]: your point of contact" \
  --html \
  --body "<p>Hi [NAME],</p>
<p>Lovely to be in touch. Tracy has passed me the details of [COMPANY]'s involvement in the [EDITION] International Electoral Awards & Symposium, and I will be your main point of contact for everything from here[, as with previous events], so do come to me with anything you need between now and the event.</p>
<p>A quick recap of the event and what your package includes.</p>
<p>The event: the [EDITION] International Electoral Awards & Symposium, jointly hosted by the International Centre for Parliamentary Studies (ICPS) and [CO-HOST], takes place from [START DATE] to [END DATE] at [VENUE], [CITY]. It brings together electoral leaders and professionals from across [REGION] and beyond for a five-day programme of symposium sessions, fringe demonstrations, networking, and the International Electoral Awards Ceremony.</p>
<p>Your package includes:</p>
<ul>
<li>A [SIZE] exhibition space</li>
<li>[N] delegate passes</li>
<li>A full-page advert in the conference programme</li>
<li>Logo and hyperlink on the event website and materials</li>
<li>A copy of the delegate list</li>
<li>Airport shuttles</li>
</ul>
<p>I will be in touch with the practical details (artwork specifications, deadlines, and on-site logistics) in good time, but in the meantime do let me know if you have any questions. You can find more on <a href='[EVENT URL]'>our website</a>.</p>
<p>Warm regards from London,</p>"
```

## Body: Variant B (shorter, no venue)

```bash
.claude/skills/email-inbox/compose.sh \
  --to "placeholder@example.com" \
  --subject "Welcome to the [EDITION] International Electoral Awards & Symposium" \
  --html \
  --body "<p>Hi [NAME],</p>
<p>I hope you are well. I am Jack Vanderpump from ICPS, and I will be your point of contact for logistics for the [EDITION] International Electoral Awards & Symposium in [CITY] this [MONTH]. Delighted to have [COMPANY] on board.</p>
<p>Here is a quick recap of what you have booked:</p>
<ul>
<li>A [SIZE] exhibition space</li>
<li>[N] delegate passes</li>
<li>A full-page advert in the conference programme</li>
<li>Your logo and a hyperlink</li>
<li>A copy of the delegate list</li>
<li>Airport shuttles</li>
</ul>
<p>I will be in touch shortly with more on next steps and timings. If you want to check anything in the meantime, just drop me a line.</p>
<p>You can also see public details about the event on <a href='[EVENT URL]'>our website</a>.</p>
<p>Best wishes,</p>"
```

## Notes

- Edit the package bullets to match what was actually booked; do not leave the defaults in.
- Ask for a logo if the sponsor is not yet on the website sponsors list (`web/src/data/sponsors.ts`).

## Manila 2026 notes (prune when the edition closes)

- Edition details: 22nd edition, co-hosted with the Commission on Elections of the Philippines (COMELEC), Sunday 29 November to Thursday 3 December 2026, Manila, Asia-Pacific region.
- Venue: the **Conrad Manila**, replacing The Manila Hotel. Safe to name to sponsors. COMELEC has not yet put the name in writing to ICPS, so do not attribute it to them. Rooms are booked centrally: COMELEC's Protocol and Liaison Office books with the hotel from a consolidated rooming list ICPS collects, so tell sponsors to send their dates rather than book direct.
- Variant A was sent to Al Ghurair on 30 June 2026; Variant B to Mantratec on 7 July 2026.
