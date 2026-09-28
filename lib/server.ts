import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import Pusher from "pusher";
import { connectDB, Player, Room } from "./db";

// ---------- Phiên (cookie HttpOnly, DB chỉ lưu hash) ----------
export const hostCookie = (code: string) => `hcm_host_${code}`;
export const playerCookie = (code: string) => `hcm_player_${code}`;
export const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function newSession(name: string) {
  const token = randomBytes(24).toString("base64url");
  (await cookies()).set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return hash(token);
}

export async function sessionHash(name: string) {
  const token = (await cookies()).get(name)?.value;
  return token ? hash(token) : null;
}

// ---------- Realtime: Pusher chỉ để báo "state đổi, hãy refetch" ----------
const pusher =
  process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET
    ? new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER || "ap1",
        useTLS: true,
      })
    : null;

// Channel `room-CODE`: mọi người nghe. `host-CODE`: chỉ màn host (số người cược/trả lời) — tránh 30 client refetch mỗi lần có người cược.
// ponytail: channel public thay vì private — payload không chứa dữ liệu nhạy cảm (chỉ tên event); thêm /api/pusher/auth nếu cần private.
export async function notify(channel: `room-${string}` | `host-${string}`, event: string, data: object = {}) {
  if (!pusher) return; // không có Pusher → client tự polling
  try {
    await pusher.trigger(channel, event, data);
  } catch (e) {
    console.error("[pusher]", event, e); // mất 1 thông báo không mất dữ liệu: client vẫn polling dự phòng
  }
}

// ---------- Helpers cho Route Handler ----------
export const fail = (message: string, status = 400) => Response.json({ error: message }, { status });
export const normCode = (code: unknown) => (typeof code === "string" ? code.trim().toUpperCase() : "");

/** Phòng + người chơi hiện tại (theo cookie). Trả về Response lỗi nếu không hợp lệ. */
export async function loadPlayer(rawCode: unknown) {
  const code = normCode(rawCode);
  await connectDB();
  const room = await Room.findOne({ code }).lean();
  if (!room) return fail("Không tìm thấy phòng", 404);
  const h = await sessionHash(playerCookie(code));
  const player = h ? await Player.findOne({ roomId: room._id, sessionHash: h }).lean() : null;
  if (!player) return fail("Bạn chưa tham gia phòng này", 401);
  if (room.status !== "PLAYING") return fail("Host chưa bắt đầu game", 409);
  return { code, room, player };
}
