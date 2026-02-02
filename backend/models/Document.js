import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },

    fileName: {
      type: String,
      required: [true, "Filename is required"],
      trim: true
    },

    filePath: {
      type: String,
      required: [true, "File path is required"]
    },

    fileSize: {
      type: Number,
      required: [true, "File size is required"]
    },

    extractedText: {
      type: String,
      default: ""
    },

    content: {
      type: String,
      default: ""
    },

    chunks: [
      {
        content: { type: String, required: true },
        pageNumber: { type: Number, required: true },
        chunkIndex: { type: Number, required: true }
      }
    ],

    lastAccessed: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["processing", "ready", "failed", "error"],
      default: "processing"
    }
  },
  { timestamps: true }
);

// Index for user document listing
documentSchema.index({ userId: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);
export default Document;
