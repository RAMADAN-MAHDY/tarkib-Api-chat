import mongoose from "mongoose";

const userRequestSchema = new mongoose.Schema(
  {
     sessionId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
    //   required: true,
    },
    phone: {
      type: String,
    //   required: false,
    },
    location: {
      type: String,
    //   required: true,
    },
    service: {
      type: String,
    //   required: true,
    },
    date: {
      type: String,
    //   required: true,
    },
    time: {
      type: String,
    //   required: true,
    },
    chatHistory: {
      type: Array, // [{ role: "user", content: "..." }, { role: "assistant", content: "..." }]
      required: true,
    },
    agreement: {
      type: Boolean,
      default: false, // إذا كان العميل قد وافق على الحجز أم لا
    },
    
  },
  {
    timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
  }
);

export default mongoose.model("UserRequest", userRequestSchema);
