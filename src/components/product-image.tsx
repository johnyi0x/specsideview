type Props = {
  src: string;
  alt: string;
  className?: string;
};

/** Fit product photos inside fixed cells without cropping (object-contain). */
export function ProductImage({ src, alt, className = "" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-contain object-center p-1.5 ${className}`}
    />
  );
}
