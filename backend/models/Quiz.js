import mongoose from "mongoose";

/**
 * Validator: minimum 2 options
 */
const arrayLimit = (val) => Array.isArray(val) && val.length >= 2;

const quizSchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    questions: [
      {
        questionText: {
          type: String,
          required: true
        },

        options: {
          type: [String],
          required: true,
          validate: [arrayLimit, "{PATH} must have at least two options"]
        },

        correctAnswer: {
          type: String,
          required: true,
          validate: {
            validator: function (val) {
              return this.options.includes(val);
            },
            message: "Correct answer must be one of the options"
          }
        },

        explanation: {
          type: String,
          default: ""
        },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium"
        }
      }
    ],

    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true
        },

        selectedOption: {
          type: String,
          required: true
        },

        isCorrect: {
          type: Boolean,
          required: true
        },

        answeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    score: {
      type: Number,
      default: 0
    },

    totalQuestions: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// 🔹 Auto-set totalQuestions
quizSchema.pre("save", function (next) {
  this.totalQuestions = this.questions.length;
  next();
});

// 🔹 Index for faster queries
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
