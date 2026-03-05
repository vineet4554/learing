import Quiz from "../models/Quiz.js";
import Document from "../models/Document.js";
import mongoose from "mongoose";

// ================= GET ALL QUIZZES BY DOCUMENT =================
export const getQuizzes = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // Validate documentId
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format"
      });
    }

    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: documentId
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET SINGLE QUIZ BY ID =================
export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate quiz ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID format"
      });
    }

    const quiz = await Quiz.findOne({
      _id: id,
      userId: req.user._id
    }).populate("documentId", "title fileName");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// ================= SUBMIT QUIZ =================
export const submitQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of {questionIndex, selectedOption}

    // Validate quiz ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID format"
      });
    }

    // Validate answers array
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers array is required"
      });
    }

    const quiz = await Quiz.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Allow resubmission: overwrite previous answers/score
    if (quiz.userAnswers && quiz.userAnswers.length > 0) {
      quiz.userAnswers = [];
      quiz.score = 0;
    }

    let correctCount = 0;
    const userAnswers = [];

    // Process each answer
    answers.forEach(answer => {
      const { questionIndex, selectedOption } = answer;

      // Validate questionIndex
      if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
        return;
      }

      const question = quiz.questions[questionIndex];
      const isCorrect = question.correctAnswer === selectedOption;

      if (isCorrect) {
        correctCount++;
      }

      userAnswers.push({
        questionIndex,
        selectedOption,
        isCorrect,
        answeredAt: new Date()
      });
    });

    // Update quiz with answers and score
    quiz.userAnswers = userAnswers;
    quiz.score = correctCount;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score: correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: ((correctCount / quiz.totalQuestions) * 100).toFixed(2),
        userAnswers: userAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET QUIZ RESULTS =================
export const getQuizResults = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate quiz ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID format"
      });
    }

    const quiz = await Quiz.findOne({
      _id: id,
      userId: req.user._id
    }).populate("documentId", "title fileName");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check if quiz has been submitted
    if (!quiz.userAnswers || quiz.userAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz not yet submitted"
      });
    }

    // Build detailed results
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(
        answer => answer.questionIndex === index
      );

      return {
        questionIndex: index,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer ? userAnswer.selectedOption : null,
        isCorrect: userAnswer ? userAnswer.isCorrect : false,
        explanation: question.explanation,
        difficulty: question.difficulty
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        title: quiz.title,
        score: quiz.score,
        totalQuestions: quiz.totalQuestions,
        percentage: ((quiz.score / quiz.totalQuestions) * 100).toFixed(2),
        results: detailedResults,
        submittedAt: quiz.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// ================= DELETE QUIZ =================
export const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate quiz ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID format"
      });
    }

    const quiz = await Quiz.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
