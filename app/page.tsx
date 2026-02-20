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
  Linkedin,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Sneha from "@/public/sneha.jpeg";
import Khas from "@/public/khas.jpeg";
import Preston from "@/public/preston.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f12] text-white font-sans selection:bg-teal-500/30">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center py-6 px-8 border-b border-white/5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Image
            src="/NeruonBook_t%201.webp"
            alt="NeuronBook"
            width={80}
            height={80}
            priority
          />
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="text-sm font-bold bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-5 py-2 rounded-full transition-all">
                Get started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-bold bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-5 py-2 rounded-full transition-all inline-flex items-center gap-2 group"
            >
              Dashboard{" "}
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </SignedIn>
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
        <SignedOut>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-8 py-3 rounded-full font-bold transition-all inline-flex items-center gap-2 group">
              Get started{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-8 py-3 rounded-full font-bold transition-all inline-flex items-center gap-2 group"
          >
            Go to Dashboard{" "}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </SignedIn>
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

      {/* Meet the Builders */}
      <section className="relative max-w-7xl mx-auto px-6 py-32 border-t border-white/5 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Heading */}
        <div className="relative text-center mb-20">
          <p className="text-teal-400 uppercase tracking-[0.35em] font-bold text-xs mb-5">
            The Team
          </p>
          <h2 className="builders-heading text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight">
            Meet the Engineers
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
            Five engineers. Two weeks. One mission — forged at the{" "}
            <a
              href="https://developerweek-2026-hackathon.devpost.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              DeveloperWeek 2026 Hackathon
            </a>
            .
          </p>
        </div>

        {/* Builder Cards */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            {
              name: "Matthew G.",
              role: "Team Lead · Full-Stack AI Engineer",
              href: "https://www.linkedin.com/in/mattg2765/",
              avatar: "https://avatars.githubusercontent.com/u/131828386?v=4",
              initials: "MG",
            },
            {
              name: "Michael K.",
              role: "M.S. AI · Computer Vision & Autonomous Systems",
              href: "https://www.linkedin.com/in/michael-khuri/",
              avatar: "https://avatars.githubusercontent.com/u/86020928?v=4",
              initials: "MK",
            },
            {
              name: "Sneha P.",
              role: "ML Engineer · CS @ UTA",
              href: "https://www.linkedin.com/in/snehaptl/",
              avatar: Sneha,
              initials: "SP",
            },
            {
              name: "Khas T.",
              role: "EECS · UC Berkeley",
              href: "https://www.linkedin.com/in/khas-erdene-tsogtsaikhan/",
              avatar: Khas,
              initials: "KT",
            },
            {
              name: "Preston S.",
              role: "Software Engineer · Web Applications",
              href: "https://www.linkedin.com/in/preston-jay-susanto-3a589534b/",
              avatar: Preston,
              initials: "PS",
            },
          ].map((person, i) => (
            <a
              key={person.name}
              href={person.href}
              target="_blank"
              rel="noopener noreferrer"
              className="builder-card group flex flex-col items-center text-center p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.07] hover:border-teal-400/40 hover:shadow-[0_0_40px_rgba(94,234,212,0.12)] transition-all duration-300"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {/* Avatar with spinning gradient ring */}
              <div className="relative w-20 h-20 mb-5">
                <div
                  className="builder-avatar-ring absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #5eead4, #a78bfa, #5eead4)",
                    padding: "2px",
                  }}
                >
                  <div className="w-full h-full rounded-full bg-[#0a0f12]" />
                </div>
                <div className="absolute inset-[3px] rounded-full overflow-hidden">
                  {person.avatar ? (
                    <Image
                      src={person.avatar}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400/30 to-purple-500/30 flex items-center justify-center text-teal-300 font-bold text-xl">
                      {person.initials}
                    </div>
                  )}
                </div>
              </div>

              <p className="font-bold text-white text-sm mb-1 group-hover:text-teal-300 transition-colors">
                {person.name}
              </p>
              <p className="text-gray-500 text-xs leading-snug mb-4">
                {person.role}
              </p>

              {/* LinkedIn icon */}
              <div className="mt-auto flex items-center gap-1.5 text-gray-600 group-hover:text-teal-400 transition-colors text-xs font-semibold">
                <Linkedin size={14} />
                <span>LinkedIn</span>
              </div>
            </a>
          ))}
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
