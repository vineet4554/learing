import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, FileText, Layers, Sparkles } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Upload your notes",
    description: "Add PDFs and study material, then let the app organize them instantly.",
  },
  {
    icon: Layers,
    title: "Generate flashcards",
    description: "Turn long chapters into focused flashcard sets you can revise fast.",
  },
  {
    icon: BrainCircuit,
    title: "Practice with quizzes",
    description: "Test understanding with AI-powered quizzes and answer reviews.",
  },
];

function Homepage() {
  return (
    <div className="min-h-dvh px-4 py-6 sm:px-8 sm:py-10 lg:px-16 bg-transparent">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/learnforge-logo.svg" alt="LearnForge" className="h-9 w-9 rounded-lg" />
            <div>
              <p className="text-base font-bold text-slate-900">LearnForge</p>
              <p className="text-xs text-slate-500">Smarter daily learning</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-teal-600"
            >
              Get started
            </Link>
          </nav>
        </header>

        <section className="mt-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI learning assistant for students
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              Study less randomly,
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                learn more intentionally.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
              LearnForge helps you upload notes, generate flashcards, and practice quizzes in one
              calm, focused workspace.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                I already have an account
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-300/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-teal-300/20 blur-2xl" />

            <div className="relative space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Active set
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">Biology: Cell Structure</p>
                <p className="mt-1 text-sm text-slate-600">18 cards ready for revision</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Quiz progress
                </p>
                <p className="mt-1 text-2xl font-extrabold">84%</p>
                <p className="mt-1 text-sm text-slate-200">Great work. Keep momentum.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Documents</p>
                  <p className="text-xl font-bold text-slate-900">12</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Quizzes done</p>
                  <p className="text-xl font-bold text-slate-900">37</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12 + index * 0.08 }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{feature.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </motion.article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default Homepage;
