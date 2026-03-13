"""Best-effort email notification when pipeline completes."""

import logging
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


async def send_results_email(email: str, analysis_id: str, base_url: str):
    """Send a results-ready email. Fails silently with a warning log."""
    try:
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", "465"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        from_addr = os.getenv("SMTP_FROM", smtp_user)

        if not all([smtp_host, smtp_user, smtp_pass]):
            logger.warning(
                "SMTP not configured (missing SMTP_HOST/USER/PASS), skipping email to %s",
                email,
            )
            return

        results_url = f"{base_url}/#/results/{analysis_id}"

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your Show Me the Model analysis is ready"
        msg["From"] = from_addr
        msg["To"] = email

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

        msg.attach(MIMEText(html, "html"))

        if smtp_port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_addr, email, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_addr, email, msg.as_string())

        logger.info("Results email sent to %s for analysis %s", email, analysis_id)

    except Exception:
        logger.warning(
            "Failed to send email to %s for analysis %s", email, analysis_id, exc_info=True
        )
