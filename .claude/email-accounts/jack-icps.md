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
| `Electoral/Awards 26 Nominations` | nominations and nomination queries (exists as of September 2026; earlier nominations also sit in `Awards 26`) |
| `Electoral/Awards 26 Sponsors` | sponsor and exhibitor threads: bookings, invoices, logos, adverts, stand logistics |
| `Electoral/Awards 26 Speakers` | speaker invitations, confirmations, bios, slides |
| `Electoral/Awards 26 Judges` | Awarding Committee: invitations, acceptances, judging packs, scores |
| `Electoral/Awards 26 Delegates` | delegate registrations, joining details, room and workshop requests |
| `Electoral/Awards 25`, `Electoral/Awards 24 *` | closed editions, with the same split by sponsors / speakers / nominations |
| `Electoral/Electoral Webinars/*` | webinar traffic, one mailbox per series. `Smartmatic Webinar` for that series |
| `Electoral/Electoral membership` | Network membership enquiries and renewals |
| `Electoral/Electoral Press` | press releases and media enquiries |
| `Electoral/Electoral Research` | practice briefs, research requests, survey work |
| `Electoral/Nomos` | the ICPS/NOMOS partnership, and commissions' replies to the "... as an operational record" approach letters. Jack's private consultancy is a separate account, see [jack-tech](jack-tech.md) |
| `Electoral/Horizon` | the Horizon Europe (INDEPACT) bid |
| `BSVA` (top level) | BSVA survey work and the Manila workshop |
| `Buzzmint` (top level) | Buzzmint, on the ICPS side |
| `ICPS Training/*` | training courses and proposals, one mailbox per course. `Elearning` for e-learning course builds and reviews |

Two things to know before filing. `Deleted Items` and `Sent Items` hold
10,000 to 25,000 messages each, so never browse them without a search. And
several older mailboxes are misspelled in Mail itself (`Elecotral Judges`,
`Elecotral Sponsors`, `Awards 24 Logisitics`): match the name as it exists,
do not correct it.

### Files on sight

These need no reply from Jack and no question about where they go. They belong
in the file bucket of a sweep, confirmed once with everything else rather than
one at a time.

| What arrives | Where it goes |
|---|---|
| Delegate registrations, attendance confirmations, rooming and flight details written to a named colleague | `Awards 26 Delegates`. Invitation-letter requests are not on this list: they are Jack's to do, see Triage |
| Sponsor invoices, purchase orders, logos, adverts and stand logistics, once handled | `Awards 26 Sponsors` |
| Speaker bios, headshots, slides and confirmations, once acknowledged | `Awards 26 Speakers` |
| Nominations emailed in rather than submitted through the form, once receipt is confirmed | `Awards 26 Nominations`. Check the entry is actually in the nominations database before confirming it: query the `nominations` collection in MongoDB (fields are US-spelled, `nomineeOrganization`) |
| Webinar registrations and joining-detail traffic | the matching `Electoral Webinars/*` mailbox |
| Membership enquiries a colleague has answered | `Electoral membership` |
| Media enquiries and press-release traffic, once out | `Electoral Press` |
| Calendar acceptances, delivery receipts, newsletters, platform notifications | read and file to the thread's own folder, or leave read in the inbox if there is no folder |

Anything on this list that carries a direct question to Jack is a reply, not a
file. The list is about the routine version of each.

## Act, don't log

**Lean towards doing the action** (Jack, 27 September 2026). When something in
the inbox needs doing and it is Jack's, do it in the run: draft the reply,
build the letter, answer from the standing answers. Writing it down somewhere
instead is not a substitute. On 24 September an airfare request was filed with
"the standing answer is a decline" written into the TODO, nobody told the
delegate, and three days later a colleague had to ask Jack anyway.

**`projects/awards26/TODO.md` holds only work that is outstanding and
Claude's to do** (Jack, 28 September 2026). What is waiting on whom goes in the
`details` column of the matching row on the Philippines dashboard (Neon,
`philippines."Task"`), never as a new row. When an item is done, **delete it
from the file**; do not tick it and leave it. The file holds open work, not a
record of what happened.

## Triage

**Landing in this inbox does not mean it is addressed to Jack.** He is copied
on a great deal of the team's mail, and the ICPS house style is to forward long
chains around, so a thread can arrive with his name nowhere in it. Drafting a
reply to everything produces mail he should not send, and worse, mail that cuts
across a colleague who already owns the thread.

