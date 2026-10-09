"""cli-anything-zoho — GET-only REST harness for Zoho CRM (API v8).

Read recipes only. No POST, PUT, PATCH or DELETE exists anywhere in this
package; a test greps for them. The access token is therefore NOT minted here
(the OAuth refresh grant is a POST by specification) — it arrives as
``ZOHO_ACCESS_TOKEN`` for one hour and is never stored.

Known blocker, surfaced by name: HTTP 403 ``NO_PERMISSION`` /
``Crm_Implied_Api_Access`` means the profile-level "Zoho CRM API Access"
toggle is off — a Zoho-side setting, not a credential problem.
"""

__version__ = "0.1.0"
