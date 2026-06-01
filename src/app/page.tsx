import { redirect } from "next/navigation";

import { ConfigurationErrorPage } from "@/components/system/configuration-error";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default function HomePage() {
  if (!isSupabaseConfigured()) {
    return <ConfigurationErrorPage />;
  }

  redirect("/dashboard");
}
