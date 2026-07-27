import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ProfileHeader } from "./profile-header";
import { ProfileTabs } from "./profile-tabs";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; subtab?: string }>;
}

export default async function ProfileEditorPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = "principal", subtab } = await searchParams;
  const supabase = await createSupabaseServer();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) {
    redirect("/dashboard/profiles");
  }

  return (
    <>
      <ProfileHeader profile={profile} />
      <ProfileTabs profileId={id} activeTab={tab} activeSubtab={subtab} />
    </>
  );
}
