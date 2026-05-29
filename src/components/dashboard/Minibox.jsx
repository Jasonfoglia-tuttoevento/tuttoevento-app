export default function MiniBox({ title, text }) {
  return (
    <div className="bg-white border border-black/5 rounded-[28px] p-7 shadow-sm">
      <h3 className="font-black text-xl">
        {title}
      </h3>

      <p className="text-black/50 mt-2">
        {text}
      </p>
    </div>
  );
}