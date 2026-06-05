"""
Lightweight SerpAPI helper — prints structured hints for manual database entry.
Run from tools/serp_research with SERPAPI_API_KEY in the environment.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

try:
    from serpapi import GoogleSearch
except ImportError:
    print("Install dependencies: pip install -r requirements.txt", file=sys.stderr)
    raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Google results via SerpAPI for manual spec QA.")
    parser.add_argument("query", help='e.g. "Apple MacBook Pro 16 M4 Max"')
    args = parser.parse_args()

    api_key = os.environ.get("SERPAPI_API_KEY")
    if not api_key:
        print("SERPAPI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)

    search = GoogleSearch({"q": args.query, "api_key": api_key})
    data = search.get_dict()

    slim = {
        "query": args.query,
        "organic_titles": [r.get("title") for r in data.get("organic_results", [])[:8]],
        "shopping_results": data.get("shopping_results", [])[:5],
        "inline_shopping": data.get("inline_shopping", [])[:5],
        "knowledge_graph": data.get("knowledge_graph"),
        "answer_box": data.get("answer_box"),
    }
    print(json.dumps(slim, indent=2, default=str))


if __name__ == "__main__":
    main()