Four checks before treating a conversation as needing a reply.

**1. Who is it addressed to?** Read the To line of the latest message, not just
the sender. If Jack is only in CC, or the mail is written to a colleague
(`Dear Melissa`, `Dear Ms. Ramasawmy`), the default is **no draft**. Say what
was asked and who owns it, then move on.

**2. Has someone handed it to him?** A colleague explicitly passing something
over makes it his, whoever the mail was originally written to. The usual forms
are Tracy's "Jack can you follow up on this", Swastee's "Please advise" or
"Please register him", and anything forwarded to him with a direct question
attached. These are real actions.

**3. Whose job is the substance?** Delegate logistics written to a named
colleague are that colleague's: attendance confirmations, flight details,
rooming, workshop sign-ups and joining details that Wendy, Devianee, Swastee,
Melissa or Anoda asked for. File them and name the owner in the run's closing
lines. Jack owns the website, the programme and agenda, sponsors' logistics,
speakers, **invitation and visa letters**, delegate requests addressed to no
one in particular, and anything a colleague has handed him.

**We issue invitation and visa letters, to delegates and sponsors alike**
(Jack, 27 September 2026). Whoever asks, and whichever colleague the thread
sits with, Jack builds the letter with
`projects/awards26/letters/_tools/make-invitation-pdf.py` (usage in
`projects/awards26/standing-answers.md`, under *Letters*) and replies with it
attached through `reply.sh --attach`. He needs each person's name as it appears
on the passport and their job title. A passport number goes on the letter when
we have been given one, but **a letter is never held back to ask for it**: send
it without and offer to reissue (Jack, 3 October 2026, Adjara SEC). Check first whether their nationality needs a visa for the Philippines at
all: if it is on the 30-day visa-free list, the letter goes without a passport
line and the reply says no visa is needed (Antigua and Barbuda, 27 September
2026).

**A delegate who writes to Jack directly is Jack's, logistics or not.** The
rule above is about mail that lands in his inbox because he was copied or
forwarded it. When a delegate addresses him by name, and especially when they
are chasing a thread he answered himself, the reply is his. Handing it to the
events team is fine, but it happens *alongside* an answer, never instead of
one. Most of what they ask has a standing answer in
`projects/awards26/standing-answers.md` already, so the reply is usually short.
Worked example, 21 September 2026: Ms Game Noke (Gee Phaks) chased about
accommodation and flights, having had no reply since Jack confirmed her RSVP on
8 September. It was first classed as a file to `Awards 26 Delegates`. Jack
overruled it: she needed a response.

**Mail to `electoral@parlicentre.org` with no one named is Jack's to answer**
(Jack, 27 September 2026). "Dear Organising Team", "Dear ICPS team" or no
greeting at all: the default is a reply from Jack, not a note for the events
team. Most of what is asked has a standing answer in `standing-answers.md`, so
the reply is usually short. Worked example, 24 September 2026: Idjabou Bakari of
CENI Comores asked in French what the prise en charge covers, and Jack answered
it himself.

Mail to `electoral@` written to a **named colleague** is that colleague's, as
in check 3. When the colleague brings it back ("Please advise"), it is Jack's
under check 2, and the answer goes out that run. Idi Boina wrote to Anoda asking
ICPS to pay his airfare from Moroni; Devianee brought it to Jack on 27 September,
and the standing decline went straight back to her to pass on.

**Reply in the language they wrote in.** French enquiries get a French reply.
The Comoros answer above went out in French rather than being handed to a
colleague on language grounds.

**4. Is the ball already in his court?** If the last message in the thread is
Jack's, he is waiting on them, not the other way round. Park it. Do not draft a
chase unless he asks for one.

**Old mail in this inbox is deliberate, not forgotten.** Jack does not clear
his inbox, and he leaves things in it on purpose: reminders, threads he wants
in front of him, things he means to come back to. Something weeks old and quiet
is one of those. It is not an overdue action and it is not rubbish.

So: do not chase it, do not file it away, do not ask about it each run. Park
it, which records the id and keeps later runs quiet about it, and leaves the
message and its unread status exactly as they are. Filing one of these is worse
than leaving it, because it vanishes from the one place he looks.

Worked example, 9 September 2026: the Declan O'Brien thread (Kofi Annan
Foundation) was two weeks cold in the inbox. A chase was drafted and dropped.
Under the current rules it is a park: it is sitting there because Jack put it
there.

