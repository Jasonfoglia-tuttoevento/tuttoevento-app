export default function Info({ label, value, orange }) {
  return (
    <div className="mb-4">
      <p className="text-black/35 text-sm font-bold">
        {label}
      </p>

      <p className={orange
        ? "text-[#ff5a00] font-black"
        : "text-black/65"
      }>
        {value || "Non inserito"}
      </p>
    </div>
  );
}