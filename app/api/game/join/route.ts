import { connectDB, Player, Room } from "@/lib/db";
import { fail, newSession, normCode, notify, playerCookie, sessionHash } from "@/lib/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = normCode(body.code);
  const nickname = typeof body.nickname === "string" ? body.nickname.trim().replace(/\s+/g, " ") : "";
  if (!code) return fail("Nhập mã phòng");
  if (nickname.length < 1 || nickname.length > 20) return fail("Nickname dài 1–20 ký tự");

  await connectDB();
  const room = await Room.findOne({ code }).lean();
  if (!room) return fail("Không tìm thấy phòng", 404);

  // Reconnect: cookie cũ còn khớp → trả lại đúng người chơi (điểm, vòng hiện tại lấy từ GET state).
  const existing = await sessionHash(playerCookie(code));
  if (existing && (await Player.exists({ roomId: room._id, sessionHash: existing }))) return Response.json({ code });

  const token = await newSession(playerCookie(code));
  try {
    // Vào muộn vẫn chơi được: mỗi người tự tính giờ riêng.
    await Player.create({ roomId: room._id, nickname, sessionHash: token });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return fail("Nickname đã có người dùng trong phòng", 409);
    throw e;
  }
  await notify(`room-${code}`, "player.joined");
  return Response.json({ code });
}
