export default function StatCard({ title, value }) {
  return (
    <div className="dashboard-card-mobile bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
      <p className="text-black/45 font-black text-sm md:text-base">
        {title}
      </p>

      <p className="text-3xl md:text-4xl font-black text-[#ff5a00] mt-4 break-words">
        {value}
      </p>
    </div>
  );
}