When in doubt, park it and say in one line that it was not obviously his. Let
Jack ask for a draft. Under-drafting costs a sentence; over-drafting costs him
a reply he has to unpick, and filing something he was keeping costs him a hunt
through fifteen folders.

## Standing answers

Answers Jack has already given to questions that recur. Use them in drafts
without asking again.

| Question | Answer | Since |
|---|---|---|
| A sponsor asks for the delegate list early | Reply CC Tracy, saying the list is still coming together and **Tracy will send it nearer the time**. Jack does not send it himself | 16 Sep 2026 (Miru) |
| A sponsor asks whether their hotel rooms are paid for | **Yes, sponsor rooms are covered.** They go on the rooming list and COMELEC books them | 16 Sep 2026 (Laxton) |
| Delegates' spouses: is accommodation covered? | **Yes**, spouse accommodation is covered | 16 Sep 2026 (Georgia CEC) |
| How many nominations do we need? | **60 in total** for Awards 26 | 16 Sep 2026 (Tracy) |
| A visa letter is asked for and the passport number has been given | **Put the number on the letter.** `make-invitation-pdf.py --passport` prints it under the address block | 22 Sep 2026 (A Daga) |
| A sponsor asks for more than their package (an extra delegate pass, say) | **That is Tracy's to sort.** Reply with Tracy copied and do not agree it yourself. Within the package, just confirm it | 3 Oct 2026 (Laxton) |
| A letter is asked for and no passport number has been given | **Send the letter anyway**, and offer to reissue it with the number | 3 Oct 2026 (Adjara SEC) |
| An individual with no organisation behind them offers to speak if all costs are covered | Decline. **We do not cover international airfare for anyone, speakers included.** Accommodation at the hotel is covered; the invitation to attend can stand | 22 Sep 2026 (Jeppe Soe, via Tracy) |
| Tracy asks for "your normal Dear John letter" | The **airfare decline**, from Jack straight to the delegate: a new Outlook message To them, CC the colleague who invited them plus Devianee and Tracy, subject `Re: <their thread>`. No airfare in full or part; accommodation, meals and transfers covered; invitation stands, link the event page | 28 Sep 2026 (Bashar Sulaiman; same shape as Jeppe Soe, 22 Sep) |
| A judge or Awarding Committee member asks whether ICPS will fund their flights | **No.** Airfare is not covered, business class or otherwise. Accommodation at the venue is covered. Jack may offer to explore an exception case by case, as he did for Toby James | 19 Sep 2026 (Nasim Zaidi, Toby James) |

## People

| Name | Address | Owns |
|---|---|---|
| Tracy Capaldi-Drewett | tracy.drewett@parlicentre.co.uk | ICPS EVP. Hands threads over. **He/him**, despite the name |
| Devianee Nithoo | cnithoo@parlistudies.org | delegate registrations, joining details |
| Swastee Ramsurrun | s.ramsurrun@parlistudies.org | events admin, registrations |
| Wendy Ramasawmy | wendy.ramasawmy@parlistudies.org | delegate logistics |
| Melissa Golam | | events team |
| Anoda Payannandee | | events team |
| Tushita Hauradhun | tushita.hauradhun@parlistudies.org | events team; sends the delegate invitations out |

Delegate logistics written to one of the six names above are theirs. Letters,
and delegate requests addressed to no one, are Jack's. See Triage.

## Notes

- Signature is configured in both Outlook and Apple Mail and is appended
  automatically. Drafts end at "Kind regards," with no name, title or contact
  block: anything added duplicates it.
- Any email that invites someone to, or references, a webinar, roundtable or
  awards event links to the live event page at
  `https://www.electoralnetwork.org/events/<id>`, hyperlinked on descriptive
  text ("the event page", "full details"), never a bare URL.
- **A Message-ID from the MCP is not always the one Mail matches on.** Mail remailers
  (rpost.net, seen on `secretariatse@tse.go.cr`) rewrite it, so `mail_read_message`
  returns a header the scripts cannot find. When a `move.sh`/`sweep.sh` row comes back
  MISSING, fall back to `--sender` plus `--subject` with `--dry-run`. (19 Sep 2026)
- Awards work is tracked in `projects/awards26/`; the `/awards-task` skill
  works that list. Partnership work is in `projects/nomos/`.
