"""
Beehiiv API v2 integration — newsletter subscription on email capture.
The report renders regardless of API outcome (do not block value on failure).
"""

import os
import requests


def subscribe_to_beehiiv(email: str, first_name: str = "") -> tuple[bool, str]:
    """
    Subscribe an email to the Automation Switch Beehiiv publication.

    Returns:
        (success: bool, message: str)
    """
    api_key        = os.getenv("BEEHIIV_API_KEY", "")
    publication_id = os.getenv("BEEHIIV_PUBLICATION_ID", "")

    if not api_key or not publication_id:
        return False, "Beehiiv credentials not configured"

    url = f"https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type":  "application/json",
    }
    payload: dict = {
        "email":               email,
        "reactivate_existing": True,
        "send_welcome_email":  True,
        "utm_source":          "audit_tool",
        "utm_medium":          "lead_magnet",
        "referring_site":      "automationswitch.com",
    }
    if first_name:
        payload["custom_fields"] = [{"name": "first_name", "value": first_name}]

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=8)
        if resp.status_code in (200, 201):
            return True, "Subscribed"
        return False, f"API returned {resp.status_code}"
    except requests.RequestException as exc:
        return False, str(exc)
