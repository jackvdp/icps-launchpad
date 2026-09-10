-- send_bulk_email.applescript
--
-- Headless bulk email sender driven from the send-bulk-emails skill.
-- Reads a .eml/.emltpl template and a CSV, merges CSV values into the
-- template wherever the token {{<csv-header>}} appears, and sends one
-- message per CSV row through Microsoft Outlook.
--
-- Invocation (positional args, via osascript):
--   osascript send_bulk_email.applescript TEMPLATE CSV ATTACHMENTS_FOLDER [TEST_EMAIL] [DELAY_SECONDS]
--
-- Arguments:
--   TEMPLATE            POSIX path to a .eml or .emltpl file (required)
--   CSV                 POSIX path to the CSV file (required)
--   ATTACHMENTS_FOLDER  POSIX path to a folder, or "" if none (required positionally)
--   TEST_EMAIL          if non-empty, send a single message to this address
--                       using row 1 of the CSV, with subject prefixed "[TEST] "
--   DELAY_SECONDS       seconds to wait between sends (default 30)
--
-- CSV requirements:
--   * Must include a header containing the word "email" (case-insensitive);
--     that column holds the recipient address(es). Multiple addresses per
--     cell may be separated by , ; space or newline.
--   * May include a header containing "attachments" — filenames in that
--     cell (also multi-separator) will be attached from ATTACHMENTS_FOLDER.
--   * Any other header `foo` is treated as a merge token {{foo}}, which is
--     substituted into the template's subject and body.
--
-- Token rule:
--   The template uses {{header}} (with double braces). A CSV header that
--   already begins with {{ is used verbatim; otherwise {{ and }} are wrapped
--   around it automatically.

on run argv
	if (count of argv) < 3 then
		log "Usage: osascript send_bulk_email.applescript TEMPLATE CSV ATTACHMENTS_FOLDER [TEST_EMAIL] [DELAY_SECONDS]"
		error "Missing required arguments" number 1
	end if

	set templatePosix to item 1 of argv
	set csvPosix to item 2 of argv
	set attachmentsPosix to item 3 of argv

	set testEmail to ""
	if (count of argv) ≥ 4 then set testEmail to item 4 of argv

	set delaySeconds to 30
	if (count of argv) ≥ 5 then
		try
			set delaySeconds to (item 5 of argv) as integer
		end try
	end if

	-- Convert POSIX paths to HFS paths (AppleScript-native)
	set templateFile to (POSIX file templatePosix) as alias
	set csvFile to (POSIX file csvPosix) as alias

	set attachmentsFolder to ""
	if attachmentsPosix is not "" then
		set attachmentsFolder to (POSIX file attachmentsPosix) as string
		if attachmentsFolder does not end with ":" then
			set attachmentsFolder to attachmentsFolder & ":"
		end if
	end if

	-- Parse CSV
	set csvContent to read csvFile as «class utf8»
	set csvLines to my splitIntoNonEmptyLines(csvContent)
	if (count of csvLines) < 2 then
		error "CSV needs a header row and at least one data row" number 2
	end if

	set headerRow to my parseCSVLine(item 1 of csvLines)
	set cleanHeaders to my unquoteList(headerRow)

	set emailIndex to my findHeader(cleanHeaders, "email")
	set attachmentsIndex to my findHeader(cleanHeaders, "attachments")

	if emailIndex is 0 then
		error "No column header contains 'email'" number 3
	end if

	-- Build records
	set allRecords to {}
	repeat with rowIndex from 2 to count of csvLines
		set rowFields to my parseCSVLine(item rowIndex of csvLines)
		set cleanFields to my unquoteList(rowFields)
		set end of allRecords to {hdrs:cleanHeaders, vals:cleanFields, emailIdx:emailIndex, attachIdx:attachmentsIndex}
	end repeat

	-- Test mode: send a single email to the test address using row 1
	if testEmail is not "" then
		my logLine("Test mode — sending one preview to " & testEmail & " using row 1")
		my sendSingleEmail(item 1 of allRecords, testEmail, true, templateFile, attachmentsFolder)
		my logLine("Test send complete.")
		return "OK"
	end if

	-- Bulk send
	set emailCount to 0
	set errorCount to 0
	set rowNum to 0

	repeat with rec in allRecords
		set rowNum to rowNum + 1
		set emailCell to item (emailIdx of rec) of (vals of rec)
		set recipients to my parseEmailAddresses(emailCell)

		if (count of recipients) is 0 then
			my logLine("Row " & rowNum & ": no valid email address, skipping")
		else
			repeat with rcpt in recipients
				try
					my sendSingleEmail(rec, rcpt as string, false, templateFile, attachmentsFolder)
					set emailCount to emailCount + 1
					my logLine("Row " & rowNum & ": sent to " & rcpt)
					if delaySeconds > 0 then delay delaySeconds
				on error errMsg number errNum
					set errorCount to errorCount + 1
					my logLine("Row " & rowNum & ": ERROR sending to " & rcpt & " — " & errMsg)
				end try
			end repeat
		end if
	end repeat

	my logLine("Done. Sent " & emailCount & ", errors " & errorCount)
	return "OK"
end run

-- ---- Email sending ----

on sendSingleEmail(rec, recipientEmail, isTest, templateFile, attachmentsFolder)
	tell application "Microsoft Outlook"
		set importedMessage to import eml templateFile
		set bodyText to content of importedMessage
		set subjectText to subject of importedMessage
		set templateAttachments to attachments of importedMessage

		-- Replace tokens for every CSV header (auto-wrap with {{ }} if needed)
		repeat with i from 1 to count of (hdrs of rec)
			set headerName to item i of (hdrs of rec)
			if i ≤ (count of (vals of rec)) then
				set headerValue to item i of (vals of rec)
				set tokenPlaceholder to my wrapToken(headerName)

				set subjectText to my replaceText(subjectText, tokenPlaceholder, headerValue)
				set bodyText to my replaceText(bodyText, tokenPlaceholder, headerValue)
			end if
		end repeat

		if isTest then
			set subjectText to "[TEST] " & subjectText
		end if

		set newEmail to make new outgoing message with properties {subject:subjectText, content:bodyText}
		make new recipient at newEmail with properties {email address:{address:recipientEmail}}

		-- Re-attach any attachments embedded in the template
		if (count of templateAttachments) > 0 and attachmentsFolder is not "" then
			repeat with att in templateAttachments
				try
					set attName to name of att
					set extractPath to attachmentsFolder & attName
					save att in file extractPath
					make new attachment at newEmail with properties {file:(extractPath as alias)}
				end try
			end repeat
		end if

		-- Per-row attachments from CSV `attachments` column
		if (attachIdx of rec) > 0 and (attachIdx of rec) ≤ (count of (vals of rec)) and attachmentsFolder is not "" then
			set rawAttCell to item (attachIdx of rec) of (vals of rec)
			set attList to my parseEmailAddresses(rawAttCell) -- comma/semicolon/newline-separated; reuses the parser
			if (count of attList) is 0 and length of rawAttCell > 0 then
				-- parseEmailAddresses filters by '@', so re-split filenames manually
				set attList to my splitOnSeparators(rawAttCell)
			end if
			repeat with fname in attList
				set fname to my trimWhitespace(fname as string)
				if length of fname > 0 then
					try
						set attachmentPath to attachmentsFolder & fname
						make new attachment at newEmail with properties {file:(attachmentPath as alias)}
					on error attErr
						-- continue
					end try
				end if
			end repeat
		end if

		delete importedMessage
		send newEmail
	end tell
end sendSingleEmail

-- ---- Helpers ----

on wrapToken(headerName)
	set h to headerName as string
	if h starts with "{{" and h ends with "}}" then
		return h
	else
		return "{{" & h & "}}"
	end if
end wrapToken

on replaceText(theText, findText, replaceWith)
	if findText is "" then return theText
	if theText does not contain findText then return theText
	set AppleScript's text item delimiters to findText
	set theParts to text items of theText
	set AppleScript's text item delimiters to replaceWith
	set theResult to theParts as string
	set AppleScript's text item delimiters to ""
	return theResult
end replaceText

on splitIntoNonEmptyLines(theText)
	set theLines to paragraphs of theText
	set keep to {}
	repeat with ln in theLines
		set ln2 to ln as string
		if length of ln2 > 0 then set end of keep to ln2
	end repeat
	return keep
end splitIntoNonEmptyLines

on unquoteList(theList)
	set out to {}
	repeat with itm in theList
		set s to itm as string
		if s starts with "\"" and s ends with "\"" and length of s ≥ 2 then
			set s to text 2 thru -2 of s
		end if
		set end of out to s
	end repeat
	return out
end unquoteList

on findHeader(headers, needle)
	set needleLower to my toLower(needle)
	repeat with i from 1 to count of headers
		if my toLower(item i of headers) contains needleLower then
			return i
		end if
	end repeat
	return 0
end findHeader

on toLower(s)
	-- AppleScript has no native lowercase; use shell for one-line correctness
	return do shell script "printf %s " & quoted form of (s as string) & " | tr '[:upper:]' '[:lower:]'"
end toLower

on parseEmailAddresses(emailString)
	-- Note: do not name the accumulator `result`. That is AppleScript's implicit
	-- last-command variable, and assigning to it fails with -2753.
	set parts to my splitOnSeparators(emailString)
	set foundAddresses to {}
	repeat with p in parts
		set clean to my trimWhitespace(p as string)
		if length of clean > 0 and clean contains "@" then
			set end of foundAddresses to clean
		end if
	end repeat
	return foundAddresses
end parseEmailAddresses

on splitOnSeparators(theText)
	-- Replace ; \r \n with , then split on ,
	set s to theText
	set AppleScript's text item delimiters to ";"
	set s to (text items of s) as string
	set AppleScript's text item delimiters to ","
	set s to (text items of s) as string
	set AppleScript's text item delimiters to return
	set s to (text items of s) as string
	set AppleScript's text item delimiters to ","
	set s to (text items of s) as string
	set AppleScript's text item delimiters to linefeed
	set s to (text items of s) as string
	set AppleScript's text item delimiters to ","
	set parts to text items of s
	set AppleScript's text item delimiters to ""
	return parts
end splitOnSeparators

on trimWhitespace(str)
	set t to str
	repeat while length of t > 0 and (character 1 of t is " " or character 1 of t is tab)
		set t to text 2 thru -1 of t
	end repeat
	repeat while length of t > 0 and (character -1 of t is " " or character -1 of t is tab)
		set t to text 1 thru -2 of t
	end repeat
	return t
end trimWhitespace

on parseCSVLine(csvLine)
	-- RFC-ish CSV: handles quoted fields with embedded commas and "" escapes
	set fields to {}
	set field to ""
	set inQuotes to false
	set i to 1
	repeat while i ≤ length of csvLine
		set ch to character i of csvLine
		if ch is "\"" then
			if inQuotes then
				if i < length of csvLine and character (i + 1) of csvLine is "\"" then
					set field to field & "\""
					set i to i + 1
				else
					set inQuotes to false
				end if
			else
				set inQuotes to true
			end if
		else if ch is "," and not inQuotes then
			set end of fields to field
			set field to ""
		else
			set field to field & ch
		end if
		set i to i + 1
	end repeat
	set end of fields to field
	return fields
end parseCSVLine

on logLine(msg)
	-- Emit progress to stdout for the calling skill to display
	do shell script "echo " & quoted form of (msg as string)
end logLine
