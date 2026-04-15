"use client";

// Central icon component — wraps @iconify/react as a "use client" boundary
// so icons can be safely imported into server components (Next.js App Router)
import { Icon } from "@iconify/react";

export function Dog({ className })           { return <Icon icon="mdi:dog" className={className} />; }
export function Cat({ className })           { return <Icon icon="mdi:cat" className={className} />; }
export function PawPrint({ className })      { return <Icon icon="mdi:paw" className={className} />; }
export function Truck({ className })         { return <Icon icon="mdi:truck-outline" className={className} />; }
export function Heart({ className })         { return <Icon icon="mdi:heart-outline" className={className} />; }
export function RotateCcw({ className })     { return <Icon icon="mdi:rotate-left" className={className} />; }
export function ShoppingCart({ className })  { return <Icon icon="mdi:cart-outline" className={className} />; }
export function PartyPopper({ className })   { return <Icon icon="mdi:party-popper" className={className} />; }
export function Search({ className })        { return <Icon icon="mdi:magnify" className={className} />; }
export function MessageCircle({ className }) { return <Icon icon="mdi:comment-outline" className={className} />; }
export function Package({ className })       { return <Icon icon="mdi:package-variant-outline" className={className} />; }
export function Lightning({ className })     { return <Icon icon="mdi:lightning-bolt" className={className} />; }
export function Check({ className })         { return <Icon icon="mdi:check" className={className} />; }
export function Star({ className })          { return <Icon icon="mdi:star" className={className} />; }
export function Camera({ className })        { return <Icon icon="mdi:camera-outline" className={className} />; }
