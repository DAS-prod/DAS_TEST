"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts, type Product } from "../lib/products";

export type CollectionKind = "combo" | "gift" | "art" | "90s" | "seasonal";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919618851406";

const META: Record<CollectionKind,{eyebrow:string;title:string;lead:string;note:string;className:string}> = {
  combo:{eyebrow:"Curated combinations",title:"Godavari Combos",lead:"A generous way to discover more — familiar favourites paired for families, celebrations and gifting.",note:"Build it your way",className:"collection-combo"},
  gift:{eyebrow:"Thoughtfully packed",title:"Gifting from Godavari",lead:"Premium regional gifting with warmth, meaning and a sense of place — for every kind of occasion.",note:"Made to be remembered",className:"collection-gift"},
  art:{eyebrow:"Crafted by skilled hands",title:"Art & Craft",lead:"Pieces shaped by regional traditions, natural materials and the makers who keep them alive.",note:"Stories made by hand",className:"collection-art"},
  "90s":{eyebrow:"A little taste of then",title:"90s Specials",lead:"Small treats, nostalgic flavours and childhood favourites that make the past feel close again.",note:"Open a box of memories",className:"collection-90s"},
  seasonal:{eyebrow:"Limited by the season",title:"Seasonal Godavari",lead:"Harvest-led favourites, festive specialties and regional products that arrive only at the right time.",note:"Worth waiting for",className:"collection-seasonal"},
};

function text(p:Product){ return [p.collection,p.gift_type,p.tags,p.category,p.parent_category,p.subcategory,p.name].filter(Boolean).join(" ").toLowerCase(); }
function matches(p:Product,type:CollectionKind){
  const t=text(p);
  if(type==="combo") return /combo|bundle/.test(t);
  if(type==="gift") return /gift|hamper/.test(t);
  if(type==="art") return /art|craft|coir|toy|handmade/.test(t);
  if(type==="90s") return /90s|90's|nostalgia|chocolate|childhood/.test(t);
  return /seasonal|season|festival|festive|limited edition|limited-edition/.test(t);
}

export default function PremiumCollectionPage({type}:{type:CollectionKind}){
  const meta=META[type];
  const [products,setProducts]=useState<Product[]>([]);
  const [message,setMessage]=useState("");
  useEffect(()=>{getProducts().then(setProducts).catch(()=>setProducts([]))},[]);
  const items=useMemo(()=>products.filter(p=>matches(p,type)),[products,type]);
  function onAdd(product:Product){
    try{
      const raw=localStorage.getItem("godavari-basket-cart"); const cart=raw?JSON.parse(raw):[];
      const existing=cart.find((i:any)=>i.id===product.id&&i.size===product.size);
      const updated=existing?cart.map((i:any)=>i.id===product.id&&i.size===product.size?{...i,quantity:(i.quantity||1)+1}:i):[...cart,{...product,quantity:1}];
      localStorage.setItem("godavari-basket-cart",JSON.stringify(updated)); window.dispatchEvent(new CustomEvent("cart-updated"));
      setMessage(`${product.name} added to your basket.`); window.setTimeout(()=>setMessage(""),2000);
    }catch{setMessage("Unable to add this item right now.")}
  }
  const help=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Godavari Basket, I need help with ${meta.title}.`)}`;
  return <main className={`premium-collection-page ${meta.className}`}>
    <header className="premium-collection-nav"><div className="container-wide"><Link href="/"><ArrowLeft size={17}/>Back to store</Link><Link href="/" className="serif brand">GODAVARI BASKET</Link><Link href="/checkout"><ShoppingBag size={17}/>Basket</Link></div></header>
    <section className="premium-collection-hero"><div className="collection-ambient one"/><div className="collection-ambient two"/><div className="container-wide premium-collection-hero-inner"><div><p className="collection-kicker"><Sparkles size={14}/>{meta.eyebrow}</p><h1>{meta.title}</h1><p className="collection-lead">{meta.lead}</p><div className="collection-hero-actions"><Link href="/custom-basket" className="collection-primary">Build your own basket<ArrowRight size={16}/></Link><a href={help} target="_blank" rel="noreferrer" className="collection-secondary"><MessageCircle size={16}/>Need help?</a></div></div><div className="collection-signature"><span>Godavari Basket</span><strong>{meta.note}</strong><small>From our roots to your home</small></div></div></section>
    <section className="container-wide premium-collection-products"><div className="premium-section-heading"><div><p className="eyebrow">From the collection</p><h2 className="serif">DISCOVER {meta.title.toUpperCase()}</h2></div><span>{items.length} products</span></div>
      {items.length?<div className="product-grid-v2">{items.map(p=><ProductCard key={p.id} product={p} onAdd={onAdd}/>)}</div>:<div className="collection-empty"><h3 className="serif">This collection is being prepared.</h3><p>Add matching products in the existing Google Sheet and they will appear here automatically.</p><Link href="/custom-basket">Build a custom basket instead <ArrowRight size={15}/></Link></div>}
    </section>
    {message&&<div className="collection-toast">{message}</div>}
  </main>;
}
