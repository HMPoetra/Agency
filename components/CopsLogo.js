import Image from "next/image";

// Intrinsic dimensions of public/logo.png. `size` is the rendered height.
const W = 1024;
const H = 559;

export default function CopsLogo({ size = 32, alt = "COP-S" }) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={Math.round((size * W) / H)}
      height={size}
      className="flex-shrink-0"
    />
  );
}
