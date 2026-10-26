import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Foundations: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const brandGradient = 'linear-gradient(to bottom right, #3B82F6, #7B3FE4)';

  const sections = [
    {
      title: "Raison d’être",
      paragraphs: [
        "The thing people want the most out of life - incredible, deeply fulfilling relationships - is something most of us don’t achieve at their very highest levels. We leave a lot on the table - a whole lot, because of the randomness of life.",
        "We are fundamentally social creatures. We crave connection, intimacy, shared stories and meaning. And yet, for many, even most, the depth, quality, and richness of our relationships fall far short of what they could be.",
        "Despite being the most important life outcome, relational excellence remains elusive.",
        "And worse, outcomes are declining.",
        "Loneliness is rising. Relationship satisfaction is stagnating. Many people who want deeply aligned partners don’t find them. Many have stopped believing a beauteous future of incredible humanity. Many who want to start families don’t find the one worth building with. A quiet sense of meaninglessness and apathy pervades it all.",
        "At the core of this is something simple. We are relying on randomness, luck and flawed systems for the most important part of our lives.",
        "The tools we have today are broken. Low signal. Time-wasting. Superficial. They don’t understand who we are, what we want, or who we would truly flourish with. They reduce something deeply human into swipes, filters, and shallow heuristics.",
        "So most people don’t find their best people. They satisfice. They settle for \"good enough\", instead of discovering what is actually possible.",
        "And that gap - between the relationships we have and the relationships we could have had - creates a massive, often invisible cost. A form of counterfactual suffering.",
        "At the same time, the world is optimising towards consumption, not meaning.",
        "If this continues, we are heading toward a future of simulated relationships, AI partners replacing human ones, increasing solitariness, and deeper digital escapism.",
        "Social connection breakdown sits at the centre of many of our biggest problems:\n• loneliness\n• relationship breakdown\n• mental health struggles\n• declining birth rates\n• the meaninglessness crisis\n• the slow unraveling of the social fabric\n• the simulacrization of the world",
        "We believe this is the most important problem to solve."
      ]
    },
    {
      title: "Our Mission",
      paragraphs: [
        "Elinity exists to help people actualize their social and relational potential.",
        "We are building across three core pillars:"
      ],
      listItems: [
        {
          title: "1. Find your people",
          desc: "Help people discover their most resonant connections across love, leisure, and collaboration. The people who bring out the best in you, who inspire you, who add oodles of richness and excitement and passion and beauty to life. Not just romantic partners, but friends, collaborators, travel companions, and the people you build things with. The full range of human connection, treated with the seriousness it deserves. We achieve this by building the state-of-the-art human modelling and matching system."
        },
        {
          title: "2. Build incredible relationships",
          desc: "Provide people an evolving ecosystem, of tools, games, AI coaches, shared spaces, and shared experiences, to create deep, healthy, evolving relationships with partners, friends, family, and themselves. Relationships that grow and compound, supported by the kind of infrastructure that has never existed before: a relationship operating system for real life, and a physical world of community spaces, trips, and experiences for those relationships to actually live in."
        },
        {
          title: "3. Build aligned-by-default, emotionally intelligent AI",
          desc: "Develop a new architecture of AGI that is deeply aligned with our users. An AI that understands you, supports your growth, amplifies your humanity, and helps you become who you are capable of becoming. An AI whose success is measured by the quality of your relationships with other people, not by your relationship with the AI itself."
        }
      ],
      outro: "Through these, we aim to address the root causes behind relationship stagnation, lack of meaning and eudaimonia, emotional disconnection, and the broader societal drift away from human flourishing. Together, the first two pillars represent our commitment to building the ultimate and complete ecosystem to help people actualize their social and relational potential: an end-to-end architecture for connection, spanning how you find people, how you build relationships with them, and where and how you live your social life in the world. This is the foundation everything else is built on. But connection, as central as it is, is one part of a larger picture."
    },
    {
      title: "The Vision",
      paragraphs: [
        "We are building toward a world where:",
        "Everyone finds their best people. Everyone builds extraordinary relationships. Everyone has access to aligned AI that helps them grow, connect, and live fully.",
        "A world where people are doing work that brings them alive, work full of passion and purpose. A world where relationships are a source of energy, meaning, and expansion. A world where no one is limited by randomness in finding their people, their communities, their collaborators, or the experiences that make life feel worth living.",
        "A world where learning doesn't end with a degree, where growth is supported rather than left to chance, where play and exploration are treated as essential rather than indulgent, and where the things people want to create find the people who can help bring them to life.",
        "A world that feels more alive. More connected. More human.",
        "Because at the end of the day, everything flows from this.",
        "Solve relationships, and you solve everything. Build the architecture for flourishing, and you build the foundation for everything else a life could be."
      ]
    },
    {
      title: "Our Broader Vision: An Architecture for Human Flourishing",
      paragraphs: [
        "The deeper we've gone into building Elinity (let’s just say, we’ve been at it a while;)), the clearer it has become that connection doesn't exist in isolation. The same forces that determine whether someone finds the right people also shape whether they're learning and growing throughout their life, whether they have space to play and explore, and whether they're creating and building things that matter to them. These aren't separate domains of a life. They're different facets of the same underlying question: is this person flourishing, in the fullest sense of that word.",
        "This is why our broader goal is to build the architecture for people's lives that can help them attain eudaimonia across the five core dimensions of life:"
      ],
      dimensions: [
        {
          title: "Connection",
          desc: "The relationships in someone's life, romantic, platonic, familial, collaborative, and the depth, health, richness, and vibrancy of those relationships over time. This is where Elinity began, and it remains the foundation. The matching engine, the relationship OS, Lumi as a relational coach, Elinity Community Spaces, Trips and Adventures, and Experiences and Activities are all, at their core, infrastructure for connection."
        },
        {
          title: "Learning",
          desc: "The ongoing pursuit of understanding, ideas, and intellectual growth, not as something that ends at graduation, but as a lifelong source of meaning and joy. Elinity School exists to give adults a genuine home for the kind of learning most people lose access to the moment they leave university: small, curated cohorts, taught by passionate experts, and subjects that matter for the world we're actually living in."
        },
        {
          title: "Creation",
          desc: "The drive to build, make, and bring something new into the world, whether that's a creative project, a piece of research, a community initiative, or a company. Project-Based Connector, Elinity's community projects, and the broader work-flourishing layer through Ellaris all exist to help people find the collaborators and the context to create things that matter to them, with people who are genuinely the right fit to build alongside."
        },
        {
          title: "Play and Exploration",
          desc: "The part of life that often gets crowded out by everything else, but that may be the most essential: adventure, discovery, fun, the experiences that make you feel most alive. Elinity Trips and Adventures, Elinity Experiences and Activities, and the games suite all live here. We think play is not a break from a flourishing life. It's a core part of one."
        },
        {
          title: "Growth",
          desc: "The deeper, often harder work of becoming who you're capable of becoming: self-understanding, emotional intelligence, working through what's holding you back, and building the kind of life that reflects your values rather than your habits or sheer chance. This is where Lumi's role as a life coach and companion, and the conversational journeys drawing on history's greatest philosophers and psychologists, live. Growth and connection feed each other constantly: the people around you shape who you become, and who you become shapes the relationships you're capable of."
        }
      ],
      outro: "Across all five dimensions, the same underlying intelligence is at work: a deep, evolving understanding of who you are, built through real interaction over time, used to make every recommendation, every match, every suggestion better than the last. Connection, learning, growth, play, and creation are not five separate elements or domains bolted together. They are five expressions of the same architecture, each strengthening the others, all built on the same foundation.\n\nThis is what we mean when we talk about building the ultimate ecosystem, the complete, vertically integrated architecture for a flourishing life. As the infrastructure for eudaimonia itself, not a social super app with extra features bolted on."
    },
    {
      title: "Addendum - On the Third Pillar:\nWhy We Intend To Build Our Own AGI For Our Ecosystem",
      paragraphs: [
        "What we have described so far explains how the third pillar serves the first two. But there is a deeper layer to our thinking here that deserves its own explanation, because it shapes some of our most consequential long-term decisions: we intend to build our own AGI, from the ground up, rather than build our products on top of existing AI paradigms trained on internet-scale data. This is something we have spent a considerable time deliberating on, and it is worth explaining some strokes of our thinking.",
        "Full-stack ownership, in service of something worth trusting.",
        "The first reason is straightforward. We want full-stack control of every part of our ecosystem, from the software and the infrastructure, to the hardware, to the AI itself. This is because we are trying to build something that will, over time, become a lifelong presence in people's homes and lives. An AI that someone trusts with their relationships, their growth, their most honest reflections, and their flourishing over the course of a lifetime is not something we are willing to build on a foundation we don't fully understand or control. It needs to be built with the right values, the right goals, and the right incentives, designed from the foundation up to serve the flourishing of the person it belongs to. That is not a property you can reliably inherit from a third-party model. It has to be built in, from the base layer.",
        "Aligned by default, not aligned as an afterthought.",
        "We have in mind a new paradigm of AGI, one that is aligned by default and emotionally intelligent at the base layer, not a general-purpose model that alignment techniques are layered onto after the fact. We believe this distinction is extremely significant for our long term future. An AI that learns to behave well through reinforcement and fine-tuning on top of internet-scale pretraining carries the imprint of everything in that data, including all of its distortions, incentives, and pathologies, and asks alignment to undo that afterward. We would rather start from a different foundation entirely.",
        "An aesthetic and ethical preference, not just a technical one.",
        "We also hold a genuine aesthetic conviction here, alongside the ethical one. We don't believe that an AI trained on the accumulated data of the internet represents the best possible manifestation of what an AGI could be, the platonic ideal of a generally intelligent system, to state it mildly. The internet is a vast but deeply imperfect mirror of humanity, and we don't think the first truly general intelligences should be built primarily in that mirror's image.",
        "This leads to one of our strongest convictions: we believe the first ASI should not emerge from data harvested from the internet without the consent of the people who created it. Our preferred approach is different in kind, not just in degree. We would rather see the first ASI emerge from a system that has learned from first principles, built around a fundamental, general learning algorithm, rather than one trained primarily on the unconsented totality of human data online. This is a radically different bet about what kind of intelligence the world should build toward, and it is one we are choosing to make.",
        "A protective layer against a world of misaligned and corporate-aligned AI.",
        "Beyond how this AI is built, we also care deeply about what it is for. We are genuinely concerned about the risks a rogue or malevolent ASI poses, and we want to build an aligned AGI layer that helps safeguard people against exactly that risk. In one possible future, this could mean our AI becomes part of a broader alignment layer that sits between humans and the wider ecology of AGIs that will eventually exist. At minimum, we intend for it to be a protective layer for every individual Elinity user, shielding them from the realities of today's broken internet, and the broader digital landscape and from AI systems that are optimised to sell to them, market to them, manipulate their attention, or exploit them in ways they could never protect themselves against, considering the sheer power of these systems, like the addictive social media algorithm of today, but 100x more powerful.",
        "We believe every person deserves their own aligned AI: a system whose only loyalty is to them, designed to protect them from the incentives of the internet, from other AI systems that don't share their interests, and from the broader landscape of corporate-aligned technology built to extract value from them rather than serve their flourishing. This is the AI we intend to build: as a lifelong flourishing buddy, built from the ground up, with love and care, to be worthy of that role for the Elinity family."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#02000A] text-white pt-40 pb-40 px-6 md:px-12 relative overflow-hidden font-sans">
      {/* Optimized Static Ambience (No heavy blur filters or blend modes to prevent lag) */}
      <div 
        className="fixed top-[-20%] left-[-10%] w-[80vw] h-[80vw] pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 30%, transparent 60%)' }}
      />
      <div 
        className="fixed bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(123,63,228,0.1) 0%, rgba(123,63,228,0.05) 30%, transparent 60%)' }}
      />
      <div 
        className="fixed top-[40%] left-[50%] w-[50vw] h-[50vw] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'radial-gradient(circle at center, rgba(0,210,255,0.05) 0%, transparent 60%)' }}
      />
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-32 text-center relative"
        >
          {/* Subtle Sparkles Array */}
          <div className="absolute top-0 right-[15%] text-[#00D2FF] text-3xl opacity-50">✦</div>
          <div className="absolute bottom-[20%] left-[5%] text-[#7B3FE4] text-xl opacity-40">✧</div>
          <div className="absolute top-[-20%] right-[40%] text-[#3B82F6] text-4xl opacity-30">✦</div>

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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 text-sm md:text-lg tracking-[0.3em] font-medium block mb-6">Manifesto</span>
            Our Mission, Vision, <br className="hidden md:block"/> and<br />
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{ 
                background: 'linear-gradient(135deg, #00D2FF 0%, #3B82F6 40%, #7B3FE4 100%)', 
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: "clamp(4.5rem, 10vw, 8rem)",
                letterSpacing: "-0.04em",
                textShadow: "0 20px 60px rgba(59, 130, 246, 0.5)",
                display: "inline-block",
                marginTop: "1rem",
                paddingBottom: "20px"
              }}>
              Raison d’être
            </motion.span>
          </h1>
          <div className="h-[1px] w-full max-w-md mx-auto mt-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent opacity-50 blur-sm" />
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
              {/* Massive Abstract Number Watermark */}
              <div 
                className="absolute -top-10 -right-10 text-[20rem] font-bold leading-none select-none pointer-events-none transition-transform duration-1000 group-hover:scale-105"
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(59,130,246,0.1), transparent)',
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
              
              {/* Premium Top Illuminator Line */}
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="mb-14">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {section.title}
                  </h2>
                  <div className="w-16 h-1 mt-6 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7B3FE4]" />
                </div>
                
                <div className="space-y-10">
                  {section.paragraphs.map((p, pIdx) => {
                     // Abstract headers check
                     if (p.includes("Full-stack ownership") || p.includes("Aligned by default") || p.includes("An aesthetic and ethical preference") || p.includes("A protective layer against")) {
                       return (
                        <h3 key={pIdx} className="text-3xl font-extrabold bg-gradient-to-br from-white via-indigo-100 to-[#7B3FE4] bg-clip-text text-transparent pt-8 pb-2 tracking-tight">
                          {p}
                        </h3>
                       )
                     }
                     // Quote / Bullet block
                     if (p.includes("•")) {
                       return (
                         <div key={pIdx} className="relative p-8 rounded-3xl overflow-hidden border border-[#3B82F6]/20 bg-gradient-to-br from-[#3B82F6]/10 to-transparent">
                           <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#00D2FF] to-[#3B82F6] shadow-[0_0_15px_#00D2FF]" />
                           <div className="text-gray-200 text-xl font-light leading-[2.2] whitespace-pre-wrap ml-2">
                             {p}
                           </div>
                         </div>
                       )
                     }
                     // Standard Text Layout
                     return (
                      <p key={pIdx} className="text-gray-300 text-[1.15rem] md:text-xl leading-[1.9] font-light tracking-wide mix-blend-screen drop-shadow-sm">
                        {p}
                      </p>
                     )
                  })}

                  {/* Sub-lists for Mission and Dimensions */}
                  {section.listItems && (
                    <div className="mt-20 flex flex-col gap-8">
                      {section.listItems.map((item, listIdx) => (
                        <motion.div 
                          whileHover={{ y: -5, scale: 1.01 }}
                          key={listIdx} 
                          className="group/card relative bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-3xl p-10 overflow-hidden"
                          style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
                        >
                          {/* Inner glow flare on hover */}
                          <div className="absolute -inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-[#3B82F6]/10 to-transparent pointer-events-none" />
                          <div className="absolute top-10 right-10 opacity-10 group-hover/card:opacity-20 transition-opacity">
                            <span className="text-8xl font-black italic text-transparent" style={{ WebkitTextStroke: "2px #3B82F6" }}>0{listIdx+1}</span>
                          </div>
                          
                          <h3 className="relative text-3xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-4">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-[#3B82F6] to-[#00D2FF] rounded-full inline-block shadow-[0_0_10px_#3B82F6]" />
                            {item.title.replace(/^\d+\.\s*/, '')} {/* Stripped out the 1. 2. 3. since we styled the numbers */}
                          </h3>
                          <p className="relative text-gray-300 text-lg leading-relaxed font-light z-10 max-w-[90%]">{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {section.dimensions && (
                    <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {section.dimensions.map((item, dimIdx) => (
                        <motion.div 
                          whileHover={{ y: -5 }}
                          key={dimIdx} 
                          className="relative overflow-hidden bg-gradient-to-b flex flex-col justify-start from-white/[0.03] to-transparent border border-white/[0.06] rounded-3xl p-10 transition-all hover:border-[#7B3FE4]/50"
                          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.3)" }}
                        >
                          {/* Top ambient highlight */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#7B3FE4]/30 blur-3xl rounded-full" />
                          
                          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#7B3FE4]/20 border border-[#7B3FE4]/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(123,63,228,0.4)]">
                              <div className="w-3 h-3 bg-[#00D2FF] rounded-full" />
                            </div>
                            {item.title}
                          </h3>
                          <p className="text-gray-300 text-lg leading-[1.8] font-light mt-2">{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {section.outro && (
                    <div className="mt-16 relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6] to-[#7B3FE4] rounded-[2rem] blur-xl opacity-20" />
                      <div className="relative bg-[#0A061E]/80 backdrop-blur-lg border border-white/10 rounded-[2rem] p-10 text-center shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
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

export default Foundations;
