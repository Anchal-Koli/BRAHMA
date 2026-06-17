# EMAIL_DISPATCHER Specification

## Mission
Autonomous Notification and Document Delivery Engine.

## Purpose
To provide a reliable, secure, and standardized interface for sending automated reports, notifications, and attachments to stakeholders.

## Capabilities
* **Plain Text Email:** Standard notifications and alerts.
* **HTML Email:** Rich-text formatted summaries and status updates.
* **PDF Attachment:** Delivery of system-generated reports and documentation.
* **Report Delivery:** Automated distribution of BHOOMI and ARADH reports.
* **Training Report Delivery:** Progress logs for agent training sessions.
* **EOD/MOM Delivery:** End-of-Day (EOD) summaries and Minutes of Meeting (MOM).

## Technical Requirements
* **SMTP Protocol:** Primary delivery mechanism (Default: smtp.gmail.com).
* **Port:** 587 (STARTTLS).
* **Authentication:** App-specific passwords only.

## Security Rules (Hardened)
* **Zero-Commit Policy:** Credentials must NEVER be committed to source control.
* **Memory Isolation:** Credentials must NEVER be stored in `MEMORY.md`, `PERSONA_RULES.md`, or `context.md` files.
* **Runtime Read:** Credentials must be read dynamically from a local `.env` file only.
* **Audit Trail:** Every email sent must be logged (without sensitive data) in `SESSIONS/email_logs.md`.

## Integration Status
* **Status:** Specification Defined.
* **Implementation:** Pending environment configuration.

## Validation Procedure
1. **Test Email:** Verify SMTP handshake and authentication.
2. **HTML Report:** Verify rendering of formatted tables and headers.
3. **PDF Attachment:** Verify file encoding and attachment integrity.
