---
name: jack-icps
default: true
owner: Jack Vanderpump
role: Head of Policy Research, ICPS
address: jack.vanderpump@publicpolicyexchange.co.uk
apple_mail_account: Exchange
account_uuid: 66A7DAF1-5FBA-40A9-89B3-6FDFE70BA302
compose_client: outlook
reply_client: mail
signature: client
voice: voice/jack.md
templates: ../skills/email-inbox/templates
inbox: Inbox
---

# ICPS work mail

Jack's Exchange mailbox at the International Centre for Parliamentary Studies:
the Electoral Members' Network, the International Electoral Awards, webinars
and roundtables, sponsors, speakers, and ICPS-wide correspondence.

New mail composes in **Outlook**, which renders HTML properly and is where this
account's signature lives. Replies go through **Apple Mail**, which keeps the
thread and the existing recipients.

## Filing map

Mail is filed after it is dealt with, not on arrival, so the Inbox holds live
threads and everything settled sits below. Nesting is under `Electoral` unless
the row says otherwise; `move.sh` matches on the leaf name, so the paths here
are for reading rather than typing.

| Mailbox | What goes there |
|---|---|
| `Electoral/Awards 26` | 22nd Awards (Manila 2026), general: programme, agenda, venue, COMELEC |
| `Electoral/Awards 26 Sponsors` | sponsor and exhibitor threads: bookings, invoices, logos, adverts, stand logistics |
| `Electoral/Awards 26 Speakers` | speaker invitations, confirmations, bios, slides |
| `Electoral/Awards 26 Delegates` | delegate registrations, joining details, room and workshop requests |
| `Electoral/Awards 25`, `Electoral/Awards 24 *` | closed editions, with the same split by sponsors / speakers / nominations |
| `Electoral/Electoral Webinars/*` | webinar traffic, one mailbox per series. `Smartmatic Webinar` for that series |
| `Electoral/Electoral membership` | Network membership enquiries and renewals |
| `Electoral/Electoral Press` | press releases and media enquiries |
| `Electoral/Electoral Research` | practice briefs, research requests, survey work |
| `Electoral/Nomos` | the ICPS/NOMOS partnership. Jack's private consultancy is a separate account, see [jack-tech](jack-tech.md) |
| `Electoral/Horizon` | the Horizon Europe (INDEPACT) bid |
| `BSVA` (top level) | BSVA survey work and the Manila workshop |
| `Buzzmint` (top level) | Buzzmint, on the ICPS side |
| `ICPS Training/*` | training courses and proposals, one mailbox per course |

Two things to know before filing. `Deleted Items` and `Sent Items` hold
10,000 to 25,000 messages each, so never browse them without a search. And
several older mailboxes are misspelled in Mail itself (`Elecotral Judges`,
`Elecotral Sponsors`, `Awards 24 Logisitics`): match the name as it exists,
do not correct it.

## Triage

**Landing in this inbox does not mean it is addressed to Jack.** He is copied
on a great deal of the team's mail, and the ICPS house style is to forward long
chains around, so a thread can arrive with his name nowhere in it. Drafting a
reply to everything produces mail he should not send, and worse, mail that cuts
across a colleague who already owns the thread.

Three checks before treating a conversation as needing a reply.

**1. Who is it addressed to?** Read the To line of the latest message, not just
the sender. If Jack is only in CC, or the mail is written to a colleague
(`Dear Melissa`, `Dear Ms. Ramasawmy`), the default is **no draft**. Say what
was asked and who owns it, then move on.

**2. Has someone handed it to him?** A colleague explicitly passing something
over makes it his, whoever the mail was originally written to. The usual forms
are Tracy's "Jack can you follow up on this", Swastee's "Please advise" or
"Please register him", and anything forwarded to him with a direct question
attached. These are real actions.

**3. Whose job is the substance?** Delegate logistics belong to the events
team: attendance confirmations, flight details, rooming lists, workshop
sign-ups, invitation letters and joining details are recorded by Wendy,
Devianee, Swastee, Melissa and Anoda. When a delegate writes in about any of
those, even warmly and at length, the right output is usually a note of what
they asked for so it gets tracked, not a draft from Jack. Jack owns the
website, the programme and agenda, sponsors' logistics, speakers, and anything
a colleague has handed him.

Worked example, 9 September 2026: Paolo Maligaya of NAMFREL wrote to Wendy
Ramasawmy confirming attendance and asking for a room, a workshop place and an
invitation for his National Chairperson. It was in Jack's inbox, it was
unanswered, and it was easy to draft. It was still Wendy's to answer, and Jack
dropped the draft. The three asks were logged in `projects/awards26/TODO.md`
instead so they would not be lost.

**Stale threads.** The inbox is not a to-do list and is not cleared, so old
conversations sit in it indefinitely. Check the date of the latest message.
Something weeks old that has gone quiet is usually a dead thread rather than an
outstanding action, and reviving it produces an apologetic chase Jack did not
want to send. Same day, the Declan O'Brien thread (Kofi Annan Foundation) was
two weeks cold in the inbox; a chase was drafted and dropped.

When in doubt, list it as "not obviously yours, no draft made" and let Jack ask
for one. Under-drafting costs a sentence; over-drafting costs him a reply he
has to unpick.

## People

| Name | Address | Owns |
|---|---|---|
| Tracy Capaldi-Drewett | tracy.drewett@parlicentre.co.uk | ICPS EVP. Hands threads over. **He/him**, despite the name |
| Devianee Nithoo | cnithoo@parlistudies.org | delegate registrations, joining details |
| Swastee Ramsurrun | s.ramsurrun@parlistudies.org | events admin, registrations |
| Wendy Ramasawmy | | delegate logistics, invitation letters |
| Melissa Golam | | events team |
| Anoda Payannandee | | events team |

Delegate logistics land with the five names above, not with Jack. See Triage.

## Notes

- Signature is configured in both Outlook and Apple Mail and is appended
  automatically. Drafts end at "Kind regards," with no name, title or contact
  block: anything added duplicates it.
- Any email that invites someone to, or references, a webinar, roundtable or
  awards event links to the live event page at
  `https://www.electoralnetwork.org/events/<id>`, hyperlinked on descriptive
  text ("the event page", "full details"), never a bare URL.
- Awards work is tracked in `projects/awards26/`; the `/awards-task` skill
  works that list. Partnership work is in `projects/nomos/`.
