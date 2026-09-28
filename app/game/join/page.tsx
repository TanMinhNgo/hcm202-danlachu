import { JoinForm } from "@/components/game/JoinForm";

export default async function JoinPage({ searchParams }: PageProps<"/game/join">) {
  const { code } = await searchParams;
  return <JoinForm initialCode={typeof code === "string" ? code : ""} />;
}
