import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Studios: React.FC = () => {
  const sections = [
    {
      title: "Elinity Studios",
      paragraphs: [
        "We are not a product company. We are an ecosystem company, building long-term products for flourishing, that also tells stories, builds worlds, and shapes culture, because we believe that's the only way to actually move humanity toward better futures. Products are the foundation, but stories and ideas are the fuel for propagating into the world, into the future. And that is what we are building with our studio arm.",
        "Most companies treat content as marketing, and marketing as a core function. We have a radically contrarian framing. We don't believe in marketing as a discipline. We believe in building things so good, so resonant, so genuinely enjoyable and valuable, that the people who need them find them on their own terms, and choose to join us because the story moved them, not because an ad targeted them.",
        "Elinity Studios is how we do that. On multiple vectors."
      ]
    },
    {
      title: "Elinity as a Meta-Organization",
      paragraphs: [
        "Before explaining Studios, it helps to explain how we think about Elinity, the organization, itself. We don't think of Elinity merely as an ecosystem of products. We think of it as a meta-organization, a vehicle whose purpose is to help individuals and society achieve deep, long-term flourishing, across decades, and beyond.",
        "The social matchmaking, the relationship OS, the community spaces, the trips and experiences, all of it is one expression of that purpose. But the purpose is bigger than any single expression of it. That's why we don't say we design products. We say we design an ecosystem, and an emergent engine of beauty and depth, so that new products, new experiences, and new ways of helping people flourish can keep emerging from it indefinitely.",
        "Elinity Studios is the next natural expression of that same purpose, aimed not at the mechanics of connection but at the imagination that makes people want to pursue connection, depth, intentional living in the first place, that makes people think deeply and feel more of what makes life oh-so awe inspiring."
      ]
    },
    {
      title: "What Elinity Studios Is",
      paragraphs: [
        "Elinity Studios is our storytelling, world-building, and culture-shaping arm. It produces near-future sci-fi films, long-form podcasts, idea-driven videos, games, and increasingly, physical experiences and spaces, all set inside a single unified universe of recurring characters and lore.",
        "It is not a content marketing team. It is a creative studio with its own creative integrity, one that happens to be built by the same people, for the same mission, as everything else we make. A film from Elinity Studios should be able to move someone who has never heard of Elinity and never will. A podcast episode should be worth an hour of someone's attention even if they never touch our product. The work has to earn its own existence first. Distribution, awareness, and growth are downstream consequences of that quality, never the starting goal."
      ]
    },
    {
      title: "Why a Product Company Builds a Studio",
      paragraphs: [
        "Even the best products in the world don't, by themselves, shift culture or bend the arc of a timeline. Products solve problems for the people who already know to look for them. Culture moves at a different layer entirely: the layer of the stories people tell each other, the characters they recognize themselves in, the visions of the future they quietly carry around and measure their own lives against.",
        "If we want to help build a world full of richer relationships, deeper intentionality, and real human flourishing, especially as we head into a period of AGI-driven transformation that will test all three, we can't only operate at the level of features and flows. We have to participate in the layer where culture actually gets made.",
        "We think about Elinity on a hundred-year timescale. A company built to last that long doesn't just ship software. It delivers a body of work, stories and ideas that helped a generation imagine what was possible for how people could live, love, connect, and relate to one another and to the technology reshaping their lives. That's the role we want Elinity Studios to play: as a genuine contributor to the culture of this moment of the next 5 years, and then, the next 5, and so on, the same way the great storytellers and studios of past eras shaped what entire generations believed was achievable."
      ]
    },
    {
      title: "The Three Pillars",
      pillars: [
        {
          name: "Science-fiction films and narrative storytelling.",
          text: "This is the pillar we're most excited about. Near-future stories exploring love, connection, identity, creativity, friendship, agency, and what it might mean to live a rich human life alongside increasingly capable ASIs. Most contemporary science fiction defaults to cold, dystopian, clinical, or cynical, often in ways that risk becoming self-fulfilling prophecies about the future we're actually walking toward. We're telling a different kind of story: one that takes the hard questions seriously, the risks, the dislocation, the uncertainty, while still being warm enough to make people want to reach for a better future rather than simply brace for a worse one. And of course, being radically optimistic about just how good things can get if we end up shaping towards the best timelines. Good stories are self fulfilling prophecies in this way - they might do more than anything else to push - and pull - us there. AI is collapsing the cost of high-quality filmmaking. Work that once required entire studios and enormous budgets can now be made by small teams with real taste and a clear point of view. We intend to push that opportunity as far as it will go, experimenting constantly with new formats and new ways stories can be told and delivered. Some of what we make will be short, 15 to 20 minutes, 4 to 8 episodes to a series, each one standalone but connected. Some will be feature-length, an hour to two hours. We expect to make many films for relatively small, specific audiences, tens of thousands of viewers, occasionally a few million, rather than chasing mass-market scale. A story built for the right ten thousand people can matter more than a story built to be inoffensive to ten million."
        },
        {
          name: "Long-form podcasts and conversations.",
          text: "Thoughtful, unhurried conversations with researchers, builders, scientists, philosophers, creators, and thinkers who have spent real time wrestling with the questions this moment in history is asking all of us. We are deliberately not chasing celebrity guests. Many of the most interesting people in the world aren't famous at all, they're people who have quietly thought harder about a hard question than almost anyone else. Long-form conversation reveals something shorter formats can't: not just someone's conclusions, but their assumptions, their uncertainties, the actual shape of how they think. That's exactly what's needed as the world changes faster than any of us can process alone."
        },
        {
          name: "Idea-driven and educational content.",
          text: "Shorter pieces, 3 to 8 minutes, exploring the intersection of AI, technology, culture, relationships, psychology, and human flourishing. These are not explainer videos and they're not built to deliver tidy, reassuring answers. They exist to provoke real thought, challenge assumptions, and help people build richer mental models of a world that is changing faster than most people's frameworks for understanding it."
        }
      ]
    },
    {
      title: "A Unified Universe",
      paragraphs: [
        "Across all three pillars, and eventually across games, app experiences, and physical spaces, we're building one connected universe rather than a scattered library of unrelated content. The same characters, the same lore, the same throughlines recur across formats, growing with you over years instead of resetting with every new release.",
        "This isn't incidental. It's the same instinct that shapes Lumi as a companion who grows alongside you in your own flourishing journey. The characters and stories of Elinity Studios are designed to become part of your life journey the same way: met first perhaps in a short film, encountered again inside a game in the Elinity Play suite, walked through in person at a community hub, referenced quietly inside a conversation with Lumi, as a world you live alongside."
      ]
    },
    {
      title: "From Screens to Spaces",
      paragraphs: [
        "Over time, Elinity Studios will extend fully into the physical world. We envision experience zones and mini parks, small at first and larger over time, adjacent to Elinity Community Hubs and integrated with Deckoviz, places designed for people to gather and experience these stories and worlds together, in person, rather than alone behind a screen. Interactive films and experiences that can only be encountered in these spaces. Novel, genuinely new formats of shared storytelling that aren't really possible anywhere else.",
        "We believe products alone don't shift culture. Stories alone don't either. But products, combined with stories, combined with real spaces where people gather and experience those stories together, that combination is durable enough to actually last. That's the kind of company, and the kind of cultural contribution, we're building toward over decades, not quarters."
      ]
    },
    {
      title: "How You'll Encounter Us",
      outro: "You won't find us optimizing for impressions or engagement metrics. You'll find us trying to make the kind of film, conversation, or idea that you'd value even if Elinity didn't exist at all. If it resonates with you, you'll understand exactly what we're building toward, and what kind of future we're trying to help bring about. And you'll be welcome to join us in building it, not because we convinced you to, but because you recognized something in it that was already yours."
    }
  ];

  return (
    <div className="min-h-screen bg-[#02000A] text-white pt-40 pb-40 px-6 md:px-12 relative overflow-hidden font-sans">
      {/* Cinematic Static Ambience */}
      <div 
        className="fixed top-[-20%] left-[-10%] w-[80vw] h-[80vw] pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(123,63,228,0.08) 0%, rgba(123,63,228,0.04) 30%, transparent 60%)' }}
      />
      <div 
        className="fixed bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.04) 30%, transparent 60%)' }}
      />
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-32 text-center relative"
        >
          <div className="absolute top-0 right-[15%] text-[#00D2FF] text-3xl opacity-30">✦</div>
          <div className="absolute bottom-[20%] left-[5%] text-[#7B3FE4] text-xl opacity-20">✧</div>

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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#94a3b8] to-[#e2e8f0] text-sm md:text-lg tracking-[0.3em] font-medium block mb-6">Worldbuilding Arm</span>
            Elinity <br className="hidden md:block"/>
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{ 
                background: 'linear-gradient(135deg, #FF6B6B 0%, #7B3FE4 50%, #00D2FF 100%)', 
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: "clamp(4.5rem, 10vw, 8rem)",
                letterSpacing: "-0.04em",
                textShadow: "0 20px 60px rgba(123, 63, 228, 0.3)",
                display: "inline-block",
                marginTop: "1rem",
                padding: "0 0.1em 20px 0.1em"
              }}>
              Studios
            </motion.span>
          </h1>
          <div className="h-[1px] w-full max-w-md mx-auto mt-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7B3FE4] to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B6B] to-transparent opacity-50 blur-sm" />
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
                  background: 'linear-gradient(to bottom, rgba(123,63,228,0.1), transparent)',
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
              
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#7B3FE4]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="mb-14">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {section.title}
                  </h2>
                  <div className="w-16 h-1 mt-6 rounded-full bg-gradient-to-r from-[#7B3FE4] to-[#00D2FF]" />
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
                          <div className="absolute -inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-[#7B3FE4]/10 to-transparent pointer-events-none" />
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7B3FE4] to-[#00D2FF] opacity-50 rounded-l-2xl group-hover/card:opacity-100 transition-opacity" />
                          
                          <h3 className="relative text-2xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-4">
                            <span className="text-[#00D2FF]">■</span>
                            {item.name}
                          </h3>
                          <p className="relative text-gray-300 text-lg leading-relaxed font-light z-10">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {section.outro && (
                    <div className="mt-16 relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B6B] to-[#7B3FE4] rounded-[2rem] blur-xl opacity-20" />
                      <div className="relative bg-[#0A061E]/80 backdrop-blur-lg border border-white/10 rounded-[2rem] p-10 text-center shadow-[inset_0_0_20px_rgba(123,63,228,0.1)]">
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

export default Studios;
