import mongoose, { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { START_SCORE } from "./game/rules";

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
    currentQuestion: { type: Number, default: 0 },
    hostSessionHash: { type: String, required: true },
    bettingStartedAt: { type: Date, default: null },
    questionStartedAt: { type: Date, default: null },
    answerDeadlineAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const playerSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, required: true },
  nickname: { type: String, required: true },
  sessionHash: { type: String, required: true },
  score: { type: Number, default: START_SCORE },
  isSpectator: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  previousRank: { type: Number, default: null },
});
playerSchema.index({ roomId: 1, nickname: 1 }, { unique: true, collation: { locale: "vi", strength: 2 } });
playerSchema.index({ roomId: 1, score: -1 });

const playerRoundSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, required: true },
    playerId: { type: Schema.Types.ObjectId, required: true },
    questionNumber: { type: Number, required: true },
    bet: { type: Number, default: null },
    answer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    scoreChange: { type: Number, default: null },
    responseTimeMs: { type: Number, default: null },
    betSubmittedAt: { type: Date, default: null },
    answerSubmittedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
// Một bản ghi / người / câu → chặn cược & trả lời trùng.
playerRoundSchema.index({ roomId: 1, playerId: 1, questionNumber: 1 }, { unique: true });
playerRoundSchema.index({ roomId: 1, questionNumber: 1 });

const getModel = <S extends Schema>(name: string, schema: S) =>
  (models[name] as Model<InferSchemaType<S>>) || model(name, schema);

export const Room = getModel("Room", roomSchema);
export const Player = getModel("Player", playerSchema);
export const PlayerRound = getModel("PlayerRound", playerRoundSchema);
