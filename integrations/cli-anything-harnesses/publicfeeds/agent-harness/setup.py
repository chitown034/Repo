#!/usr/bin/env python3
"""cli-anything-publicfeeds — read-only recipes for the public real-estate and
lender research pages the Command Deck depends on that have no Composio
toolkit and no usable API: Redfin market pages, lender-advertised-rate pages,
and builder incentive pages.

Namespace-package layout (PEP 420): `cli_anything/` has NO __init__.py so this
package coexists with cli-anything-browser and the other site harnesses in one
environment. `cli-anything-browser` must already be installed in the same
environment (it is not on PyPI; MAC-SETUP.sh builds it from the vendored copy
into ~/Applications/cli-anything-harnesses/.venv).
"""
from pathlib import Path

from setuptools import find_namespace_packages, setup

ROOT = Path(__file__).parent
README = ROOT / "cli_anything/publicfeeds/README.md"


def read_readme() -> str:
    try:
        return README.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


setup(
    name="cli-anything-publicfeeds",
    version="0.1.0",
    description="Read-only public-page recipes (DOMShell, via cli-anything-browser) for market, lender-rate and builder-incentive pages. No write verbs exist. Each policy group is disabled-by-policy until its terms/robots.txt question is reviewed.",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    license="Apache-2.0",
    packages=find_namespace_packages(include=["cli_anything.*"]),
    python_requires=">=3.10",
    install_requires=[
        "click>=8.1,<9.0",
        "prompt-toolkit>=3.0,<4.0",
        "cli-anything-browser>=1.0.0",   # not on PyPI: install browser/agent-harness first
    ],
    extras_require={"dev": ["pytest>=7"]},
    entry_points={
        "console_scripts": [
            "cli-anything-publicfeeds=cli_anything.publicfeeds.publicfeeds_cli:main",
        ],
    },
    package_data={
        "cli_anything.publicfeeds": [
            "paths.json",
            "README.md",
            "skills/*.md",
            "tests/TEST.md",
            "tests/fixtures/*.json",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords="cli real-estate mortgage-rates market-data builder-incentives domshell read-only ai-agent",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)
