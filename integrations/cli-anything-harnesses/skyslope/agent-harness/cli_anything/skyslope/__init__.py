"""cli-anything-skyslope — read-only, ECC-gated DOMShell harness for SkySlope.

Read recipes only. There is no ``act`` group, no click, no type, no download
and no upload anywhere in this package. Every command that touches the live
site is refused unless ``CLI_ANYTHING_ECC_REVIEWED_AT`` holds a sign-off date.
"""

__version__ = "0.1.0"
