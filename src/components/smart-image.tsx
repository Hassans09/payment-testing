import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper that also accepts uploaded photos stored as data/blob URLs
 * (demo mode), which the image optimiser can't process.
 */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const skipOptimizer = src.startsWith("data:") || src.startsWith("blob:");
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} unoptimized={props.unoptimized || skipOptimizer} />;
}
