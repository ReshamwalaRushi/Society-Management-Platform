import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Shield,
  Users,
  CreditCard,
  Bell,
  BarChart3,
  Car,
  MessageSquare,
  Menu,
  X,
  Check,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Star,
} from 'lucide-react';

/* ── Navbar ─────────────────────────────────────────────────────── */
const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const links = ['Features', 'Pricing', 'About', 'Contact'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SocietyPro</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="block text-sm text-gray-700 hover:text-indigo-600 font-medium"
              onClick={() => setOpen(false)}
            >
              {l}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              to="/login"
              className="flex-1 text-center text-sm font-medium text-indigo-600 border border-indigo-200 py-2 rounded-lg"
              onClick={() => setOpen(false)}
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="flex-1 text-center text-sm font-medium text-white bg-indigo-600 py-2 rounded-lg"
              onClick={() => setOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

/* ── Hero ────────────────────────────────────────────────────────── */
const Hero: React.FC = () => (
  <section className="pt-24 pb-20 bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
        <Star size={12} /> Trusted by 500+ Societies across India
      </span>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
        Smart Management for <br />
        <span className="text-indigo-600">Modern Societies</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
        SocietyPro streamlines resident management, billing, complaints, visitor
        logs, facilities, and security — all in one powerful platform.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/register"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
        >
          Get Started Free <ChevronRight size={18} />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
        >
          Sign In to Dashboard
        </Link>
      </div>

      {/* Stat pills */}
      <div className="mt-14 flex flex-wrap justify-center gap-6">
        {[
          { label: 'Societies Managed', value: '500+' },
          { label: 'Residents Served', value: '50,000+' },
          { label: 'Transactions Processed', value: '₹10 Cr+' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 text-center min-w-[140px]">
            <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── Features ────────────────────────────────────────────────────── */
const features = [
  {
    icon: Users,
    color: 'bg-indigo-500',
    title: 'Resident Management',
    desc: 'Manage owner & tenant profiles, unit assignments, and occupancy status effortlessly.',
  },
  {
    icon: CreditCard,
    color: 'bg-green-500',
    title: 'Financial & Billing',
    desc: 'Auto-generate maintenance bills, track payments, and send reminders. Integrated Razorpay support.',
  },
  {
    icon: Shield,
    color: 'bg-red-500',
    title: 'Security & Visitors',
    desc: 'Log visitors, generate QR-based entry passes, and maintain comprehensive security records.',
  },
  {
    icon: Bell,
    color: 'bg-yellow-500',
    title: 'Announcements & Polls',
    desc: 'Post society-wide announcements, run polls, and communicate with residents in real-time.',
  },
  {
    icon: MessageSquare,
    color: 'bg-purple-500',
    title: 'Complaint Tracking',
    desc: 'Residents raise complaints; admins track, assign, and resolve them with full audit trails.',
  },
  {
    icon: BarChart3,
    color: 'bg-blue-500',
    title: 'Dashboard & Analytics',
    desc: "Get a bird's-eye view of occupancy, finances, complaints, and visitor trends at a glance.",
  },
  {
    icon: Car,
    color: 'bg-teal-500',
    title: 'Vehicle Management',
    desc: 'Register resident vehicles and track parking slot assignments across the society.',
  },
  {
    icon: Building2,
    color: 'bg-orange-500',
    title: 'Facility Booking',
    desc: 'Enable residents to book clubhouse, gym, swimming pool, and other shared amenities online.',
  },
];

const Features: React.FC = () => (
  <section id="features" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Everything your society needs
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          A complete suite of tools designed specifically for Indian housing societies — from a single flat to a large township.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl p-6 transition-colors group"
          >
            <div className={`${f.color} w-11 h-11 rounded-xl flex items-center justify-center mb-4`}>
              <f.icon size={20} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-indigo-700">
              {f.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── Pricing ─────────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Basic',
    price: '₹999',
    period: '/month',
    description: 'Perfect for small societies with up to 50 units.',
    highlight: false,
    features: [
      'Up to 50 units',
      'Resident management',
      'Basic billing & payments',
      'Visitor log',
      'Email support',
    ],
  },
  {
    name: 'Standard',
    price: '₹2,499',
    period: '/month',
    description: 'Ideal for mid-size societies with full feature access.',
    highlight: true,
    features: [
      'Up to 200 units',
      'Everything in Basic',
      'Complaint tracking',
      'Facility booking',
      'Announcements & polls',
      'Priority email & phone support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large townships and multi-society management.',
    highlight: false,
    features: [
      'Unlimited units',
      'Everything in Standard',
      'Multi-society dashboard',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 support',
    ],
  },
];

const Pricing: React.FC = () => (
  <section id="pricing" className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Choose a plan that fits your society's size. No hidden fees — cancel anytime.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl p-8 flex flex-col ${
              p.highlight
                ? 'bg-indigo-600 text-white shadow-xl scale-105'
                : 'bg-white border border-gray-100 shadow-sm'
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <div className="mb-6">
              <h3 className={`text-xl font-bold mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>
                {p.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-4xl font-extrabold ${p.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {p.price}
                </span>
                {p.period && (
                  <span className={`text-sm ${p.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {p.period}
                  </span>
                )}
              </div>
              <p className={`text-sm ${p.highlight ? 'text-indigo-100' : 'text-gray-500'}`}>
                {p.description}
              </p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check
                    size={16}
                    className={`mt-0.5 flex-shrink-0 ${p.highlight ? 'text-indigo-200' : 'text-indigo-500'}`}
                  />
                  <span className={p.highlight ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                p.highlight
                  ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {p.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── About ───────────────────────────────────────────────────────── */
const About: React.FC = () => (
  <section id="about" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
            Built for Indian societies, <br />
            <span className="text-indigo-600">by people who live in them</span>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            SocietyPro was born out of the frustration of managing a housing society
            with spreadsheets and WhatsApp groups. We set out to build a platform
            that is simple enough for every committee member yet powerful enough for
            the most complex townships.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            Today, hundreds of societies across India rely on SocietyPro to automate
            billing, streamline visitor management, digitise complaints, and keep
            every resident informed — saving hours of administrative work every week.
          </p>
          <div className="grid grid-cols-2 gap-5">
            {[
              { value: '2020', label: 'Founded' },
              { value: '500+', label: 'Societies' },
              { value: '50K+', label: 'Residents' },
              { value: '4.8★', label: 'Avg. Rating' },
            ].map((s) => (
              <div key={s.label} className="bg-indigo-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual card stack */}
        <div className="relative flex justify-center">
          <div className="bg-indigo-600 rounded-3xl w-72 h-72 flex items-center justify-center shadow-2xl">
            <Building2 size={100} className="text-indigo-200" />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 w-48">
            <p className="text-sm font-semibold text-gray-800 mb-1">Complaint Resolved</p>
            <p className="text-xs text-gray-500">Water leakage in B-204</p>
            <span className="mt-2 inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
              ✓ Resolved
            </span>
          </div>
          <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 w-44">
            <p className="text-sm font-semibold text-gray-800 mb-1">Payment Received</p>
            <p className="text-xs text-gray-500">₹3,500 — Flat A-101</p>
            <span className="mt-2 inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              ✓ Paid
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ── Contact ─────────────────────────────────────────────────────── */
const Contact: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Get in touch</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Have questions or want a demo? We'd love to hear from you.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-7">
            {[
              {
                icon: Phone,
                label: 'Phone',
                value: '+91 98765 43210',
                href: 'tel:+919876543210',
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'hello@societypro.in',
                href: 'mailto:hello@societypro.in',
              },
              {
                icon: MapPin,
                label: 'Office',
                value: '5th Floor, Tech Park, Pune, Maharashtra — 411001',
                href: null,
              },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl flex-shrink-0">
                  <c.icon size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-0.5">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm text-indigo-600 hover:underline">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Check size={28} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Message sent!</h3>
                <p className="text-sm text-gray-500">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your society or ask any question…"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Footer ──────────────────────────────────────────────────────── */
const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-base">SocietyPro</span>
        </div>
        <div className="flex gap-6 text-sm">
          {['Features', 'Pricing', 'About', 'Contact'].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="hover:text-white transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 border border-indigo-800 hover:border-indigo-600 px-4 py-2 rounded-lg transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
        © {new Date().getFullYear()} SocietyPro. All rights reserved.
      </div>
    </div>
  </footer>
);

/* ── Page ────────────────────────────────────────────────────────── */
const LandingPage: React.FC = () => (
  <div className="min-h-screen">
    <Navbar />
    <Hero />
    <Features />
    <Pricing />
    <About />
    <Contact />
    <Footer />
  </div>
);

export default LandingPage;
