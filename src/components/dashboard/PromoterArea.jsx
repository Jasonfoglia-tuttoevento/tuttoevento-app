"use client";

export default function PromoterArea() {
  return (
    <section
      id="promoter-area"
      className="bg-white border border-black/5 rounded-[28px] p-7 shadow-sm scroll-mt-8"
    >
      <div className="mb-6">
        <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
          Promoter
        </p>

        <h2 className="text-3xl font-black tracking-[-0.04em]">
          Area Promoter
        </h2>

        <p className="text-black/50 mt-2">
          Qui potrai gestire eventi, promozione, marketplace e attività promoter.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-5">
          <p className="text-sm text-black/45 font-bold">
            Eventi
          </p>

          <p className="text-2xl font-black mt-2">
            In arrivo
          </p>
        </div>

        <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-5">
          <p className="text-sm text-black/45 font-bold">
            Marketplace
          </p>

          <p className="text-2xl font-black mt-2">
            In arrivo
          </p>
        </div>

        <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-5">
          <p className="text-sm text-black/45 font-bold">
            Promozione
          </p>

          <p className="text-2xl font-black mt-2">
            In arrivo
          </p>
        </div>
      </div>
    </section>
  );
}