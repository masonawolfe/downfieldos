export function Logo({ size = 36 }) {
  return (
    <img
      src="/logo.png"
      alt="DownfieldOS — Football, understood."
      width={size}
      height={size}
      style={{ objectFit: "contain", borderRadius: size > 32 ? 8 : 4 }}
    />
  );
}
