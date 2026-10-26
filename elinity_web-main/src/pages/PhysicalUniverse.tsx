import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PhysicalUniverse: React.FC = () => {
  const sections = [
    {
      title: "Why We're Building Beyond the Screen",
      paragraphs: [
        "Every piece of technology we build starts from the same belief: that there's a gap between who you could be, relationally and socially, and who you currently are, not because you lack the desire to close that gap, but because you lack the architecture to close it. The right people are out there. The right experiences exist. What's missing is something that actually understands you deeply enough to connect you to both, and then helps you build something real once that connection happens.",
        "We built two core systems inside Elinity to close that gap: a Relational Flourishing OS, built to help you build and deepen the specific relationships in your life, and a Social Resonance Engine, built to help you discover, curate, and expand your broader social world. Together, they form the technological core of everything Elinity does.",
        "But that intelligence, on its own, can only take you so far inside an app. At some point, flourishing requires you to actually leave the house. It requires a trip taken with people who get you. A dinner table you didn't expect to find yourself at. A creative space where a stranger becomes a collaborator becomes a friend. None of that happens inside a feed.",
        "So we built the Elinity Physical Universe: a suite of real-world products, all powered by the same technology that understands who you are and how you relate, and all designed to put you in the room, the trip, the workshop, or the city block where your flourishing actually happens."
      ]
    },
    {
      title: "One Technology Core, Many Doors Into the Real World",
      paragraphs: [
        "Everything in the Elinity Physical Universe is powered by the same underlying intelligence, made up of two complementary systems:",
        "The Social Resonance Heart is what finds and curates: it understands who you are, what kind of people you thrive alongside, what kind of experiences genuinely move you, and uses that understanding to surface the right trip, the right event, the right person, the right group of people, the right room to walk into. It's the engine behind discovery and connection across the entire Physical Universe.",
        "The Relational Flourishing OS is what helps you go deeper once you're there: the tools, the AI, the features and intelligence that help a connection formed on a trip or in a Community Hub actually turn into a real friendship, a real creative partnership, a real relationship, rather than fading the way most chance encounters do. The same features that help a couple build a stronger relationship inside the app, shared intentions, relationship-building tools, ongoing prompts and check-ins, are equally built to help any relationship strengthen over time: a new friendship from a Trip, a creative partnership formed at a Hub, a community you found through an Experience."
      ],
      outro: "Together, these two systems power every product line in this part of the ecosystem."
    },
    {
      title: "The Ecosystem",
      pillars: [
        {
          name: "Elinity Trips & Adventures",
          text: "Thoughtfully designed personalized trips, curated down to the texture of the experience, built around who you are rather than a generic itinerary. The Social Flourishing OS places you into a small group within a larger curated group, people we believe you'd genuinely love traveling and adventuring alongside. The Relational Flourishing OS helps those connections continue meaningfully after the trip ends, rather than dissolving the moment everyone flies home."
        },
        {
          name: "Elinity Experiences & Activities",
          text: "The same curation, closer to home. Experiences in and around your city, matched to your taste and your interests, often alongside people we think you'd love sharing them with, with the same follow-through tools to help a good evening turn into an ongoing friendship or collaboration."
        },
        {
          name: "Elinity Community Hubs",
          text: "Physical spaces in major cities that become the beating heart of Elinity in that city: creative space, co-working space, event space, a home for Renaissance-type salons, hobbies, projects, and the kind of lively, animated human energy that's genuinely hard to find on demand. A place with your people in it, not occasionally, but as a fixture of your everyday life. Community Hubs also house a screening space for Elinity Studios' films and stories, so the universe we're building in fiction and the community you're building in real life share the same physical room."
        },
        {
          name: "Elinity Experience Studios & Parks",
          text: "In select major cities, dedicated spaces for experimental, immersive storytelling and art experiences, often built in partnership with Deckoviz Experience Zones, offering interactive and physical experiences that simply can't be delivered through any other means."
        },
        {
          name: "Elinity School",
          text: "A space for learning, growth, and deepening the parts of yourself that make for a richer relational and social life, more details to come as this takes shape."
        }
      ]
    },
    {
      title: "What a Hub Actually Is",
      paragraphs: [
        "Picture a building, often a converted warehouse on the edge of a city, in larger cities we plan to eventually have two or three, positioned across different parts of town. Inside: a creative studio, a co-working floor, an events space hosting salons and gatherings, a screening room, project space for community-built initiatives and small local businesses, and constant, deliberately curated programming that brings the right people into the same room at the right time.",
        "This isn't a coworking space with better branding. It's designed to be the literal heart of Elinity in that city: a living glimpse of what a more connected, more intentional, more flourishing future could actually feel like, day to day, in person, with real people."
      ]
    },
    {
      title: "Technology as the Gap-Closer",
      paragraphs: [
        "We think about technology, at its best, as a tool for reducing the distance between human potential and human reality. Most of what people are capable of, relationally and socially, never gets realized, not for lack of desire, but for lack of the infrastructure that connects desire to opportunity.",
        "We believe putting the world's most capable social and relational intelligence into the hands of every person, paired with a complete ecosystem for actually living out what that intelligence makes possible, is one of the largest unlocks for human happiness, joy, and flourishing we could meaningfully contribute to in this moment. We don't say that lightly, and we don't think it's an exaggeration. We think it's close to a duty.",
        "The Elinity Physical Universe is where that belief takes its next natural step. It's where Lumi’s understanding of you, and its tools for helping you grow what it finds, become a trip you actually take, a room you actually walk into, a community you actually belong to."
      ]
    },
    {
      title: "Where This Goes",
      paragraphs: [
        "This is an early step into the physical world, not the final form. As the ecosystem grows, expect more cities, more hubs, deeper integration between our digital and physical layers, and increasingly ambitious experience formats, especially as Elinity Studios' universe of stories and characters becomes something you can step into physically, not just watch."
      ],
      outro: "The app was just the first room in a much larger house - now, we start building the rest."
    }
  ];

  return (
    <div className="min-h-screen bg-[#02000A] text-white pt-40 pb-40 px-6 md:px-12 relative overflow-hidden font-sans">
      {/* Cinematic Earth/Nature Static Ambience */}
      <div 
        className="fixed top-[-20%] left-[-10%] w-[80vw] h-[80vw] pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 30%, transparent 60%)' }}
      />
      <div 
        className="fixed bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 30%, transparent 60%)' }}
      />
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-32 text-center relative"
        >
          <div className="absolute top-0 right-[15%] text-[#F59E0B] text-3xl opacity-30">✦</div>
          <div className="absolute bottom-[20%] left-[5%] text-[#10B981] text-xl opacity-20">✧</div>

          <h1 
            style={{ 
              fontSize: "clamp(2rem, 5vw, 4rem)", 
              fontWeight: 800, 
              letterSpacing: "-0.01em",
              lineHeight: "1.1",
              marginBottom: "1rem",
              color: "#FFFFFF",
              textTransform: "uppercase"
            }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#94a3b8] to-[#e2e8f0] text-sm md:text-lg tracking-[0.3em] font-medium block mb-6">Real World Encounters</span>
            The Elinity <br className="hidden md:block"/>
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #F59E0B 100%)', 
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: "clamp(3.5rem, 8vw, 7rem)",
                letterSpacing: "-0.04em",
                textShadow: "0 20px 60px rgba(16, 185, 129, 0.3)",
                display: "inline-block",
                marginTop: "1rem",
                padding: "0 0.1em 20px 0.1em"
              }}>
              Physical Universe
            </motion.span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto mt-6 italic">
            "Relationships don't exist on an app. They exist in the real world."
          </p>
          <div className="h-[1px] w-full max-w-md mx-auto mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent opacity-50 blur-sm" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-24">
          {sections.map((section, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative p-10 md:p-16 rounded-[3rem] overflow-hidden group"
            >
              <div 
                className="absolute -top-10 -right-10 text-[20rem] font-bold leading-none select-none pointer-events-none transition-transform duration-1000 group-hover:scale-105"
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(16,185,129,0.1), transparent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontStyle: 'italic'
                }}
              >
                0{idx + 1}
              </div>

              {/* Glassmorphic Base */}
              <div className="absolute inset-0 bg-[#050212]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] z-0 transition-colors duration-500 group-hover:bg-[#08041c]/60" />
              <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_2px_20px_rgba(255,255,255,0.02),_0_30px_60px_rgba(0,0,0,0.5)] z-0" />
              
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="mb-14">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {section.title}
                  </h2>
                  <div className="w-16 h-1 mt-6 rounded-full bg-gradient-to-r from-[#10B981] to-[#F59E0B]" />
                </div>
                
                <div className="space-y-10">
                  {section.paragraphs && section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-gray-300 text-[1.15rem] md:text-xl leading-[1.9] font-light tracking-wide drop-shadow-sm">
                      {p}
                    </p>
                  ))}

                  {/* cinematic pillars */}
                  {section.pillars && (
                    <div className="mt-20 flex flex-col gap-8">
                      {section.pillars.map((item, listIdx) => (
                        <motion.div 
                          whileHover={{ y: -5, scale: 1.01 }}
                          key={listIdx} 
                          className="group/card relative bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-3xl p-10 overflow-hidden"
                          style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
                        >
                          <div className="absolute -inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-[#10B981]/10 to-transparent pointer-events-none" />
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#10B981] to-[#00D2FF] opacity-50 rounded-l-2xl group-hover/card:opacity-100 transition-opacity" />
                          
                          <h3 className="relative text-2xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-4">
                            <span className="text-[#10B981]">■</span>
                            {item.name}
                          </h3>
                          <p className="relative text-gray-300 text-lg leading-relaxed font-light z-10">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {section.outro && (
                    <div className="mt-16 relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#F59E0B] to-[#10B981] rounded-[2rem] blur-xl opacity-20" />
                      <div className="relative bg-[#0A061E]/80 backdrop-blur-lg border border-white/10 rounded-[2rem] p-10 text-center shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                        <p className="text-white text-xl md:text-2xl leading-[1.8] font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                          {section.outro}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PhysicalUniverse;
