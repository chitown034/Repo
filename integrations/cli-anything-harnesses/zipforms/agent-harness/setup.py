#!/usr/bin/env python3
"""cli-anything-zipforms — read-only, ECC-gated DOMShell harness for zipForms.

PEP 420 namespace package under ``cli_anything`` (no ``__init__.py`` in
``cli_anything/``), so it installs beside cli-anything-browser and the other
harnesses without collision.

Hard prerequisite not expressible here: ``cli-anything-browser`` (not on PyPI —
built from the CLI-Anything clone into the same venv), plus Node/npx, Chrome and
the DOMShell extension. The harness reports each one explicitly when missing.
"""
from pathlib import Path
from setuptools import setup, find_namespace_packages

ROOT = Path(__file__).parent
README = ROOT / "cli_anything/zipforms/README.md"


def read_readme():
    try:
        return README.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


setup(
    name="cli-anything-zipforms",
    version="0.1.0",
    description="Read-only, ECC-gated CLI-Anything harness for zipForms (DOMShell). No act group.",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    license="Apache-2.0",
    packages=find_namespace_packages(include=["cli_anything.*"]),
    python_requires=">=3.10",
    install_requires=[
        "click>=8.1,<9.0",
        "prompt-toolkit>=3.0,<4.0",
    ],
    extras_require={"dev": ["pytest>=7"]},
    entry_points={
        "console_scripts": [
            "cli-anything-zipforms=cli_anything.zipforms.zipforms_cli:main",
        ],
    },
    package_data={
        "cli_anything.zipforms": ["skills/*.md", "paths.json", "README.md", "tests/TEST.md"],
    },
    include_package_data=True,
    zip_safe=False,
    keywords="cli zipforms lone-wolf real-estate domshell read-only ai-agent",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)
