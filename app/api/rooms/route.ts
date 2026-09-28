import { randomInt } from "node:crypto";
import { connectDB, Room } from "@/lib/db";
import { fail, hostCookie, newSession } from "@/lib/server";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ O/0, I/1 dễ nhầm

// Host tạo phòng → nhận mã phòng + cookie host HttpOnly.
export async function POST() {
  await connectDB();
  for (let i = 0; i < 5; i++) {
    const code = Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    if (await Room.exists({ code })) continue;
    const hostSessionHash = await newSession(hostCookie(code));
    await Room.create({ code, hostSessionHash });
    return Response.json({ code });
  }
  return fail("Không tạo được mã phòng, thử lại", 500);
}
