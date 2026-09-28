import { PlayerGameView } from "@/components/game/PlayerGameView";

export default async function RoomPage({ params }: PageProps<"/game/room/[roomCode]">) {
  const { roomCode } = await params;
  return <PlayerGameView code={roomCode.toUpperCase()} />;
}
