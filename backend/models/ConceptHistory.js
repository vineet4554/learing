import mongoose from "mongoose";

const conceptHistorySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    documentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Document",
      required: true
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        relativeChunks: {          
          type: [Number],          // ARRAY of numbers
          default: []
        }
      }
    ]
  },
  { timestamps: true }
);

// Prevent duplicate concept histories per document per user
conceptHistorySchema.index({ userId: 1, documentId: 1 }, { unique: true });

const ConceptHistory = mongoose.model("ConceptHistory", conceptHistorySchema);
export default ConceptHistory;
