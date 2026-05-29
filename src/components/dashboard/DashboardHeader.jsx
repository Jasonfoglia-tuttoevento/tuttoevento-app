export default function DashboardHeader({ user, onLogout }) {
  return (
    <header className="dashboard-card-mobile bg-white border border-black/5 rounded-[28px] p-5 md:p-6 mb-8 shadow-sm flex flex-col md:flex-row justify-between gap-5 overflow-hidden">
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#111] text-white flex items-center justify-center font-black">
            TE
          </div>

          <div>
            <p className="text-xs uppercase tracking-[3px] text-black/35 font-black">
              TuttoEvento
            </p>

            <p className="text-sm font-black text-black">
              Dashboard operativa
            </p>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-[-0.04em] leading-[0.95] break-words">
          Ciao, {user.name}
        </h1>

        <p className="text-black/50 mt-3 text-sm md:text-base">
          Area riservata · {user.role}
        </p>
      </div>

      <button
        onClick={onLogout}
        className="bg-[#111] text-white px-5 md:px-6 py-3 md:py-4 rounded-2xl font-black h-fit w-full md:w-auto"
      >
        Logout
      </button>
    </header>
  );
}