"""Best-effort email notification when pipeline completes."""

import logging
import os
import json
from urllib.request import Request, urlopen
from urllib.error import URLError

logger = logging.getLogger(__name__)


async def send_results_email(email: str, analysis_id: str, base_url: str):
    """Send a results-ready email via Resend HTTP API. Fails silently with a warning log."""
    try:
        api_key = os.getenv("RESEND_API_KEY")
        from_addr = os.getenv("SMTP_FROM", "noreply@showmethemodel.io")

        if not api_key:
            logger.warning(
                "RESEND_API_KEY not configured, skipping email to %s",
                email,
            )
            return

        results_url = f"{base_url}/#/results/{analysis_id}"

        html = f"""\
<html>
<body>
<h2>Your analysis is complete!</h2>
<p>Your economic text analysis has finished processing.</p>
<p><a href="{results_url}">View your results</a></p>
<p style="color: #666; font-size: 0.9em;">
  Analysis ID: {analysis_id}<br>
  You can also look up this analysis from the front page using the ID above.
</p>
</body>
</html>"""

        payload = json.dumps({
            "from": from_addr,
            "to": [email],
            "subject": "Your Show Me the Model analysis is ready",
            "html": html,
        }).encode("utf-8")

        req = Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with urlopen(req) as resp:
            logger.info("Results email sent to %s for analysis %s (status %s)", email, analysis_id, resp.status)

    except URLError as exc:
        logger.warning(
            "Failed to send email to %s for analysis %s: %s", email, analysis_id, exc, exc_info=True
        )
    except Exception:
        logger.warning(
            "Failed to send email to %s for analysis %s", email, analysis_id, exc_info=True
        )
