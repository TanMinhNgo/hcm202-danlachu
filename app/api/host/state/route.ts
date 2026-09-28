import { connectDB, Room } from "@/lib/db";
import { fail, hostCookie, normCode, notify, sessionHash } from "@/lib/server";

// Host chỉ bấm bắt đầu (LOBBY → PLAYING); sau đó người chơi tự đi qua từng câu, không cần kết thúc.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = normCode(body.code);
  if (body.action !== "start") return fail("Action không hợp lệ");

  await connectDB();
  const room = await Room.findOne({ code }).lean();
  if (!room) return fail("Không tìm thấy phòng", 404);
  if ((await sessionHash(hostCookie(code))) !== room.hostSessionHash) return fail("Chỉ host được điều khiển", 403);

  const updated = await Room.findOneAndUpdate({ _id: room._id, status: "LOBBY" }, { status: "PLAYING" });
  if (!updated) return fail("Game đã bắt đầu rồi", 409);
  await notify(`room-${code}`, "room.state.changed", { status: "PLAYING" });
  return Response.json({ ok: true, status: "PLAYING" });
}
