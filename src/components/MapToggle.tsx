"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MapToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // di default: mappa visibile (quando showMap non è specificato)
  const isOn = (sp?.get("showMap") ?? "1") !== "0";

  const update = (nextOn: boolean) => {
    const params = new URLSearchParams(sp?.toString() || "");
    if (nextOn) params.delete("showMap"); // lascia default ON (pulito)
    else params.set("showMap", "0");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="inline-flex rounded-lg border overflow-hidden">
      <button
        type="button"
        onClick={() => update(true)}
        className={`px-3 py-2 text-sm ${isOn ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"}`}
        aria-pressed={isOn}
      >
        Map
      </button>
      <button
        type="button"
        onClick={() => update(false)}
        className={`px-3 py-2 text-sm ${!isOn ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"}`}
        aria-pressed={!isOn}
      >
        List
      </button>
    </div>
  );
}