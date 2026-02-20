"use client";

import React, { useRef } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import {
  BrainCircuit,
  Brain,
  BookOpen,
  Globe,
  ArrowRight,
  Upload,
  Linkedin,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import NeuralTraceDemoGraph from "@/src/components/NeuralTraceDemoGraph";
import SnehaImg from "@/public/sneha.jpeg";
import KhasImg from "@/public/khas.jpeg";
import PrestonImg from "@/public/preston.png";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

type Builder = {
  name: string;
  role: string;
  href: string;
  avatar: string | StaticImageData;
};

const BUILDERS: Builder[] = [
  {
    name: "Matthew G.",
    role: "Full-Stack AI Engineer · Team Lead",
    href: "https://www.linkedin.com/in/mattg2765/",
    avatar: "https://avatars.githubusercontent.com/u/131828386?v=4",
  },
  {
    name: "Michael K.",
    role: "M.S. AI · Computer Vision & Autonomous Systems",
    href: "https://www.linkedin.com/in/michael-khuri/",
    avatar: "https://avatars.githubusercontent.com/u/86020928?v=4",
  },
  {
    name: "Sneha P.",
    role: "ML Engineer · CS @ UTA",
    href: "https://www.linkedin.com/in/snehaptl/",
    avatar: SnehaImg,
  },
  {
    name: "Khas T.",
    role: "EECS · UC Berkeley",
    href: "https://www.linkedin.com/in/khas-erdene-tsogtsaikhan/",
    avatar: KhasImg,
  },
  {
    name: "Preston S.",
    role: "Software Engineer · Web Applications",
    href: "https://www.linkedin.com/in/preston-jay-susanto-3a589534b/",
    avatar: PrestonImg,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f12] text-white font-sans selection:bg-teal-500/30">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-center py-6 px-8 border-b border-white/5 max-w-7xl mx-auto w-full"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Image
            src="/NeruonBook_t%201.webp"
            alt="NeuronBook"
            width={80}
            height={80}
            priority
          />
        </motion.div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-colors"
              >
                Sign in
              </motion.button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm font-bold bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-5 py-2 rounded-full"
              >
                Get started
              </motion.button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm font-bold bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-5 py-2 rounded-full inline-flex items-center gap-2"
              >
                Dashboard <ArrowRight size={15} />
              </motion.span>
            </Link>
          </SignedIn>
        </div>
      </motion.nav>

      <section className="max-w-4xl mx-auto text-center pt-20 pb-24 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-bold leading-tight mb-6"
          >
            Stop Passive Reading. <br />
            <span className="text-teal-400">Start Mastering.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Transform passive highlights into an evolving map of expertise with
            the world&apos;s first metacognitive learning engine.
          </motion.p>
          <motion.div variants={fadeUp}>
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-8 py-3 rounded-full font-bold inline-flex items-center gap-2"
                >
                  Get started <ArrowRight size={18} />
                </motion.button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-8 py-3 rounded-full font-bold inline-flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight size={18} />
                </motion.span>
              </Link>
            </SignedIn>
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-teal-400 text-center uppercase tracking-[0.2em] font-semibold mb-12"
        >
          Features
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <FeatureCard
            icon={<Brain className="text-teal-400" />}
            title="Socratic Probes"
            tagline="Active recall, in real time."
            description="NeuronBook embeds optional AI questions directly into your text, challenging understanding as you read, no more mindless highlighting."
          />
          <FeatureCard
            icon={<BrainCircuit className="text-teal-400" />}
            title="The Neural Trace"
            tagline="Your mind, visualized."
            description="Every insight becomes a node in a living knowledge graph, showing how ideas connect across books and subjects."
          />
          <FeatureCard
            icon={<BookOpen className="text-teal-400" />}
            title="Foxit PDF Reader"
            tagline="Read smarter, not harder."
            description="Powered by Foxit's embedded PDF engine, read your textbooks directly in-app with a clean, distraction-free experience built for deep learning."
          />
          <FeatureCard
            icon={<Globe className="text-teal-400" />}
            title="Research Grounding"
            tagline="Context beyond the page."
            description="Integrated real-world research from You.com adds clarity, depth, and up-to-date understanding."
          />
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
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
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 2 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
          className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        >
          <Image
            src="/lol%201.webp"
            alt="Highlighting Illusion — everything highlighted means nothing is"
            width={523}
            height={552}
            className="w-full object-cover"
          />
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
          className="rounded-3xl border border-white/10 bg-black/30 overflow-hidden"
        >
          <NeuralTraceDemoGraph />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.15, ease }}
          className="space-y-6"
        >
          <p className="text-3xl font-bold mb-8">
            A Living Blueprint for Your Thinking
          </p>
          <p className="text-gray-400 leading-relaxed">
            Traditional databases are where ideas go to die. We built a
            structured "Map of the Mind" using the Socratic Method to help you
            actively navigate, refine, and master your personal knowledge base
            using Sanity. A lot better than just highlighting!
          </p>
        </motion.div>
      </section>

      <BuildersSection />

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease }}
        className="max-w-5xl mx-auto px-6 py-32 text-center border-t border-white/5"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <h2 className="text-4xl font-bold text-left">Get started for free</h2>
          <Link
            href="/library"
            className="border-2 border-dashed border-white/10 rounded-3xl p-12 hover:bg-white/5 transition-colors group cursor-pointer block"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-teal-400 group-hover:bg-teal-300 text-[#0a0f12] px-6 py-4 rounded-xl font-bold inline-flex items-center gap-3 mb-4"
            >
              Upload your textbook <Upload size={20} />
            </motion.div>
            <p className="text-gray-500 text-sm">or drag your file here</p>
          </Link>
        </div>
      </motion.section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
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

function BuildersSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      ref={ref}
      className="relative max-w-7xl mx-auto px-6 py-32 border-t border-white/5 overflow-hidden"
    >
      {/* Subtle ambient blobs */}
      <div className="absolute -top-20 left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none" />

      {/* Section header */}
      <div className="relative text-center mb-20">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-teal-400 text-center uppercase tracking-[0.2em] font-semibold mb-12"
        >
          The Team
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="mb-6 text-4xl md:text-5xl font-black tracking-tight "
        >
          Meet the Engineers
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed"
        >
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
        </motion.p>
      </div>

      {/* Engineer cards */}
      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {BUILDERS.map((person, i) => (
          <motion.a
            key={person.name}
            href={person.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 70 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.65,
              delay: 0.35 + i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              y: -6,
              scale: 1.02,
              borderColor: "rgba(94,234,212,0.25)",
              transition: { type: "spring", stiffness: 300, damping: 22 },
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col items-center text-center p-6 bg-white/[0.03] border border-white/10 rounded-3xl"
          >
            {/* Avatar */}
            <div className="relative w-24 h-24 mb-5">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #5eead4, #a78bfa, #5eead4)",
                  padding: "2px",
                }}
              >
                <div className="w-full h-full rounded-full bg-[#0a0f12]" />
              </div>
              <div className="absolute inset-[3px] rounded-full overflow-hidden">
                <Image
                  src={person.avatar}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>

            <p className="relative font-bold text-white text-base mb-1 group-hover:text-teal-300 transition-colors duration-200">
              {person.name}
            </p>
            <p className="relative text-gray-400 text-sm leading-snug mb-5">
              {person.role}
            </p>

            {/* LinkedIn badge */}
            <div className="relative mt-auto flex items-center gap-1.5 text-gray-600 group-hover:text-teal-400 transition-colors duration-200 text-xs font-semibold">
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
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
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -8,
        borderColor: "rgba(94,234,212,0.35)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="bg-[#11181c] border border-white/5 p-8 rounded-2xl"
    >
      <motion.div
        whileHover={{ scale: 1.18, rotate: 8 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="mb-6 p-3 bg-teal-400/10 w-fit rounded-xl"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-teal-400/80 text-xs font-bold uppercase tracking-wider mb-4">
        {tagline}
      </p>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
