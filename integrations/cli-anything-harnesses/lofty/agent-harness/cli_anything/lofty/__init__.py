"""cli-anything-lofty — GET-only REST harness for Lofty's Open API.

Read recipes over ``https://api.lofty.com/v1.0``. No POST, PUT, PATCH or DELETE
exists anywhere in this package; a test greps for them. The existing
``lofty-bridge`` MCP on the Mac remains the primary path — this is the
CLI-Anything-shaped front to the same API.
"""

__version__ = "0.1.0"
