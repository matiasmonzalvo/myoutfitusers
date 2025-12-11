import { createServerClient } from "@/lib/supabase/server";
import { NewContent } from "@/components/card-content/NewContent";
import Script from "next/script";

export default async function NewPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <NewContent isAuthenticated={!!user} />
      <Script
        src="https://hiderkai.vercel.app/widget.js"
        data-project-id="11ed4100-b4e2-46b1-a02e-0ac5b4a8c096"
        async
      />
    </>
  );
}
