# Email templates

Reusable emails for the `/email-inbox` skill. Each file has the same shape: when to use, recipients, subject, fields to substitute, a ready-to-run `compose.sh --html` body, and notes. Edition-specific detail sits under its own heading at the end of a file so it can be pruned when the edition closes.

## Index

| Template | Use it when | File |
|---|---|---|
| Speaker briefing | Sending confirmed webinar or roundtable speakers their logistics about a week out: thanks, bio and slides requests, agenda with timings, Zoom details | `webinars/speaker-briefing.md` |
| Delegate briefing | Sending registered delegates their joining details, usually the day before, via the admin team | `webinars/delegate-briefing.md` |
| Sponsor welcome | First logistics email to a newly signed Awards sponsor or exhibitor: point-of-contact intro plus package recap | `awards/sponsor-welcome.md` |
| Sponsor nominations ask | Asking a sponsor to nominate the partner commissions they work with before a nominations deadline | `awards/sponsor-nominations.md` |
| Nomination received | Confirming to a commission that its nomination arrived, whether through the form or by email | `awards/nomination-received.md` |

## How to use one

1. Read the template file and confirm the bracketed fields with the user (or pull them from the event's data file, the electoral dashboard, or the relevant `projects/<project>/` folder).
2. Substitute every `[FIELD]`. Leave nothing bracketed in the draft.
3. Show the finished body to the user in a code block before opening it.
4. Run the `compose.sh` command from the template to open the draft. It opens in whichever client the active account profile names; these templates are written for the ICPS account, which composes in Outlook.

## Conventions shared by all templates

- These templates assume the `jack-icps` profile: ICPS work, composed in Outlook, with a signature already configured in the client. On an account whose profile says `signature: none`, add the sign-off the profile gives.
- Compose via `compose.sh --html` so lists, bold and links render in Outlook. Never send; only open the draft.
- No signature block and no sign-off name. End at the closing line; the mail client appends the signature.
- British English, no em dashes (and no `&mdash;`). Use en dashes (`&ndash;`) for time ranges only.
- Link to the live event page on electoralnetwork.org as a hyperlink on descriptive text, never a bare URL.
- Single quotes inside HTML attributes (`href='...'`).
- The wording is a starting point. Adjust it to the recipient and the thread, and vary the skeleton when drafting several from the same template in one sitting.

## Adding a template

Copy the section headings from an existing file, put it under `webinars/` or `awards/` (or a new subfolder if it fits neither), and add a row to the index above and to the table in `SKILL.md`.
