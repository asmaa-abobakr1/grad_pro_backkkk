/**
 * VOLT• Full Seed Script
 * Inserts: 7 categories, 60+ products (heavy Apple focus), 12 users, 60 orders
 * Run: npm run seed  (from /backend)
 */
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
import dns      from 'dns';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}
dotenv.config();

import User     from '../models/User.js';
import Product  from '../models/Product.js';
import Category from '../models/Category.js';
import Order    from '../models/Order.js';

const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const price = (n) => parseFloat(n.toFixed(2));

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name:'Phones',      slug:'phones',      icon:'Smartphone', color:'#2563eb', desc:'Flagship smartphones from every major brand.' },
  { name:'Laptops',     slug:'laptops',     icon:'Laptop',     color:'#4f46e5', desc:'Ultrabooks, workstations and MacBooks.' },
  { name:'Audio',       slug:'audio',       icon:'Headphones', color:'#0ea5e9', desc:'Noise-canceling headphones, earbuds and speakers.' },
  { name:'Tablets',     slug:'tablets',     icon:'Tablet',     color:'#10b981', desc:'iPads, pro tablets and 2-in-1 devices.' },
  { name:'Gaming',      slug:'gaming',      icon:'Gamepad2',   color:'#ec4899', desc:'High-performance gaming laptops and accessories.' },
  { name:'Wearables',   slug:'wearables',   icon:'Watch',      color:'#f59e0b', desc:'Smartwatches, fitness trackers and health bands.' },
  { name:'Accessories', slug:'accessories', icon:'Sparkles',   color:'#6366f1', desc:'Mice, keyboards, hubs, cables and chargers.' },
];

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const PRODUCTS = [

  // ══════════════════════════════════════════════════════════════════════════
  //  APPLE — PHONES  (11 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name:'iPhone 16 Pro Max', brand:'Apple', category:'Phones',
    price:1299, originalPrice:null, stock:60, sku:'APL-IP16PM',
    status:'Published', rating:4.9, reviews:1840, tags:['New'],
    image:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&h=500&fit=crop',
    description:'iPhone 16 Pro Max with A18 Pro chip, titanium design, 5× telephoto camera and Action button.',
    specs:{ Processor:'A18 Pro', RAM:'8GB', Storage:'256GB', Display:'6.9" Super Retina XDR ProMotion', Camera:'48MP + 48MP Ultra Wide + 12MP 5× Telephoto', Battery:'33 hr video', Weight:'227 g', OS:'iOS 18' },
    highlights:['A18 Pro chip','Camera Control button','5× optical zoom'],
    pros:['Best iPhone performance','Titanium build','Camera Control'],
    cons:['Very expensive','Large size'],
    soldCount:420,
  },
  {
    name:'iPhone 16 Pro', brand:'Apple', category:'Phones',
    price:1099, originalPrice:null, stock:55, sku:'APL-IP16P',
    status:'Published', rating:4.8, reviews:1320, tags:['New'],
    image:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&h=500&fit=crop',
    description:'iPhone 16 Pro with A18 Pro, 6.3" display and Camera Control.',
    specs:{ Processor:'A18 Pro', RAM:'8GB', Storage:'128GB', Display:'6.3" Super Retina XDR ProMotion', Camera:'48MP + 48MP + 12MP 5×', Battery:'27 hr video', Weight:'199 g', OS:'iOS 18' },
    highlights:['Camera Control','A18 Pro','6.3" display'],
    pros:['Compact flagship','Brilliant camera','USB-C'],
    cons:['No USB 4 on base'],
    soldCount:310,
  },
  {
    name:'iPhone 15 Pro Max', brand:'Apple', category:'Phones',
    price:999, originalPrice:1199, stock:48, sku:'APL-IP15PM',
    status:'Published', rating:4.9, reviews:2040, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&h=500&fit=crop',
    description:'iPhone 15 Pro Max — titanium body, A17 Pro chip and 5× optical zoom.',
    specs:{ Processor:'A17 Pro', RAM:'8GB', Storage:'256GB', Display:'6.7" Super Retina XDR 120Hz', Camera:'48MP + 12MP + 12MP 5×', Battery:'29 hr video', Weight:'221 g', OS:'iOS 17' },
    highlights:['A17 Pro','Titanium','5× zoom'],
    pros:['World-class camera','Titanium build','USB-C'],
    cons:['Expensive','No charger included'],
    soldCount:380,
  },
  {
    name:'iPhone 15 Pro', brand:'Apple', category:'Phones',
    price:849, originalPrice:999, stock:42, sku:'APL-IP15P',
    status:'Published', rating:4.8, reviews:1560, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&h=500&fit=crop',
    description:'iPhone 15 Pro — A17 Pro, Action button and USB-C.',
    specs:{ Processor:'A17 Pro', RAM:'8GB', Storage:'128GB', Display:'6.1" Super Retina XDR 120Hz', Camera:'48MP + 12MP + 12MP 3×', Battery:'23 hr video', Weight:'187 g', OS:'iOS 17' },
    highlights:['Action button','A17 Pro','USB-C'],
    pros:['Compact Pro','Action button','Fast USB-C'],
    cons:['Only 3× zoom'],
    soldCount:290,
  },
  {
    name:'iPhone 15', brand:'Apple', category:'Phones',
    price:699, originalPrice:799, stock:70, sku:'APL-IP15',
    status:'Published', rating:4.7, reviews:1890, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=700&h=500&fit=crop',
    description:'iPhone 15 — Dynamic Island, 48MP main camera and USB-C.',
    specs:{ Processor:'A16 Bionic', RAM:'6GB', Storage:'128GB', Display:'6.1" Super Retina XDR', Camera:'48MP + 12MP', Battery:'20 hr video', Weight:'171 g', OS:'iOS 17' },
    highlights:['Dynamic Island','48MP camera','USB-C'],
    pros:['Dynamic Island on standard model','Great camera','USB-C'],
    cons:['60Hz display'],
    soldCount:510,
  },
  {
    name:'iPhone 15 Plus', brand:'Apple', category:'Phones',
    price:799, originalPrice:899, stock:38, sku:'APL-IP15PL',
    status:'Published', rating:4.6, reviews:720, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=700&h=500&fit=crop',
    description:'iPhone 15 Plus — 6.7" display, 48MP camera and all-day battery.',
    specs:{ Processor:'A16 Bionic', RAM:'6GB', Storage:'128GB', Display:'6.7" Super Retina XDR', Camera:'48MP + 12MP', Battery:'26 hr video', Weight:'201 g', OS:'iOS 17' },
    highlights:['6.7" big screen','26 hr battery','48MP'],
    pros:['Huge battery life','Big display'],
    cons:['60Hz display','Heavy'],
    soldCount:220,
  },
  {
    name:'iPhone 14 Pro Max', brand:'Apple', category:'Phones',
    price:799, originalPrice:1099, stock:30, sku:'APL-IP14PM',
    status:'Published', rating:4.7, reviews:2300, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=700&h=500&fit=crop',
    description:'iPhone 14 Pro Max — A16 Bionic, Dynamic Island and 48MP camera.',
    specs:{ Processor:'A16 Bionic', RAM:'6GB', Storage:'128GB', Display:'6.7" Super Retina XDR ProMotion', Camera:'48MP + 12MP + 12MP 3×', Battery:'29 hr video', Weight:'240 g', OS:'iOS 17' },
    highlights:['Dynamic Island','48MP camera','Always-On Display'],
    pros:['Still excellent camera','ProMotion 120Hz'],
    cons:['USB-A Lightning','Heavy'],
    soldCount:340,
  },
  {
    name:'iPhone 14', brand:'Apple', category:'Phones',
    price:599, originalPrice:799, stock:65, sku:'APL-IP14',
    status:'Published', rating:4.5, reviews:3100, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=700&h=500&fit=crop',
    description:'iPhone 14 — Crash Detection, Emergency SOS via satellite and A15 Bionic.',
    specs:{ Processor:'A15 Bionic', RAM:'6GB', Storage:'128GB', Display:'6.1" Super Retina XDR', Camera:'12MP + 12MP', Battery:'20 hr video', Weight:'172 g', OS:'iOS 17' },
    highlights:['Crash Detection','Emergency SOS','A15 Bionic'],
    pros:['Reliable performance','Compact','Good value'],
    cons:['No Dynamic Island','USB-A'],
    soldCount:570,
  },
  {
    name:'iPhone SE (3rd Gen)', brand:'Apple', category:'Phones',
    price:429, originalPrice:499, stock:80, sku:'APL-IPSE3',
    status:'Published', rating:4.3, reviews:980, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&h=500&fit=crop',
    description:'iPhone SE with A15 Bionic chip, 5G and Touch ID — the most affordable iPhone.',
    specs:{ Processor:'A15 Bionic', RAM:'4GB', Storage:'64GB', Display:'4.7" Retina HD', Camera:'12MP', Battery:'15 hr video', Weight:'144 g', OS:'iOS 17' },
    highlights:['Most affordable iPhone','A15 Bionic','5G'],
    pros:['Great chip for the price','Touch ID','Compact'],
    cons:['Old design','Small display','1080p camera only'],
    soldCount:430,
  },
  {
    name:'iPhone 13', brand:'Apple', category:'Phones',
    price:499, originalPrice:699, stock:45, sku:'APL-IP13',
    status:'Published', rating:4.6, reviews:4200, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&h=500&fit=crop',
    description:'iPhone 13 — A15 Bionic, improved dual camera system and all-day battery.',
    specs:{ Processor:'A15 Bionic', RAM:'4GB', Storage:'128GB', Display:'6.1" Super Retina XDR', Camera:'12MP + 12MP Ultra Wide', Battery:'19 hr video', Weight:'174 g', OS:'iOS 17' },
    highlights:['A15 Bionic','Cinematic mode','Long battery'],
    pros:['Excellent chip','Great cameras','Sturdy build'],
    cons:['60Hz display','Lightning port'],
    soldCount:620,
  },
  {
    name:'iPhone 13 Mini', brand:'Apple', category:'Phones',
    price:399, originalPrice:599, stock:35, sku:'APL-IP13MINI',
    status:'Published', rating:4.4, reviews:1800, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&h=500&fit=crop',
    description:'iPhone 13 Mini — same A15 power in the smallest iPhone ever.',
    specs:{ Processor:'A15 Bionic', RAM:'4GB', Storage:'128GB', Display:'5.4" Super Retina XDR', Camera:'12MP + 12MP', Battery:'17 hr video', Weight:'141 g', OS:'iOS 17' },
    highlights:['Smallest iPhone','A15 Bionic','5G'],
    pros:['One-handed use','Powerful chip','5G'],
    cons:['Smaller battery','Niche form factor'],
    soldCount:260,
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  APPLE — LAPTOPS  (7 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name:'MacBook Pro 16" M3 Max', brand:'Apple', category:'Laptops',
    price:2499, originalPrice:2799, stock:24, sku:'APL-MBP16-M3MAX',
    status:'Published', rating:4.9, reviews:540, tags:['Best Seller'],
    image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&h=500&fit=crop',
    description:'MacBook Pro 16" with M3 Max — 40-core GPU, 36GB unified memory, 22-hour battery.',
    specs:{ Processor:'Apple M3 Max', RAM:'36GB Unified', Storage:'1TB SSD', Display:'16.2" Liquid Retina XDR', Battery:'22 hr', Weight:'2.14 kg', OS:'macOS Sonoma', Graphics:'40-core GPU' },
    highlights:['M3 Max chip','36GB unified memory','22-hour battery'],
    pros:['Exceptional performance','Stunning display','All-day battery'],
    cons:['Very expensive','Heavy'],
    soldCount:160,
  },
  {
    name:'MacBook Pro 14" M3 Pro', brand:'Apple', category:'Laptops',
    price:1999, originalPrice:null, stock:30, sku:'APL-MBP14-M3PRO',
    status:'Published', rating:4.8, reviews:390, tags:['New'],
    image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&h=500&fit=crop',
    description:'MacBook Pro 14" M3 Pro — best portable powerhouse with ProMotion display.',
    specs:{ Processor:'Apple M3 Pro', RAM:'18GB Unified', Storage:'512GB SSD', Display:'14.2" Liquid Retina XDR', Battery:'18 hr', Weight:'1.61 kg', OS:'macOS Sonoma', Graphics:'18-core GPU' },
    highlights:['M3 Pro chip','ProMotion display','MagSafe 3'],
    pros:['Compact powerhouse','Brilliant display','Fast charging'],
    cons:['Expensive','Only 2 Thunderbolt ports'],
    soldCount:130,
  },
  {
    name:'MacBook Pro 16" M3 Pro', brand:'Apple', category:'Laptops',
    price:2099, originalPrice:null, stock:20, sku:'APL-MBP16-M3PRO',
    status:'Published', rating:4.8, reviews:280, tags:['New'],
    image:'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&h=500&fit=crop',
    description:'MacBook Pro 16" M3 Pro — large canvas, 22-hour battery and 18-core GPU.',
    specs:{ Processor:'Apple M3 Pro', RAM:'18GB Unified', Storage:'512GB SSD', Display:'16.2" Liquid Retina XDR', Battery:'22 hr', Weight:'2.14 kg', OS:'macOS Sonoma', Graphics:'18-core GPU' },
    highlights:['Large Liquid Retina XDR','22-hour battery','HDMI + SD card'],
    pros:['More ports than 14"','Excellent display','Long battery'],
    cons:['Heavy','Expensive'],
    soldCount:90,
  },
  {
    name:'MacBook Air 15" M3', brand:'Apple', category:'Laptops',
    price:1299, originalPrice:null, stock:42, sku:'APL-MBA15-M3',
    status:'Published', rating:4.8, reviews:890, tags:['Best Seller','New'],
    image:'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&h=500&fit=crop',
    description:'MacBook Air 15" with M3 — the world\'s best thin-and-light laptop.',
    specs:{ Processor:'Apple M3', RAM:'16GB Unified', Storage:'512GB SSD', Display:'15.3" Liquid Retina', Battery:'18 hr', Weight:'1.51 kg', OS:'macOS Sonoma', Graphics:'10-core GPU' },
    highlights:['M3 chip','Fanless','15" Liquid Retina'],
    pros:['Silent fanless design','All-day battery','Large display'],
    cons:['No ports variety','Slower than Pro'],
    soldCount:340,
  },
  {
    name:'MacBook Air 13" M3', brand:'Apple', category:'Laptops',
    price:1099, originalPrice:null, stock:55, sku:'APL-MBA13-M3',
    status:'Published', rating:4.8, reviews:1240, tags:['Best Seller','New'],
    image:'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&h=500&fit=crop',
    description:'MacBook Air 13" M3 — the ultimate everyday laptop, now with M3.',
    specs:{ Processor:'Apple M3', RAM:'8GB Unified', Storage:'256GB SSD', Display:'13.6" Liquid Retina', Battery:'18 hr', Weight:'1.24 kg', OS:'macOS Sonoma', Graphics:'8-core GPU' },
    highlights:['M3 chip','Ultra-light 1.24 kg','18-hour battery'],
    pros:['Best value Mac laptop','Portable','Silent'],
    cons:['Base RAM is 8GB','No fan'],
    soldCount:500,
  },
  {
    name:'MacBook Air 13" M2', brand:'Apple', category:'Laptops',
    price:899, originalPrice:1099, stock:38, sku:'APL-MBA13-M2',
    status:'Published', rating:4.7, reviews:2100, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&h=500&fit=crop',
    description:'MacBook Air 13" M2 — redesigned thin body with Midnight color and MagSafe.',
    specs:{ Processor:'Apple M2', RAM:'8GB Unified', Storage:'256GB SSD', Display:'13.6" Liquid Retina', Battery:'18 hr', Weight:'1.24 kg', OS:'macOS Sonoma', Graphics:'8-core GPU' },
    highlights:['Redesigned thin body','MagSafe charging','M2 chip'],
    pros:['Elegant design','MagSafe back','Great value now'],
    cons:['Single charge port when not using MagSafe'],
    soldCount:640,
  },
  {
    name:'MacBook Pro 14" M3', brand:'Apple', category:'Laptops',
    price:1599, originalPrice:null, stock:27, sku:'APL-MBP14-M3',
    status:'Published', rating:4.7, reviews:450, tags:['New'],
    image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&h=500&fit=crop',
    description:'MacBook Pro 14" with M3 — the entry Pro with stunning Liquid Retina XDR.',
    specs:{ Processor:'Apple M3', RAM:'8GB Unified', Storage:'512GB SSD', Display:'14.2" Liquid Retina XDR', Battery:'22 hr', Weight:'1.55 kg', OS:'macOS Sonoma', Graphics:'10-core GPU' },
    highlights:['Liquid Retina XDR','Hardware ray tracing','MagSafe 3'],
    pros:['Portable Pro laptop','Long battery','Bright XDR display'],
    cons:['8GB RAM is limiting','Pricey for base M3'],
    soldCount:210,
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  APPLE — AUDIO  (5 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name:'AirPods Pro 2 (USB-C)', brand:'Apple', category:'Audio',
    price:249, originalPrice:null, stock:130, sku:'APL-APP2-USBC',
    status:'Published', rating:4.8, reviews:4100, tags:['New','Best Seller'],
    image:'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700&h=500&fit=crop',
    description:'AirPods Pro 2 with USB-C case, H2 chip, Adaptive Audio and Lossless audio.',
    specs:{ Chip:'Apple H2', ANC:'Adaptive Audio + Transparency', Battery:'6 hr (30 hr with case)', Weight:'5.3 g', Connectivity:'Bluetooth 5.3', Water:'IPX4', Charging:'USB-C / MagSafe' },
    highlights:['H2 chip','Adaptive Audio','USB-C case'],
    pros:['Best ANC in earbuds','Seamless Apple integration','USB-C'],
    cons:['iOS-only full features','Ear tips fit varies'],
    soldCount:780,
  },
  {
    name:'AirPods Pro 2 (Lightning)', brand:'Apple', category:'Audio',
    price:199, originalPrice:249, stock:60, sku:'APL-APP2-LGTN',
    status:'Published', rating:4.8, reviews:5600, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700&h=500&fit=crop',
    description:'AirPods Pro 2nd Gen — H2 chip, Adaptive Audio, now on sale.',
    specs:{ Chip:'Apple H2', ANC:'Adaptive Audio', Battery:'6 hr (30 hr with case)', Weight:'5.3 g', Connectivity:'Bluetooth 5.3', Water:'IPX4', Charging:'Lightning / MagSafe' },
    highlights:['H2 chip','Adaptive Audio','MagSafe case'],
    pros:['Great ANC','Natural Transparency mode'],
    cons:['Lightning case','iOS features only'],
    soldCount:920,
  },
  {
    name:'AirPods 3rd Gen', brand:'Apple', category:'Audio',
    price:169, originalPrice:199, stock:95, sku:'APL-AP3',
    status:'Published', rating:4.5, reviews:3200, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700&h=500&fit=crop',
    description:'AirPods 3rd Gen — spatial audio, MagSafe case and 30-hour total battery.',
    specs:{ Chip:'Apple H1', Battery:'6 hr (30 hr with case)', Water:'IPX4', Connectivity:'Bluetooth 5.0', Charging:'Lightning / MagSafe', SpatialAudio:'Yes' },
    highlights:['Spatial Audio','MagSafe case','Skin detect'],
    pros:['Spatial Audio','Good call quality','MagSafe'],
    cons:['No ANC','One-size fit only'],
    soldCount:640,
  },
  {
    name:'AirPods Max', brand:'Apple', category:'Audio',
    price:479, originalPrice:549, stock:40, sku:'APL-APMAX',
    status:'Published', rating:4.6, reviews:1800, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=700&h=500&fit=crop',
    description:'AirPods Max — premium over-ear headphones with Apple H1 and stellar ANC.',
    specs:{ Chip:'Apple H1 (dual)', ANC:'Active Noise Cancellation', Battery:'20 hr', Weight:'385 g', Connectivity:'Bluetooth 5.0', Charging:'Lightning', 'Ear Cups':'Mesh textile' },
    highlights:['Computational audio','20-hour ANC battery','Premium aluminium build'],
    pros:['Excellent sound quality','Best ANC on headphones','Spatial Audio'],
    cons:['Heavy','Expensive','Lightning charging'],
    soldCount:230,
  },
  {
    name:'AirPods 2nd Gen', brand:'Apple', category:'Audio',
    price:99, originalPrice:129, stock:180, sku:'APL-AP2',
    status:'Published', rating:4.3, reviews:8900, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700&h=500&fit=crop',
    description:'AirPods 2nd Gen — the best-selling earbuds, now at an unbeatable price.',
    specs:{ Chip:'Apple H1', Battery:'5 hr (24 hr with case)', Connectivity:'Bluetooth 5.0', Charging:'Lightning', 'Hey Siri':'Hands-free' },
    highlights:['Hey Siri hands-free','H1 chip','Effortless setup'],
    pros:['Very affordable','Easy Apple pairing','Lightweight'],
    cons:['No ANC','No water resistance','Old design'],
    soldCount:1400,
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  APPLE — TABLETS  (5 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name:'iPad Pro 13" M4', brand:'Apple', category:'Tablets',
    price:1299, originalPrice:null, stock:32, sku:'APL-IPDP13-M4',
    status:'Published', rating:4.9, reviews:620, tags:['New'],
    image:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&h=500&fit=crop',
    description:'iPad Pro 13" M4 — thinnest Apple product ever with tandem OLED display.',
    specs:{ Processor:'Apple M4', RAM:'16GB', Storage:'256GB', Display:'13" Ultra Retina XDR OLED', Battery:'10 hr', Weight:'579 g', OS:'iPadOS 17', Camera:'12MP Wide + 12MP Ultra Wide' },
    highlights:['Tandem OLED display','M4 chip','Thinnest Apple product'],
    pros:['Stunning OLED','M4 performance','Ultra-thin'],
    cons:['Very expensive','Keyboard sold separately'],
    soldCount:180,
  },
  {
    name:'iPad Pro 11" M4', brand:'Apple', category:'Tablets',
    price:999, originalPrice:null, stock:40, sku:'APL-IPDP11-M4',
    status:'Published', rating:4.8, reviews:480, tags:['New'],
    image:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&h=500&fit=crop',
    description:'iPad Pro 11" M4 — OLED display and M4 performance in a compact form.',
    specs:{ Processor:'Apple M4', RAM:'8GB', Storage:'256GB', Display:'11" Ultra Retina XDR OLED', Battery:'10 hr', Weight:'444 g', OS:'iPadOS 17', Camera:'12MP + 12MP' },
    highlights:['OLED iPad Pro display','M4 chip','Compact Pro'],
    pros:['Compact and powerful','OLED display','Face ID landscape'],
    cons:['Keyboard Folio expensive','OLED only on Pro'],
    soldCount:140,
  },
  {
    name:'iPad Air 13" M2', brand:'Apple', category:'Tablets',
    price:1099, originalPrice:null, stock:36, sku:'APL-IPAIR13-M2',
    status:'Published', rating:4.7, reviews:360, tags:['New'],
    image:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=700&h=500&fit=crop',
    description:'iPad Air 13" with M2 chip — first 13" Air with landscape front camera.',
    specs:{ Processor:'Apple M2', RAM:'8GB', Storage:'128GB', Display:'13" Liquid Retina', Battery:'10 hr', Weight:'617 g', OS:'iPadOS 17', Camera:'12MP Ultra Wide landscape' },
    highlights:['First 13" iPad Air','Landscape front camera','M2 chip'],
    pros:['Large screen','Landscape camera','Apple Pencil Pro support'],
    cons:['No OLED','Heavier than Pro'],
    soldCount:120,
  },
  {
    name:'iPad Air 11" M2', brand:'Apple', category:'Tablets',
    price:749, originalPrice:null, stock:54, sku:'APL-IPAIR11-M2',
    status:'Published', rating:4.7, reviews:720, tags:['New','Best Seller'],
    image:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=700&h=500&fit=crop',
    description:'iPad Air 11" M2 — the best all-rounder iPad for most users.',
    specs:{ Processor:'Apple M2', RAM:'8GB', Storage:'128GB', Display:'11" Liquid Retina', Battery:'10 hr', Weight:'462 g', OS:'iPadOS 17', Camera:'12MP landscape' },
    highlights:['M2 chip','Landscape front camera','USB-C'],
    pros:['Best value iPad','Landscape camera','Apple Pencil Pro'],
    cons:['No OLED','Less bright than Pro'],
    soldCount:360,
  },
  {
    name:'iPad 10th Gen', brand:'Apple', category:'Tablets',
    price:449, originalPrice:499, stock:75, sku:'APL-IPAD10',
    status:'Published', rating:4.5, reviews:1800, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&h=500&fit=crop',
    description:'iPad 10th Gen — redesigned with USB-C, A14 Bionic and landscape camera.',
    specs:{ Processor:'Apple A14 Bionic', RAM:'4GB', Storage:'64GB', Display:'10.9" Liquid Retina', Battery:'10 hr', Weight:'477 g', OS:'iPadOS 17', Camera:'12MP Ultra Wide landscape' },
    highlights:['USB-C','New design','Landscape camera'],
    pros:['Most affordable new design iPad','USB-C','Landscape camera'],
    cons:['A14 chip','Keyboard adapter needed'],
    soldCount:560,
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  APPLE — WEARABLES  (4 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name:'Apple Watch Ultra 2', brand:'Apple', category:'Wearables',
    price:799, originalPrice:null, stock:35, sku:'APL-AWU2',
    status:'Published', rating:4.8, reviews:1020, tags:['New','Best Seller'],
    image:'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=700&h=500&fit=crop',
    description:'Apple Watch Ultra 2 — 72-hour battery, titanium case and precision dual-frequency GPS.',
    specs:{ Chip:'Apple S9 SiP', Display:'49mm Always-On LTPO Retina', Battery:'72 hr', Weight:'61.4 g', Water:'WR100 EN13319', Connectivity:'BT 5.3, Wi-Fi 4, LTE, UWB' },
    highlights:['72-hour battery','Titanium case','Precision GPS'],
    pros:['Rugged build','Longest Apple Watch battery','Bright display'],
    cons:['Very expensive','Large for small wrists','iOS only'],
    soldCount:210,
  },
  {
    name:'Apple Watch Series 9 45mm', brand:'Apple', category:'Wearables',
    price:429, originalPrice:null, stock:70, sku:'APL-AWS9-45',
    status:'Published', rating:4.7, reviews:1900, tags:['New','Best Seller'],
    image:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=700&h=500&fit=crop',
    description:'Apple Watch Series 9 45mm — S9 chip, double-tap gesture and carbon neutral option.',
    specs:{ Chip:'Apple S9 SiP', Display:'45mm Always-On LTPO Retina', Battery:'18 hr', Weight:'38.7 g', Water:'WR50', Connectivity:'BT 5.3, Wi-Fi 4, LTE' },
    highlights:['Double-tap gesture','S9 chip','Carbon neutral option'],
    pros:['Best smartwatch iOS','Accurate sensors','Great ecosystem'],
    cons:['18-hr battery','iOS only'],
    soldCount:450,
  },
  {
    name:'Apple Watch Series 9 41mm', brand:'Apple', category:'Wearables',
    price:399, originalPrice:null, stock:65, sku:'APL-AWS9-41',
    status:'Published', rating:4.7, reviews:1400, tags:['New'],
    image:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=700&h=500&fit=crop',
    description:'Apple Watch Series 9 41mm — compact size with all S9 features.',
    specs:{ Chip:'Apple S9 SiP', Display:'41mm Always-On LTPO Retina', Battery:'18 hr', Weight:'31.9 g', Water:'WR50', Connectivity:'BT 5.3, Wi-Fi 4, LTE' },
    highlights:['Compact size','Double-tap','Precision Finding'],
    pros:['Lighter and smaller','Same S9 features','Better for small wrists'],
    cons:['Smaller display'],
    soldCount:380,
  },
  {
    name:'Apple Watch SE 2 40mm', brand:'Apple', category:'Wearables',
    price:249, originalPrice:279, stock:88, sku:'APL-AWSE2-40',
    status:'Published', rating:4.5, reviews:2400, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=700&h=500&fit=crop',
    description:'Apple Watch SE 2 — the most affordable Apple Watch with crash detection.',
    specs:{ Chip:'Apple S8 SiP', Display:'40mm Retina LTPO', Battery:'18 hr', Weight:'26.4 g', Water:'WR50', Connectivity:'BT 5.3, Wi-Fi 4' },
    highlights:['Crash Detection','Car accident detection','Best value Apple Watch'],
    pros:['Most affordable','Crash Detection','Lightweight'],
    cons:['No Always-On','No ECG','S8 chip'],
    soldCount:680,
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  APPLE — ACCESSORIES  (4 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name:'Apple Pencil Pro', brand:'Apple', category:'Accessories',
    price:129, originalPrice:null, stock:110, sku:'APL-PENCIL-PRO',
    status:'Published', rating:4.8, reviews:940, tags:['New','Best Seller'],
    image:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&h=500&fit=crop',
    description:'Apple Pencil Pro — squeeze gesture, find my support and hover detection.',
    specs:{ Compatibility:'iPad Pro M4, iPad Air M2', Charging:'MagSafe', Features:'Squeeze gesture, Find My, Hover, Double-tap', Weight:'20.7 g' },
    highlights:['Squeeze gesture','Find My','Hover preview'],
    pros:['New gestures','MagSafe attach + charge','Find My'],
    cons:['Only compatible with newest iPads'],
    soldCount:340,
  },
  {
    name:'Magic Keyboard with Touch ID', brand:'Apple', category:'Accessories',
    price:129, originalPrice:null, stock:95, sku:'APL-MKBTID',
    status:'Published', rating:4.6, reviews:2100, tags:['Best Seller'],
    image:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&h=500&fit=crop',
    description:'Apple Magic Keyboard with Touch ID — wireless, rechargeable and scissor keys.',
    specs:{ Connectivity:'Bluetooth, USB-C', Battery:'1 month', Layout:'Full-size with numeric pad option', TouchID:'Built-in', Compatibility:'Mac, iPad' },
    highlights:['Touch ID fingerprint','USB-C','Scissor mechanism'],
    pros:['Touch ID','Great key feel','Rechargeable'],
    cons:['Expensive for a keyboard','Mac-first features'],
    soldCount:420,
  },
  {
    name:'MagSafe Charger 2m', brand:'Apple', category:'Accessories',
    price:39, originalPrice:null, stock:300, sku:'APL-MAGSAFE-2M',
    status:'Published', rating:4.5, reviews:5600, tags:['Best Seller'],
    image:'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=700&h=500&fit=crop',
    description:'Apple MagSafe Charger 2m — 15W fast charging for all MagSafe iPhones.',
    specs:{ Power:'15W max', Compatibility:'iPhone 12 and later with MagSafe case', Cable:'2m braided', Connector:'USB-C' },
    highlights:['15W MagSafe','2m cable','Snaps magnetically'],
    pros:['Fast wireless charging','Magnetic alignment','Long cable'],
    cons:['USB-C power adapter sold separately'],
    soldCount:2100,
  },
  {
    name:'Apple 35W Dual USB-C Charger', brand:'Apple', category:'Accessories',
    price:59, originalPrice:null, stock:220, sku:'APL-35W-DUAL',
    status:'Published', rating:4.7, reviews:3400, tags:['Best Seller'],
    image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=500&fit=crop',
    description:'Apple 35W Dual USB-C Compact Power Adapter — charge two devices simultaneously.',
    specs:{ Power:'35W total (up to 27W per port)', Ports:'2× USB-C', Compatibility:'iPhone, iPad, Mac, AirPods', Size:'Compact foldable' },
    highlights:['Charge 2 devices','35W total','Compact foldable'],
    pros:['Charge iPhone + MacBook together','Compact','Official Apple'],
    cons:['No USB-A port'],
    soldCount:1600,
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  OTHER BRANDS — fill catalog  (12 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name:'Samsung Galaxy S24 Ultra', brand:'Samsung', category:'Phones',
    price:1199, originalPrice:1419, stock:38, sku:'SAM-S24U',
    status:'Published', rating:4.7, reviews:1020, tags:['New','Sale'],
    image:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700&h=500&fit=crop',
    description:'Galaxy S24 Ultra — Galaxy AI, 200MP camera, built-in S Pen.',
    specs:{ Processor:'Snapdragon 8 Gen 3', RAM:'12GB', Storage:'512GB', Display:'6.8" QHD+ AMOLED 120Hz', Camera:'200MP + 50MP + 10MP + 10MP', Battery:'5000mAh', Weight:'232 g', OS:'Android 14' },
    highlights:['Galaxy AI','200MP camera','S Pen'],
    pros:['Best Android camera','S Pen','AI features'],
    cons:['Bulky','Expensive'],
    soldCount:190,
  },
  {
    name:'Sony WH-1000XM5', brand:'Sony', category:'Audio',
    price:299, originalPrice:399, stock:90, sku:'SNY-WH5',
    status:'Published', rating:4.7, reviews:3200, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=700&h=500&fit=crop',
    description:'Sony WH-1000XM5 — industry-leading ANC with 30-hour battery.',
    specs:{ Driver:'30mm', ANC:'Industry-leading', Battery:'30 hr', Weight:'250 g', Codec:'LDAC, AAC, SBC', Connectivity:'BT 5.2' },
    highlights:['Best-in-class ANC','30-hour battery','Multi-point'],
    pros:['Supreme ANC','Comfortable','Excellent sound'],
    cons:['No aptX','Heavy'],
    soldCount:480,
  },
  {
    name:'Dell XPS 15', brand:'Dell', category:'Laptops',
    price:1699, originalPrice:1999, stock:15, sku:'DEL-XPS15',
    status:'Published', rating:4.6, reviews:680, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&h=500&fit=crop',
    description:'Dell XPS 15 with 3.5K OLED and RTX 4060 for creators.',
    specs:{ Processor:'Intel i9-13900H', RAM:'32GB DDR5', Storage:'1TB NVMe', Display:'15.6" 3.5K OLED', Battery:'13 hr', Weight:'1.86 kg', OS:'Windows 11 Pro', Graphics:'RTX 4060' },
    highlights:['3.5K OLED','RTX 4060','Intel i9'],
    pros:['Gorgeous OLED','Powerful GPU'],
    cons:['Gets hot','Webcam below display'],
    soldCount:110,
  },
  {
    name:'Samsung Galaxy Tab S9+', brand:'Samsung', category:'Tablets',
    price:899, originalPrice:999, stock:31, sku:'SAM-GTS9P',
    status:'Published', rating:4.5, reviews:560, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1632882765546-1ee75f53becb?w=700&h=500&fit=crop',
    description:'Galaxy Tab S9+ with IP68 and S Pen included.',
    specs:{ Processor:'Snapdragon 8 Gen 2', RAM:'12GB', Storage:'256GB', Display:'12.4" Dynamic AMOLED 120Hz', Battery:'10090mAh', Weight:'586 g', OS:'Android 13', Camera:'13MP + 8MP' },
    highlights:['IP68','S Pen included','12.4" display'],
    pros:['Water resistant','S Pen','Bright display'],
    cons:['No 3.5mm jack','Samsung bloatware'],
    soldCount:95,
  },
  {
    name:'ASUS ROG Zephyrus G14', brand:'ASUS', category:'Gaming',
    price:1499, originalPrice:1799, stock:8, sku:'ASU-ROGG14',
    status:'Published', rating:4.6, reviews:430, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=700&h=500&fit=crop',
    description:'ROG Zephyrus G14 — AMD Ryzen 9, RTX 4060, ultra-portable gaming.',
    specs:{ Processor:'AMD Ryzen 9 7940HS', RAM:'16GB DDR5', Storage:'1TB SSD', Display:'14" QHD+ 165Hz', Battery:'10 hr', Weight:'1.72 kg', OS:'Windows 11', Graphics:'RTX 4060' },
    highlights:['165Hz display','AMD Ryzen 9','Ultra-portable'],
    pros:['Portable gaming','Great performance'],
    cons:['No webcam','Fan noise'],
    soldCount:72,
  },
  {
    name:'Logitech MX Master 3S', brand:'Logitech', category:'Accessories',
    price:99, originalPrice:null, stock:160, sku:'LOG-MXM3S',
    status:'Published', rating:4.8, reviews:5200, tags:['Best Seller'],
    image:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&h=500&fit=crop',
    description:'MX Master 3S — MagSpeed scroll, 8K DPI and quiet clicks.',
    specs:{ Sensor:'8000 DPI Darkfield', Battery:'70 days', Weight:'141 g', Buttons:'7 programmable', Connectivity:'BT, USB-C, Logi Bolt' },
    highlights:['MagSpeed scroll','Quiet clicks','70-day battery'],
    pros:['Ergonomic','Multi-device','Premium scroll'],
    cons:['Right-hand only','Heavy'],
    soldCount:670,
  },
  {
    name:'Samsung T7 SSD 2TB', brand:'Samsung', category:'Accessories',
    price:149, originalPrice:199, stock:145, sku:'SAM-T7-2TB',
    status:'Published', rating:4.7, reviews:4200, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=700&h=500&fit=crop',
    description:'Samsung T7 Portable SSD 2TB — 1050 MB/s in a palm-sized case.',
    specs:{ Capacity:'2TB', Interface:'USB 3.2 Gen 2', 'Read Speed':'1050 MB/s', 'Write Speed':'1000 MB/s', Weight:'58 g', Encryption:'AES 256-bit' },
    highlights:['1050 MB/s read','AES 256-bit','Shock resistant'],
    pros:['Very fast','Compact','Encrypted'],
    cons:['Gets warm'],
    soldCount:940,
  },
  {
    name:'Anker 100W USB-C Hub', brand:'Anker', category:'Accessories',
    price:79, originalPrice:99, stock:210, sku:'ANK-HUB100',
    status:'Published', rating:4.6, reviews:3800, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=500&fit=crop',
    description:'Anker 12-in-1 USB-C hub with 100W PD, 4K HDMI and SD card.',
    specs:{ Ports:'12-in-1', 'Power Delivery':'100W', HDMI:'4K@60Hz', Weight:'105 g' },
    highlights:['100W PD','4K@60Hz','12-in-1'],
    pros:['Tons of ports','Fast charging','Compact'],
    cons:['Gets warm'],
    soldCount:560,
  },
  {
    name:'Garmin Forerunner 965', brand:'Garmin', category:'Wearables',
    price:599, originalPrice:null, stock:28, sku:'GAR-FR965',
    status:'Published', rating:4.8, reviews:560, tags:[],
    image:'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&h=500&fit=crop',
    description:'Garmin Forerunner 965 — 31-day battery, AMOLED display and multi-band GPS.',
    specs:{ Display:'1.4" AMOLED', Battery:'31 days / 31 hr GPS', Weight:'53 g', Water:'10 ATM', GPS:'Multi-band GNSS' },
    highlights:['31-day battery','AMOLED','Training Load Focus'],
    pros:['Best running watch','Long battery'],
    cons:['Expensive','Complex'],
    soldCount:98,
  },
  {
    name:'Google Pixel 8 Pro', brand:'Google', category:'Phones',
    price:899, originalPrice:999, stock:42, sku:'GOO-PX8P',
    status:'Published', rating:4.5, reviews:780, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&h=500&fit=crop',
    description:'Google Pixel 8 Pro — Tensor G3 AI, best Android camera, 7 years updates.',
    specs:{ Processor:'Google Tensor G3', RAM:'12GB', Storage:'128GB', Display:'6.7" LTPO OLED 120Hz', Camera:'50MP + 48MP + 48MP', Battery:'5050mAh', Weight:'213 g', OS:'Android 14' },
    highlights:['Tensor G3 AI','7 years updates','Temperature sensor'],
    pros:['Best Android camera','Clean Android','AI features'],
    cons:['Average battery','Tensor efficiency'],
    soldCount:130,
  },
  {
    name:'Razer Blade 15', brand:'Razer', category:'Gaming',
    price:2299, originalPrice:2699, stock:6, sku:'RZR-BL15',
    status:'Published', rating:4.5, reviews:310, tags:['Sale'],
    image:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&h=500&fit=crop',
    description:'Razer Blade 15 — Intel i9, RTX 4070 and 240Hz QHD display.',
    specs:{ Processor:'Intel Core i9-13900H', RAM:'16GB DDR5', Storage:'1TB SSD', Display:'15.6" QHD 240Hz', Battery:'6 hr', Weight:'2.01 kg', OS:'Windows 11', Graphics:'RTX 4070' },
    highlights:['RTX 4070','240Hz QHD','Per-key RGB'],
    pros:['Premium gaming','Sleek design'],
    cons:['Short battery','Gets hot'],
    soldCount:48,
  },
  {
    name:'Bose QuietComfort 45', brand:'Bose', category:'Audio',
    price:229, originalPrice:329, stock:70, sku:'BSE-QC45',
    status:'Published', rating:4.6, reviews:2300, tags:['Sale','Best Seller'],
    image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop',
    description:'Bose QuietComfort 45 — legendary comfort and ANC with 24-hour battery.',
    specs:{ ANC:'Bose QuietComfort', Battery:'24 hr', Weight:'238 g', Codec:'AAC, SBC', Connectivity:'BT 5.1' },
    highlights:['Legendary comfort','24-hour battery','Foldable'],
    pros:['Incredibly comfortable','Great ANC'],
    cons:['No LDAC','Average call quality'],
    soldCount:310,
  },
];

// ─── USERS ────────────────────────────────────────────────────────────────────
const USERS_DATA = [
  { name:'Maya Chen',       email:'admin@volt.com',       password:'Admin1234', role:'admin' },
  { name:'Omar Ruiz',       email:'omar@volt.com',        password:'Admin1234', role:'admin' },
  { name:'John Cooper',     email:'john@example.com',     password:'User12345', role:'customer' },
  { name:'Sarah Johnson',   email:'sarah@example.com',    password:'User12345', role:'customer' },
  { name:'Mike Chen',       email:'mike@example.com',     password:'User12345', role:'customer' },
  { name:'Emily Davis',     email:'emily@example.com',    password:'User12345', role:'customer' },
  { name:'Alex Martinez',   email:'alex@example.com',     password:'User12345', role:'customer' },
  { name:'Jessica Kim',     email:'jessica@example.com',  password:'User12345', role:'customer' },
  { name:'Ryan Thompson',   email:'ryan@example.com',     password:'User12345', role:'customer' },
  { name:'Nina Park',       email:'nina@example.com',     password:'User12345', role:'customer' },
  { name:'David Wilson',    email:'david@example.com',    password:'User12345', role:'customer' },
  { name:'Lisa Anderson',   email:'lisa@example.com',     password:'User12345', role:'customer' },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB Atlas\n');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Categories
    await Category.insertMany(CATEGORIES);
    console.log(`✅ Seeded ${CATEGORIES.length} categories`);

    // Products
    const insertedProducts = await Product.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${insertedProducts.length} products (${PRODUCTS.filter(p=>p.brand==='Apple').length} Apple)`);

    // Users
    const insertedUsers = [];
    for (const u of USERS_DATA) {
      const user = await User.create(u);
      insertedUsers.push(user);
    }
    console.log(`✅ Seeded ${insertedUsers.length} users`);

    // Orders (60)
    const customers = insertedUsers.filter(u => u.role === 'customer');
    const statuses  = ['Pending','Processing','Shipped','Completed','Completed','Completed','Cancelled'];
    const promoList = ['', '', '', 'VOLT10', 'TECH20', ''];

    let orderCount = 0;
    for (let i = 0; i < 60; i++) {
      const customer  = pick(customers);
      const promo     = pick(promoList);
      const promoDisc = promo === 'VOLT10' ? 10 : promo === 'TECH20' ? 20 : 0;
      const numItems  = rand(1, 4);
      const chosen    = [...insertedProducts].sort(() => Math.random() - 0.5).slice(0, numItems);

      const items = chosen.map(p => ({
        product: p._id, productName: p.name, productImage: p.image,
        price: p.price, quantity: rand(1, 3),
      }));

      const subtotal = price(items.reduce((s, it) => s + it.price * it.quantity, 0));
      const discount = price((subtotal * promoDisc) / 100);
      const tax      = price((subtotal - discount) * 0.08);
      const shipping = subtotal > 500 ? 0 : 15;
      const total    = price(subtotal - discount + tax + shipping);
      const daysAgo  = rand(0, 180);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await Order.create({
        customer: customer._id, customerName: customer.name, customerEmail: customer.email,
        address: `${rand(100,9999)} ${pick(['Main St','Oak Ave','Park Blvd','Elm Dr'])} , ${pick(['New York','Los Angeles','Chicago','Houston'])}, ${pick(['NY','CA','IL','TX'])} ${rand(10000,99999)}`,
        items, status: pick(statuses), promoCode: promo,
        subtotal, discount, tax, shipping, total, createdAt, updatedAt: createdAt,
      });
      orderCount++;
    }
    console.log(`✅ Seeded ${orderCount} orders\n`);

    const appleCount = insertedProducts.filter(p => p.brand === 'Apple').length;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉  Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Products: ${insertedProducts.length} total  (${appleCount} Apple)`);
    console.log(`  Admin:    admin@volt.com    /  Admin1234`);
    console.log(`  Customer: john@example.com  /  User12345`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
