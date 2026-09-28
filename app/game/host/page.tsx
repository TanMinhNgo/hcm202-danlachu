import { CreateRoom, HostDashboard } from "@/components/game/HostDashboard";

export default async function HostPage({ searchParams }: PageProps<"/game/host">) {
  const { code } = await searchParams;
  return typeof code === "string" ? <HostDashboard code={code.toUpperCase()} /> : <CreateRoom />;
}
