# Nomination received

**Use it when** a commission asks whether its nomination arrived, or sends one in
by email and wants receipt confirmed.

This is the most repeated email of the awards cycle: RENIEC, NEBE, ONPE, Georgia
CEC, the Maldives and SEC Bihar all got a version of it in September 2026. It is
short, and it is almost entirely a lookup.

**Always a reply, never a compose.** These arrive on a thread. Use `reply.sh`, so
the commission's own reference and any colleagues already copied stay on it.

---

## Before you write a word

**Look the nomination up. Do not confirm from the email alone.** The point of the
reply is that someone has checked, and the two ways in produce different answers.

**Submitted through the form.** Query the `nominations` collection in MongoDB
(database `test`). Fields are US-spelled: `nomineeOrganization`, not `-isation`.
Confirm back the category, the nominee, who submitted it and the date. If you
cannot find it, say so and ask them to resend rather than guessing.

**Emailed in, outside the form.** It will not be in the database at all, so do
not imply that it is. Confirm what actually arrived (how many forms, which
categories) and say you will add it to the pack by hand. Then log it in
`projects/awards26/TODO.md`, because nothing else will catch it.

Exclude the known junk from any count you give: the `test/test/test` row, Jack's
July "Jack VDP" test, and duplicate submissions.

---

## Fields

| Field | Where it comes from |
|---|---|
| `[NAME]` | how they sign, not how the address reads |
| `[CATEGORY]` or `[N] forms` | the database entry, or the attachments actually received |
| `[NOMINEE]` | organisation or individual, as submitted |
| `[SUBMITTED]` | the date the entry was created, or the date the email arrived |

---

## Body, submitted through the form

```
Hi [NAME],

Yes, it arrived safely. I have your [CATEGORY] nomination for [NOMINEE],
submitted on [SUBMITTED].

Nothing further is needed from you. If the Awarding Committee asks for
clarification during the sift, I will come back to you.

Kind regards,
```

## Body, emailed in outside the form

```
Dear [NAME],

Thank you, the nominations have arrived safely and within the deadline we
agreed.

I have [N] forms, for [NOMINEE], with the supporting evidence for each
category. As these came by email rather than through the form, I will add them
to the pack myself before it goes to the Awarding Committee.

Nothing more is needed from you for now. If the Committee asks for
clarification during the sift, I will come back to you.

Kind regards,
```

## If they also sent supporting documents

Add one line, do not restructure the email:

```
The documents you sent will be attached to the entry.
```

---

## Notes

- **Do not restate their whole submission back to them.** One line of what you
  hold is the confirmation; listing ten categories back reads like a receipt.
- **Do not mention the nominations target or how many have come in.** That is
  internal.
- **Do not announce or refuse a deadline extension in writing.** Anyone who asks
  can send theirs to Jack by email and he adds it to the pack. See
  `projects/awards26/standing-answers.md`.
- File the original to `Awards 26` once the reply is drafted. There is no
  `Awards 26 Nominations` mailbox for this edition.

### Edition notes, Manila 2026

Nominations closed **Tuesday 15 September 2026**, with a private email route open
to **Tuesday 22 September**. Sent examples: RENIEC (14 Sep), NEBE via Rebecca
Teshome (16 Sep), ONPE (16 Sep), Maldives (20 Sep), SEC Bihar (22 Sep, ten forms
emailed in as a zip).
