import csv
import io
import os
import re
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

load_dotenv()

app = FastAPI(title="Godavari Basket Product API", version="2.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL", "")

env_origins = [url.strip().rstrip("/") for url in FRONTEND_URL.split(",") if url.strip()]
allowed_origins = list(set(["http://localhost:3000", "https://godavaribasket.com", *env_origins]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _text(row: dict[str, str], key: str) -> str:
    return (row.get(key) or "").strip()


def _number(row: dict[str, str], key: str, default: float = 0.0) -> float:
    try:
        return float((row.get(key) or "").replace(",", "").strip())
    except (TypeError, ValueError):
        return default


def _integer(row: dict[str, str], key: str, default: int = 0) -> int:
    try:
        return int(_number(row, key, float(default)))
    except (TypeError, ValueError):
        return default


def sheet_products() -> list[dict[str, Any]]:
    """Read the public product catalogue directly from the configured Google Sheet CSV.

    Expected columns are documented in GOOGLE_SHEET_SETUP.md. Seller/marketplace fields are
    intentionally ignored: Godavari Basket is the storefront and the sheet is the product source.
    """
    if not GOOGLE_SHEET_URL:
        raise HTTPException(503, "GOOGLE_SHEET_URL is not configured")

    try:
        response = requests.get(GOOGLE_SHEET_URL, timeout=15)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(502, f"Could not read product sheet: {exc}") from exc

    rows = csv.DictReader(io.StringIO(response.text))
    products: list[dict[str, Any]] = []

    for row in rows:
        try:
            product_id = int(_text(row, "id"))
        except ValueError:
            continue

        active = _text(row, "active").lower() not in {"false", "0", "no", "inactive"}
        if not active:
            continue

        variants: list[dict[str, Any]] = []
        seen_variant_labels: set[str] = set()

        def add_variant(label: str, price: float) -> None:
            clean_label = label.strip().lower().replace(" ", "")
            if not clean_label or price <= 0 or clean_label in seen_variant_labels:
                return
            seen_variant_labels.add(clean_label)
            variants.append({"label": label.strip(), "price": price})

        # Google Sheet can keep dedicated weight-price columns such as
        # 250g, 500g, 1kg (or 250g_price / price_250g).
        for raw_key, raw_value in row.items():
            key = (raw_key or "").strip().lower().replace(" ", "")
            match = re.fullmatch(r"(?:price_)?(\d+(?:\.\d+)?(?:g|kg|ml|l))(?:_price)?", key)
            if not match:
                continue
            try:
                variant_price = float(str(raw_value or "").replace(",", "").strip())
            except ValueError:
                continue
            add_variant(match.group(1), variant_price)

        base_size = _text(row, "size")
        base_price = _number(row, "price")
        if base_size and base_price > 0:
            add_variant(base_size, base_price)

        def variant_sort_key(item: dict[str, Any]):
            label = str(item.get("label", "")).lower().replace(" ", "")
            m = re.fullmatch(r"(\d+(?:\.\d+)?)(g|kg|ml|l)", label)
            if not m:
                return (2, label)
            value = float(m.group(1))
            unit = m.group(2)
            if unit == "kg": value *= 1000
            if unit == "l": value *= 1000
            family = 0 if unit in {"g", "kg"} else 1
            return (family, value)

        variants.sort(key=variant_sort_key)

        product = {
            "id": product_id,
            "name": _text(row, "name"),
            "category": _text(row, "category"),
            "parent_category": _text(row, "parent_category"),
            "subcategory": _text(row, "subcategory"),
            "collection": _text(row, "collection"),
            "gift_type": _text(row, "gift_type") or _text(row, "gift_types"),
            "region": _text(row, "region"),
            "district": _text(row, "district"),
            "origin": _text(row, "origin"),
            "tags": _text(row, "tags"),
            "size": _text(row, "size"),
            "price": _number(row, "price"),
            "250g": _number(row, "250g"),
            "500g": _number(row, "500g"),
            "1kg": _number(row, "1kg"),
            "rating": _number(row, "rating"),
            "reviews": _integer(row, "reviews"),
            "badge": _text(row, "badge"),
            "image": _text(row, "image"),
            "description": _text(row, "description"),
            "ingredients": _text(row, "ingredients"),
            "benefits": _text(row, "benefits"),
            "stock": _integer(row, "stock"),
            "active": True,
            "variants": variants,
        }
        products.append(product)

    return products


@app.get("/")
def root():
    return {
        "message": "Godavari Basket API is running",
        "product_source": "Google Sheets",
    }


@app.get("/api/products")
def products():
    return sheet_products()


@app.get("/api/products/{product_id}")
def product(product_id: int):
    for item in sheet_products():
        if item["id"] == product_id:
            return item
    raise HTTPException(404, "Product not found")
