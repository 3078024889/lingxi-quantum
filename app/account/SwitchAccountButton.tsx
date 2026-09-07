"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";

export default function SwitchAccountButton() {
  const router = useRouter();
  return <button onClick={async () => {
    await createClient().auth.signOut();
    router.push("/account?switch=1");
    router.refresh();
  }} className="w-full border border-lattice/35 py-4 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:bg-lattice/10">
    <Bi zh="切换账户" en="Switch account" />
  </button>;
}
