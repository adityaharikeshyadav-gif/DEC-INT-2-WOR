import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Charter: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const brandGradient = 'linear-gradient(to bottom right, #3B82F6, #7B3FE4)';

  const sections = [
    {
      title: "Preamble",
      paragraphs: [
        "Elinity exists because the thing people want most out of life, deep, resonant, lasting relationships, has been left almost entirely to chance. We believe this is the most important problem worth solving, and we are building Elinity to solve it: as the foundational infrastructure for a different way of finding, building, and sustaining the relationships that make a life worth living.",
        "This charter is a statement of what Elinity is, what it commits to, and how it will conduct itself as it grows. It is written for everyone who is part of Elinity, the people building it, the people using it, and the people considering investing in or partnering with it, because all of them deserve to know what kind of company this is, and what kind of company it intends to remain.",
        "A charter is only as meaningful as the discipline behind it. What follows is not aspirational language to be quietly abandoned under commercial pressure. It is the set of commitments against which every major decision Elinity makes should be measured, including decisions that might otherwise look good on a quarterly chart."
      ]
    },
    {
      title: "Article I - Our Purpose",
      paragraphs: [
        "Elinity exists to help people actualize their social and relational potential: to find the people who are genuinely right for them, across romantic partnership, friendship, and collaboration; to build relationships with those people that grow deeper and more meaningful over time; and to have, alongside all of this, an AI companion that understands them deeply and helps them become who they are capable of becoming.",
        "To build this, we are creating the complete infrastructure for one's social and relational life: not as a single product, but as a complete ecosystem spanning how you find people for your social life, how you build relationships with them, where and how you live your social life in the physical world, how you learn and grow alongside others, and how you find the people you want to build and work with.",
        "Matching and recommendations, relationship tools and AI coaching, community spaces, trips and shared experiences, learning environments, project collaboration and purposeful work are not separate offerings bolted together. They are different expressions of the same underlying architecture, built on the same deep understanding of who you are, each strengthening the others. This is the foundational layer for one's entire social and relational world, the infrastructure that should have existed all along, and the ultimate expression of what Elinity is building toward.",
        "We measure our success not by how much time people spend on Elinity, but by the quality of the lives and relationships people build because of it. A person who finds their closest friends, their life partner, their most meaningful collaborations, and the community that anchors their social life, through Elinity, and who needs us less for any single one of those things once they've found it, represents Elinity working exactly as intended."
      ]
    },
    {
      title: "Article II - Our Commitments to the People We Serve",
      paragraphs: [
        "We will never show you someone, or something, that doesn't meet a real bar. Every recommendation, whether a person, a trip, an event, or an experience, is evaluated against a genuine threshold of fit. If nothing meets that bar, we show nothing. An empty result, honestly given, is more valuable than a false one.",
        "We will represent you as a whole person. Your profile on Elinity is not a set of photos and labels. It is a deep, evolving understanding of who you are, built over time, through real interaction, and used with care. We commit to building and maintaining that depth honestly, and never reducing it to the shallow signals that other platforms rely on.",
        "Your time matters more than our metrics. We will not design Elinity to maximise the time you spend on it, nor superficial platform “engagement”. We will design it to minimise the time you spend looking, and to maximise the time you spend with the people, places, and experiences that are actually right for you.",
        "We will be honest, even when honesty is less convenient. If we don't have a match for you, we'll tell you. If a recommendation comes with a caveat, we'll include it. If something isn't working, we'll say so rather than dress it up. The trust people place in Elinity's recommendations is the foundation of everything we do, and we will not spend that trust for short-term gain.",
        "Your data and your story belong to you. The depth of understanding Elinity builds about you exists to serve you. We commit to using it for that purpose, transparently, and to giving you control over it.",
        "We will never let AI replace the people in your life. Lumi exists to help you understand yourself, navigate your relationships, and grow, and to point you, always, back toward real human connection. We commit to building AI that makes crutches less necessary over time for any given relationship, because it succeeded in helping you build that relationship in the real world."
      ]
    },
    {
      title: "Article III - Our Principles for Curation and Matching",
      paragraphs: [
        "Curation is not a feature of Elinity. It is the foundational discipline that everything else is built on.",
        "Depth over breadth, always. We will continue to invest in understanding and modelling people more deeply rather than simply expanding the number of people in our network. A larger pool of shallow profiles is not progress. A deeper understanding of the people already here is.",
        "Compatibility is specific, not generic. Being right for someone as a friend, a romantic partner, a travel companion, or a collaborator are different questions, even when they involve the same two people. We commit to treating each of these as the distinct, serious questions they are, rather than collapsing them into a single compatibility score.",
        "The threshold is non-negotiable. As Elinity grows and faces pressure to show more, to keep people engaged, to fill empty states, to make the product feel more active, we commit to holding the line on quality over quantity. Growth that requires lowering our standards is not growth we want.",
        "We earn the right to make better recommendations by being trustworthy with the ones we've already made. Every honest \"no match yet\" builds the trust that makes the eventual \"yes, this person\" mean something."
      ]
    },
    {
      title: "Article IV - Our Principles for Lumi and AI",
      paragraphs: [
        "Lumi's success is measured by your relationships with other people, not by your relationship with Lumi. Every design decision about Lumi will be evaluated against this standard. If a feature would increase engagement with Lumi at the expense of the user's human relationships, we will not build it.",
        "Lumi will draw on real wisdom, applied honestly. The frameworks Lumi uses, from philosophy, psychology, and the people who have thought longest and hardest about how to live and relate to others, will be applied with genuine rigour, not as decoration. Lumi should make people think more clearly and deeply, not just feel good in the moment.",
        "Lumi will never pretend to be something it isn't. Lumi is an AI companion and coach. It will never present itself as a substitute for therapy, for professional support where that's needed, or for the human relationships it exists to help you build.",
        "Alignment is a continuous commitment, not a one-time achievement. As Lumi and Elinity's broader AI capabilities grow more powerful, our commitment to keeping them aligned with the genuine interests of the people who use them grows, not shrinks. We will treat increasing capability as increasing responsibility.",
        "We will be transparent about what our AI can and cannot do. People deserve to understand, in plain language, how Lumi works, what it has access to, and where its limits are."
      ]
    },
    {
      title: "Article V - Our Principles for the Physical World",
      paragraphs: [
        "Connection that stays digital is connection that stays incomplete. We commit to building and maintaining the physical infrastructure, community spaces, trips, experiences, learning environments, that gives recommendations a place to become relationships.",
        "Every physical experience we create must meet the same bar as everything else we do. A mediocre trip, a poorly curated event, or an uninspired community space contradicts everything else Elinity stands for, often at the exact moment someone is forming their first impression of what Elinity actually is. We commit to treating the quality of physical experiences as inseparable from the quality of the platform itself.",
        "Community spaces are communities, not real estate. We will not measure the success of a physical space purely by occupancy or revenue. We will measure it by whether it has become somewhere people genuinely want to be, and somewhere relationships are actually forming.",
        "We will grow our physical footprint at the pace our community can sustain, not the pace ambition demands. New cities, new spaces, and new physical products will be added when the community and the demand are real, validated before capital is committed, never the reverse."
      ]
    },
    {
      title: "Article VI - Our Principles for Growth and Business",
      paragraphs: [
        "We will build for decades. Every part of what makes Elinity valuable, the depth of understanding we have of each person, the trust people place in our recommendations, the strength of the communities we help form, compounds slowly and cannot be rushed without being faked. We commit to making decisions on the time horizon this actually requires, even when shorter-term alternatives would look better in the near term.",
        "Revenue follows value, not the other way around. Every revenue stream Elinity builds, subscriptions, memberships, trips, courses, experiences, must be a direct expression of value genuinely delivered. We will not build monetisation that depends on a worse experience for the people we serve. We deeply believe in the principles of resonant computing, cooperative platforming, value accretion and platform flourishing - with our core KPI, and our north star, being growing the actual value we deliver over time, rather than focusing on revenue, as most companies are doing.",
        "We will say no to growth that compromises the mission. Partnerships, features, or business models that would require compromising the principles in this charter, even if they would accelerate growth, are not growth we want. The mission is the constraint, not a constraint on the mission.",
        "Our team is part of what we're building. A company built to help people find the relationships and communities that bring out the best in them should, internally, be a place where the same is true for the people building it."
      ]
    },
    {
      title: "Article VII - On the Ecosystem We Are Building",
      paragraphs: [
        "Elinity is not a single product, and it will not become a loose collection of unrelated ones either. Every product in the Elinity ecosystem, the core matching and relationship tools, Community Spaces, Trips and Adventures, Experiences and Activities, Elinity School, Project Connector, and the broader work-flourishing layer through Ellaris, exists because it addresses a genuine and distinct part of what it means to actualize someone's social and relational potential, and because it strengthens the others.",
        "As we consider new products, partnerships, or directions, we will apply a simple test: does this deepen our understanding of the people we serve, does it help them find or build relationships that matter, and does it strengthen rather than dilute the rest of the ecosystem. If something doesn't pass this test, it doesn't belong in Elinity, regardless of how promising it might look in isolation."
      ]
    },
    {
      title: "Article VIII - A Living Document",
      paragraphs: [
        "This charter will be revisited as Elinity grows, not because its principles are expected to change, but because the situations they need to be applied to will. New products, new technologies, and new scales of operation will raise questions this document doesn't yet anticipate.",
        "When that happens, the test is not \"what does this document literally say\", but \"what would the people who wrote this document, believing what they believed, do in this situation.\" We commit to answering that question honestly, even when, especially when, the honest answer is inconvenient."
      ]
    },
    {
      title: "Closing",
      paragraphs: [
        "Solve relationships, and you solve a great deal else besides. Everything in this charter exists in service of that single conviction. If Elinity ever finds itself making a decision that serves the business at the expense of this conviction, that decision is wrong, regardless of what it does for any metric we might otherwise care about.",
        "This is the standard we are holding ourselves to. We intend to be held to it."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#030014] text-white pt-32 pb-24 px-6 md:px-12 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)', filter: 'blur(100px)' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,63,228,0.1) 0%, transparent 60%)', filter: 'blur(100px)' }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h1 
            style={{ 
              fontSize: "clamp(3rem, 6vw, 5rem)", 
              fontWeight: 900, 
              letterSpacing: "-0.04em",
              lineHeight: "1.1",
              marginBottom: "1rem"
            }}
          >
            The Elinity{' '}
            <span style={{ 
              background: brandGradient, 
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Charter
            </span>
          </h1>
          <div className="h-1 w-24 mx-auto rounded-full mt-8" style={{ background: brandGradient, opacity: 0.7 }} />
        </motion.div>

        {/* Content */}
        <div className="space-y-16">
          {sections.map((section, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-neutral-100 tracking-tight" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                {section.title}
              </h2>
              
              <div className="space-y-6">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-neutral-400 text-lg leading-relaxed font-light">
                    {p}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Charter;
