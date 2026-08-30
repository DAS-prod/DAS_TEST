import csv
from datetime import datetime, timezone
import io
import os
from typing import Any

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
from supabase import Client, create_client

load_dotenv()

app = FastAPI(title="Godavari Basket API", version="1.0.0")

# Environment configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://godavari-basket.vercel.app")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-me")
GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Initialize Supabase client
supabase: Client | None = (
    create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    else None
)

# Parse allowed origins (supports comma-separated list and strips trailing slashes)
env_origins = [url.strip().rstrip("/") for url in FRONTEND_URL.split(",") if url.strip()]
allowed_origins = list(
    set(
        [
            "http://localhost:3000",
            "https://godavari-basket.vercel.app",
            *env_origins,
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response Models ---

class OrderItemIn(BaseModel):
    product_id: int
    name: str
    size: str = ""
    image: str = ""
    seller_id: str
    seller_name: str = ""
    seller_price: float = Field(ge=0)
    customer_price: float = Field(ge=0)
    quantity: int = Field(ge=1)


class CustomerIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=20)
    address: str = Field(min_length=5, max_length=500)
    pincode: str = Field(min_length=4, max_length=10)


class CreateOrderIn(BaseModel):
    customer: CustomerIn
    items: list[OrderItemIn] = Field(min_length=1)
    shipping_fee: float = Field(default=0, ge=0)


# --- Helper Dependencies ---

def require_admin(x_admin_token: str | None = Header(default=None)):
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(401, "Invalid admin token")


def sheet_products() -> list[dict[str, Any]]:
    if not GOOGLE_SHEET_URL:
        raise HTTPException(503, "GOOGLE_SHEET_URL is not configured")
    r = requests.get(GOOGLE_SHEET_URL, timeout=15)
    r.raise_for_status()
    rows = csv.DictReader(io.StringIO(r.text))
    out = []
    for row in rows:
        try:
            pid = int(row.get("id", ""))
        except ValueError:
            continue

        def num(k: str, d: float = 0.0) -> float:
            try:
                return float((row.get(k) or "").replace(",", "").strip())
            except ValueError:
                return d

        def integer(k: str, d: int = 0) -> int:
            try:
                return int(num(k, float(d)))
            except ValueError:
                return d

        p = {
            "id": pid,
            "name": row.get("name", "").strip(),
            "category": row.get("category", "").strip(),
            "parent_category": row.get("parent_category", "").strip(),
            "subcategory": row.get("subcategory", "").strip(),
            # Optional structured discovery metadata. Existing sheets remain compatible.
            "region": row.get("region", "").strip(),
            "district": row.get("district", "").strip(),
            "origin": row.get("origin", "").strip(),
            "tags": row.get("tags", "").strip(),
            "gift_type": row.get("gift_type", "").strip(),
            "collection": row.get("collection", "").strip(),
            "size": row.get("size", "").strip(),
            "price": num("price"),
            "seller_price": num("seller_price", num("price")),
            "rating": num("rating"),
            "reviews": integer("reviews"),
            "badge": row.get("badge", "").strip(),
            "image": row.get("image", "").strip(),
            "description": row.get("description", "").strip(),
            "ingredients": row.get("ingredients", "").strip(),
            "benefits": row.get("benefits", "").strip(),
            "seller_id": row.get("seller_id", "").strip(),
            "seller_name": row.get("seller_name", "").strip(),
            "stock": integer("stock"),
            "active": row.get("active", "true").strip().lower()
            not in {"false", "0", "no"},
        }
        if p["active"]:
            out.append(p)
    return out


# --- API Routes ---

@app.get("/")
def root():
    return {"message": "Godavari Basket API is running"}


@app.get("/api/products")
def products():
    return sheet_products()


@app.get("/api/products/{product_id}")
def product(product_id: int):
    for p in sheet_products():
        if p["id"] == product_id:
            return p
    raise HTTPException(404, "Product not found")


@app.post("/api/orders")
def create_order(payload: CreateOrderIn):
    if not supabase:
        raise HTTPException(503, "Supabase is not configured")
    
    subtotal = round(sum(i.customer_price * i.quantity for i in payload.items), 2)
    total = round(subtotal + payload.shipping_fee, 2)
    
    try:
        created = (
            supabase.table("orders")
            .insert(
                {
                    "customer_name": payload.customer.name,
                    "customer_phone": payload.customer.phone,
                    "customer_address": payload.customer.address,
                    "customer_pincode": payload.customer.pincode,
                    "subtotal": subtotal,
                    "shipping_fee": payload.shipping_fee,
                    "total": total,
                    "status": "received",
                }
            )
            .execute()
        )
        if not created.data:
            raise HTTPException(500, "Could not create order")
        
        order = created.data[0]
        oid = order["id"]
        
        rows = []
        for i in payload.items:
            rows.append(
                {
                    "order_id": oid,
                    "product_id": i.product_id,
                    "seller_id": i.seller_id,
                    "seller_name_snapshot": i.seller_name,
                    "product_name_snapshot": i.name,
                    "size_snapshot": i.size,
                    "image_snapshot": i.image,
                    "seller_price": i.seller_price,
                    "customer_price": i.customer_price,
                    "quantity": i.quantity,
                    "line_total": round(i.customer_price * i.quantity, 2),
                    "seller_commission": round(i.seller_price * i.quantity * 0.10, 2),
                    "seller_settlement": round(i.seller_price * i.quantity * 0.90, 2),
                }
            )
        supabase.table("order_items").insert(rows).execute()
        
        for sid in sorted({i.seller_id for i in payload.items if i.seller_id}):
            subtotal_seller = round(
                sum(
                    i.customer_price * i.quantity
                    for i in payload.items
                    if i.seller_id == sid
                ),
                2,
            )
            supabase.table("seller_orders").insert(
                {
                    "order_id": oid,
                    "seller_id": sid,
                    "subtotal": subtotal_seller,
                    "status": "pending",
                }
            ).execute()
            
        return {
            "id": oid,
            "order_number": order["order_number"],
            "subtotal": subtotal,
            "shipping_fee": payload.shipping_fee,
            "total": total,
            "status": "received",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Order creation failed: {e}")


@app.get("/api/admin/orders", dependencies=[Depends(require_admin)])
def admin_orders():
    if not supabase:
        raise HTTPException(503, "Supabase is not configured")
    orders = (
        supabase.table("orders")
        .select("*,order_items(*),seller_orders(*)")
        .order("created_at", desc=True)
        .execute()
        .data
    )
    sellers_list = supabase.table("sellers").select("*").execute().data
    seller_map = {s["id"]: s for s in sellers_list}
    for o in orders:
        for so in o.get("seller_orders", []):
            so["seller"] = seller_map.get(so["seller_id"])
    return orders


@app.patch(
    "/api/admin/orders/{order_id}/status",
    dependencies=[Depends(require_admin)],
)
def update_status(order_id: str, status: str):
    allowed = {
        "received",
        "confirmed",
        "sent_to_sellers",
        "completed",
        "cancelled",
    }
    if status not in allowed:
        raise HTTPException(400, "Invalid status")
    if not supabase:
        raise HTTPException(503, "Supabase is not configured")
    r = (
        supabase.table("orders")
        .update(
            {
                "status": status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("id", order_id)
        .execute()
    )
    if not r.data:
        raise HTTPException(404, "Order not found")
    return r.data[0]


@app.get("/api/admin/sellers", dependencies=[Depends(require_admin)])
def get_sellers():
    if not supabase:
        raise HTTPException(503, "Supabase is not configured")
    return (
        supabase.table("sellers")
        .select("*")
        .eq("active", True)
        .order("business_name")
        .execute()
        .data
    )
