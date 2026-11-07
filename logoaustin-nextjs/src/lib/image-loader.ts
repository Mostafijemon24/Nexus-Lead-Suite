"use client";

import type { ImageLoaderProps } from "next/image";
import widths from "@/content/image-widths.json";

const WIDTHS = widths as Record<string, number[]>;

/**
 * Maps a logical image src ("/images/pages/name.avif") plus a requested width to the
 * pre-generated variant ("/images/pages/name-w960.avif"). Variants are produced by
 * scripts/convert-elementor.mjs; the available widths per image live in image-widths.json.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  if (!src.startsWith("/images/")) return src; // logos, svg, external
  const available = WIDTHS[src];
  if (!available || available.length === 0) return src;
  const pick = available.find((w) => w >= width) ?? available[available.length - 1];
  return src.replace(/\.avif$/, `-w${pick}.avif`);
}
