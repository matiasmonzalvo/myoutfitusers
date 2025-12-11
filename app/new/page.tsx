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
        data-project-id="bfd1d04c-76a9-4d70-b605-a8d31ad9699e"
        async
      />
    </>
  );
}
