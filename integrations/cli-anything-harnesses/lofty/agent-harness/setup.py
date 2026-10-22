#!/usr/bin/env python3
"""cli-anything-lofty — GET-only REST harness for Lofty's Open API.

PEP 420 namespace package under ``cli_anything`` (no ``__init__.py`` in
``cli_anything/``), so it installs beside the other harnesses.
"""
from pathlib import Path
from setuptools import setup, find_namespace_packages

ROOT = Path(__file__).parent
README = ROOT / "cli_anything/lofty/README.md"


def read_readme():
    try:
        return README.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


setup(
    name="cli-anything-lofty",
    version="0.1.0",
    description="GET-only CLI-Anything harness for Lofty's Open API. No write method exists in the package.",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    license="Apache-2.0",
    packages=find_namespace_packages(include=["cli_anything.*"]),
    python_requires=">=3.10",
    install_requires=[
        "click>=8.1,<9.0",
        "prompt-toolkit>=3.0,<4.0",
        "requests>=2.28,<3.0",
    ],
    extras_require={"dev": ["pytest>=7"]},
    entry_points={
        "console_scripts": [
            "cli-anything-lofty=cli_anything.lofty.lofty_cli:main",
        ],
    },
    package_data={
        "cli_anything.lofty": ["skills/*.md", "README.md", "tests/TEST.md"],
    },
    include_package_data=True,
    zip_safe=False,
    keywords="cli lofty crm rest read-only ai-agent",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)
