'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import StatsSection from '@/components/StatsSection';
import ValuesAccordion from '@/components/ValuesAccordion';
import AnimateOnScroll, { StaggerContainer } from '@/components/ui/AnimateOnScroll';

export default function AboutContent() {
  const { t } = useTranslation();

  const values = [
    {
      title: t('about.values.integrity.title'),
      description: t('about.values.integrity.description'),
    },
    {
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.description'),
    },
    {
      title: t('about.values.clientFocus.title'),
      description: t('about.values.clientFocus.description'),
    },
    {
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description'),
    },
  ];

  const certifications = [
    {
      name: t('about.certifications.nar.name'),
      description: t('about.certifications.nar.description'),
      icon: 'shield',
    },
    {
      name: t('about.certifications.crs.name'),
      description: t('about.certifications.crs.description'),
      icon: 'home',
    },
    {
      name: t('about.certifications.abr.name'),
      description: t('about.certifications.abr.description'),
      icon: 'handshake',
    },
    {
      name: t('about.certifications.rene.name'),
      description: t('about.certifications.rene.description'),
      icon: 'medal',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-secondary-900 text-white py-28 lg:py-44 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/about.png')" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-secondary-900/70" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <AnimateOnScroll animation="fade-in-down" duration={1000}>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                {t('about.pageTitle')}
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-in-up" delay={200} duration={1000}>
              <p className="text-xl text-secondary-300 leading-relaxed">
                {t('about.heroSubtitle')}
              </p>
            </AnimateOnScroll>
          </div>
        </div>

        {/* Animated decorative elements */}
        <div className="absolute top-20 right-10 w-20 h-20 border border-white/10 rounded-full animate-float" />
        <div className="absolute bottom-20 right-40 w-32 h-32 border border-white/5 rounded-full animate-float animation-delay-500" />
      </section>

      {/* Company Story */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll animation="slide-in-left" duration={1000}>
              <div>
                <h2 className="section-title mb-6">{t('about.ourStory')}</h2>
                <div className="prose prose-xl text-secondary-600">
                  <p>
                    {t('about.storyP1')}
                  </p>
                  <p>
                    {t('about.storyP2')}
                  </p>
                  <p>
                    {t('about.storyP3')}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-in-right" delay={200} duration={1000}>
              <div className="relative w-[90%]">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl hover-lift">
                  <img
                    src="/images/story-bg.webp"
                    alt="Our Story"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-100 rounded-2xl -z-10 animate-pulse-glow" />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <AnimateOnScroll animation="fade-in-up" className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary-600 mb-4">
              {t('about.ourPrinciples')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-5">
              {t('about.missionAndValues')}
            </h2>
            <p className="text-lg text-secondary-500 max-w-2xl mx-auto leading-relaxed">
              {t('about.valuesSubtitle')}
            </p>
          </AnimateOnScroll>

          {/* Mission Card - Centerpiece */}
          <AnimateOnScroll animation="scale-in-bounce" delay={200} className="max-w-3xl mx-auto mb-20">
            <div className="relative">
              {/* Floating badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg shadow-primary-600/25">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {t('about.ourMission')}
                </span>
              </div>

              {/* Card */}
              <div className="bg-white rounded-3xl p-10 lg:p-12 shadow-xl shadow-secondary-900/5 border border-secondary-100 hover:shadow-2xl hover:shadow-secondary-900/10 transition-shadow duration-500">
                <p className="text-secondary-700 text-center text-xl lg:text-2xl leading-relaxed font-light">
                  {t('about.missionStatement')}
                </p>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Values Accordion */}
          <AnimateOnScroll animation="fade-in-up" delay={400}>
            <ValuesAccordion values={values} />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Experience & Stats */}
      <StatsSection />

      {/* Certifications */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-in-up" className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              {t('about.certificationsTitle')}
            </h2>
            <p className="text-lg text-secondary-500 max-w-2xl mx-auto leading-relaxed">
              {t('about.certificationsSubtitle')}
            </p>
          </AnimateOnScroll>

          <div className="relative">
            {/* Snake Animation Path - Desktop Only */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
              preserveAspectRatio="none"
              viewBox="0 0 1200 200"
            >
              <path
                d="M 150 100 C 250 100, 250 50, 350 50 C 450 50, 450 150, 550 150 C 650 150, 650 50, 750 50 C 850 50, 850 100, 1050 100"
                fill="none"
                stroke="url(#snakeGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                className="snake-path"
              />
              <defs>
                <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <style>
                {`
                  .snake-path {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: snake 3s ease-in-out infinite;
                  }
                  @keyframes snake {
                    0% {
                      stroke-dashoffset: 1000;
                    }
                    50% {
                      stroke-dashoffset: 0;
                    }
                    100% {
                      stroke-dashoffset: -1000;
                    }
                  }
                `}
              </style>
            </svg>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
              {certifications.map((cert, index) => (
                <AnimateOnScroll
                  key={cert.name}
                  animation="fade-in-up"
                  delay={index * 150}
                >
                  <div className="group bg-white rounded-2xl p-8 border border-secondary-100 shadow-sm hover:shadow-lg hover:border-secondary-200 hover:-translate-y-2 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 h-full">
                    {/* Step Number */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                      {cert.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-secondary-500 leading-relaxed">
                      {cert.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-primary-600 relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 animate-float animation-delay-500" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimateOnScroll animation="fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              {t('about.ctaTitle')}
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-in-up" delay={100}>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {t('about.ctaSubtitle')}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="scale-in" delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="btn-primary bg-white text-primary-600 hover:bg-primary-50 hover:scale-105 transition-all duration-300"
              >
                {t('about.browseProperties')}
              </Link>
              <Link
                href="/contact"
                className="btn-outline bg-transparent text-white border-white/30 hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                {t('about.contactAnAgent')}
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
