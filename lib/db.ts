import mongoose, { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { STARS, START_SCORE } from "./game/rules";

// Kết nối cache trên globalThis để hot reload / serverless không mở kết nối mới mỗi request.
const g = globalThis as unknown as { _mongoose?: Promise<typeof mongoose> };

export function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Thiếu biến môi trường MONGODB_URI");
  g._mongoose ??= mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "hcm202" }).catch((e) => {
    g._mongoose = undefined;
    throw e;
  });
  return g._mongoose;
}

const roomSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    status: { type: String, required: true, default: "LOBBY" },
    hostSessionHash: { type: String, required: true },
  },
  { timestamps: true },
);

const playerSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, required: true },
  nickname: { type: String, required: true },
  sessionHash: { type: String, required: true },
  score: { type: Number, default: START_SCORE },
  starsLeft: { type: Number, default: STARS },
  current: { type: Number, default: 1 }, // câu người này đang làm; > tổng số câu = đã xong
  timeMs: { type: Number, default: 0 }, // tổng thời gian trả lời, dùng xếp hạng khi bằng điểm
  finishedAt: { type: Date, default: null }, // lúc làm xong câu cuối → thứ tự hiện trong danh sách "đã hoàn thành"
  joinedAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
});
playerSchema.index({ roomId: 1, nickname: 1 }, { unique: true, collation: { locale: "vi", strength: 2 } });
playerSchema.index({ roomId: 1, score: -1 });

const playerRoundSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, required: true },
    playerId: { type: Schema.Types.ObjectId, required: true },
    questionNumber: { type: Number, required: true },
    bet: { type: Number, default: null },
    star: { type: Boolean, default: false },
    answer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    scoreChange: { type: Number, default: null },
    responseTimeMs: { type: Number, default: null },
    shownAt: { type: Date, required: true }, // câu hỏi hiện ngay khi chọn mức điểm → mốc 15s của riêng người này
  },
  { timestamps: true },
);
// Một bản ghi / người / câu → chặn chọn điểm & trả lời trùng.
playerRoundSchema.index({ roomId: 1, playerId: 1, questionNumber: 1 }, { unique: true });
playerRoundSchema.index({ roomId: 1, questionNumber: 1 });

// Hot reload chạy lại file này: đăng ký lại model để schema mới có hiệu lực (model cũ giữ schema cũ → thiếu field).
const getModel = <S extends Schema>(name: string, schema: S) => {
  if (models[name]) mongoose.deleteModel(name);
  return model(name, schema) as Model<InferSchemaType<S>>;
};

export const Room = getModel("Room", roomSchema);
export const Player = getModel("Player", playerSchema);
export const PlayerRound = getModel("PlayerRound", playerRoundSchema);
