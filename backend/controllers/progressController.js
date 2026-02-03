import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // counts
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzesCount = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    // flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach(set => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter(c => c.isStarred).length;
    });

    // quiz statistics
    const quizzes = await Quiz.find({ userId });

    let totalQuizQuestions = 0;
    let completedQuizzes = 0;
    let totalScore = 0;
    let totalPossibleScore = 0;

    quizzes.forEach(quiz => {
      totalQuizQuestions += quiz.totalQuestions;

      if (quiz.userAnswers && quiz.userAnswers.length > 0) {
        completedQuizzes++;
        totalScore += quiz.score || 0;
        totalPossibleScore += quiz.totalQuestions;
      }
    });

    const averageQuizScore =
      totalPossibleScore > 0
        ? ((totalScore / totalPossibleScore) * 100).toFixed(2)
        : 0;

    // recent activity
    const recentDocuments = await Document.find({ userId })
      .select('title fileName uploadDate status')
      .sort({ uploadDate: -1 })
      .limit(5);

    const recentFlashcards = await Flashcard.find({ userId })
      .select('documentId createdAt')
      .populate('documentId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentQuizzes = await Quiz.find({ userId })
      .select('title score totalQuestions createdAt')
      .populate('documentId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // study streak (simplified)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivity = {
      flashcardsReviewed: 0,
      quizzesCompleted: 0,
      documentsUploaded: 0,
    };

    flashcardSets.forEach(set => {
      set.cards.forEach(card => {
        if (card.lastReviewed && new Date(card.lastReviewed) >= today) {
          todayActivity.flashcardsReviewed++;
        }
      });
    });

    quizzes.forEach(quiz => {
      if (
        quiz.updatedAt &&
        new Date(quiz.updatedAt) >= today &&
        quiz.userAnswers &&
        quiz.userAnswers.length > 0
      ) {
        todayActivity.quizzesCompleted++;
      }
    });

    todayActivity.documentsUploaded = await Document.countDocuments({
      userId,
      uploadDate: { $gte: today },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFlashcardActivity = await Flashcard.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const recentQuizActivity = await Quiz.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const studyStreak = recentFlashcardActivity + recentQuizActivity;

    const performanceMetrics = {
      flashcardReviewRate:
        totalFlashcards > 0
          ? ((reviewedFlashcards / totalFlashcards) * 100).toFixed(2)
          : 0,
      quizCompletionRate:
        totalQuizzes > 0
          ? ((completedQuizzes / totalQuizzes) * 100).toFixed(2)
          : 0,
      averageQuizScore,
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          totalQuizzes,
          completedQuizzes: completedQuizzesCount,
        },
        flashcardStats: {
          total: totalFlashcards,
          reviewed: reviewedFlashcards,
          starred: starredFlashcards,
          reviewRate: performanceMetrics.flashcardReviewRate + '%',
        },
        quizStats: {
          total: totalQuizzes,
          completed: completedQuizzes,
          totalQuestions: totalQuizQuestions,
          averageScore: averageQuizScore + '%',
          completionRate: performanceMetrics.quizCompletionRate + '%',
        },
        recentActivity: {
          documents: recentDocuments,
          flashcards: recentFlashcards,
          quizzes: recentQuizzes,
        },
        todayActivity,
        studyStreak,
        performanceMetrics,
      },
    });
  } catch (error) {
    next(error);
  }
};
