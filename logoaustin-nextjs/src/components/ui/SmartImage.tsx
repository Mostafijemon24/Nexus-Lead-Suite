import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src" | "alt"> & { src: string; alt: string; width: number; height: number };

/** next/image with the custom AVIF-variant loader; `sizes` defaults to a sensible content width. */
export default function SmartImage({ sizes = "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 600px", alt, ...props }: Props) {
  return <Image sizes={sizes} alt={alt} {...props} />;
}
