/**
 * LandingPage — Replicated from Figma Screenshot.
 * Uses a dark theme with teal accents and glassmorphism panels.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  BookOpen,
  Scissors,
  Globe,
  ArrowRight,
  Upload,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f12] text-white font-sans selection:bg-teal-500/30">
      {/* Navigation Header */}
      <nav className="flex justify-center py-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image
            src="/NeruonBook_t%201.webp"
            alt="NeuronBook"
            width={150}
            height={150}
            priority
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center pt-20 pb-24 px-6">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Stop Passive Reading. <br />
          <span className="text-teal-400">Start Mastering.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform passive highlights into an evolving map of expertise with
          the world&apos;s first metacognitive learning engine.
        </p>
        <Link
          href="/dashboard"
          className="bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-8 py-3 rounded-full font-bold transition-all inline-flex items-center gap-2 group"
        >
          Get started{" "}
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <h2 className="text-teal-400 text-center uppercase tracking-[0.2em] font-semibold mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Brain className="text-teal-400" />}
            title="Socratic Probes"
            tagline="Active recall, in real time."
            description="NeuronBook embeds optional AI questions directly into your text, challenging understanding as you read, no more mindless highlighting."
          />
          <FeatureCard
            icon={<BookOpen className="text-teal-400" />}
            title="The Neural Trace"
            tagline="Your mind, visualized."
            description="Every insight becomes a node in a living knowledge graph, showing how ideas connect across books and subjects."
          />
          <FeatureCard
            icon={<Scissors className="text-teal-400" />}
            title="Dynamic Pruning"
            tagline="Focus where it fades."
            description="Mastered concepts stay bright while weaker ones resurface, powered by spaced repetition and adaptive review."
          />
          <FeatureCard
            icon={<Globe className="text-teal-400" />}
            title="Research Grounding"
            tagline="Context beyond the page."
            description="Integrated real-world research from You.com adds clarity, depth, and up-to-date understanding."
          />
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center border-t border-white/5">
        <div>
          <h2 className="text-3xl font-bold mb-8">Our Inspiration</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            We built NeuronBook because we were tired of the &quot;Highlighting
            Illusion.&quot;
          </p>
          <p className="text-gray-400 leading-relaxed">
            Highlighting text is one of the least effective ways to learn, yet
            it&apos;s the primary tool used by millions of students. It creates
            a false sense of familiarity without building true understanding.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <Image
            src="/lol%201.webp"
            alt="Highlighting Illusion — everything highlighted means nothing is"
            width={523}
            height={552}
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* Sanity Callout */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center border-t border-white/5">
        <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/10">
          <Image
            src="/NeruonBook_t%201.webp"
            alt="NeuronBook"
            width={437}
            height={379}
            className="w-48 h-auto mb-4"
          />
        </div>
        <div className="space-y-6">
          <p className="text-xl text-gray-300">
            We combined the Socratic Method with Sanity&apos;s structured power
            to create a &quot;Map of the Mind.&quot;
          </p>
          <p className="text-gray-400 leading-relaxed">
            NeuronBook isn&apos;t just a database; it&apos;s a metacognitive
            engine built to help you navigate information overload and move from
            mere knowing to true mastery.
          </p>
        </div>
      </section>

      {/* File Upload / CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-32 text-center border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <h2 className="text-4xl font-bold text-left">Get started for free</h2>
          <Link
            href="/library"
            className="border-2 border-dashed border-white/10 rounded-3xl p-12 hover:bg-white/5 transition-colors group cursor-pointer block"
          >
            <div className="bg-teal-400 group-hover:bg-teal-300 text-[#0a0f12] px-6 py-4 rounded-xl font-bold inline-flex items-center gap-3 mb-4">
              Upload your textbook <Upload size={20} />
            </div>
            <p className="text-gray-500 text-sm">or drag your file here</p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/5 text-gray-500 text-sm">
        <p>
          Built with ❤️, by Matthew G., Michael K., Sneha P., Khas T., and
          Preston S.
        </p>
        <p className="mt-2 font-semibold">DeveloperWeek 2026 Hackathon</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  tagline,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  tagline: string;
  description: string;
}) {
  return (
    <div className="bg-[#11181c] border border-white/5 p-8 rounded-2xl hover:border-teal-400/30 transition-all group">
      <div className="mb-6 p-3 bg-teal-400/10 w-fit rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-teal-400/80 text-xs font-bold uppercase tracking-wider mb-4">
        {tagline}
      </p>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
