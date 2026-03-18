# Security Policy

## API Keys

API keys are never stored server-side. They are submitted by the user in the browser, sent in request headers (`X-Api-Key`), used for the duration of a single analysis, and discarded. They are not logged or persisted anywhere.

Results are saved to disk as anonymous JSON files keyed by a short random ID. No user data (email addresses, API keys, input text) is stored beyond what is needed to deliver the results email.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public issue**. Instead, email the maintainer at the address on their GitHub profile, or open a [private security advisory](https://github.com/joesteinberg/show-me-the-model/security/advisories/new).

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

You will receive a response within 72 hours.
