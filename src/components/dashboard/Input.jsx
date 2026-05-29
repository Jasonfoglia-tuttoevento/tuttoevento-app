export default function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#f7f7f7] border border-black/10 rounded-2xl p-4 outline-none focus:border-[#ff5a00]"
    />
  );
}