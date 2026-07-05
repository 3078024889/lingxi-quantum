"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className="w-full border border-white/15 py-4 font-display text-sm uppercase tracking-widest2 text-bone-dim transition hover:border-lattice/40 hover:text-lattice"
    >
      离开场域（退出登录）
    </button>
  );
}
