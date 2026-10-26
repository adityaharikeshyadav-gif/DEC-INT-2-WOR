import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';

// Component Imports
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import ElinityDiscovery from './components/ElinityDiscovery';
import Features from './components/Features';
import ElinityHowToUse from './components/ElinityHowToUse';
import Testimonials from './components/Testimonials';
import WaitlistSection from './components/JoinWaitList';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatIsElinity from './components/WhatIsElinity';
import WhoIsElinityFor from './components/WhoIsElinityFor';
import WhatMakesElinitySpecial from './components/WhatMakesElinitySpecial';
import HowElinityWorks from './components/HowElinityWorks';
import FAQ from './components/FAQ';
import ScrollToTop from "./components/ScrollToTop";
import FloatingChat from './components/FloatingChat';


// Page Imports
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import LoginSignup from './pages/LoginSignup';
import GetStarted from './pages/GetStarted';
import PaymentPage from './pages/PaymentPage';
import Sitemap from './pages/Sitemap';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Stories from './pages/Stories';
import JoinUs from './pages/JoinUs';
import Ellaris from './pages/Ellaris';
import LegalPage from './pages/Legal';
import ElinityEnterprise from './pages/Enterprise';
import Openroles from './pages/foundgrowth';
import OpenRolesDropdown from './pages/OpenRolesDropdown';
import ElinityPodcast from './pages/ElinityPod';
import Software from './pages/software';
import DesignHead from './pages/headofdesign';
import AIResearch from './pages/headai';
import ElinityLanding from './pages/ElinityLanding';
import ElinityQuizzes from './pages/ElinityQuizzes';
import ElinityTrips from './pages/ElinityTrips';
import TripDetail from './components/trips/TripDetail';
import ElinityExperiences from './pages/ElinityExperiences';
import ExperienceDetail from './components/experiences/ExperienceDetail';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import ConversationChat from './pages/ConversationChat';
import ConversationHistory from './pages/ConversationHistory';
import Play from './pages/Play';
import GameLobby from './pages/GameLobby';
import GameSession from './pages/GameSession';

// Utils
import { setupRevealAnimations } from './utils/animations';

/**
 * Manages document titles based on current route
 */
function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Elinity",
      "/ellaris": "Elinity | Ellaris",
      "/blog": "Elinity | Blogs",
      "/about": "Elinity | About Us",
      "/contact": "Elinity | Contact Us",
      "/join-us": "Elinity | Join Us",
      "/trips": "Elinity | Trips",
      "/experiences": "Elinity | Experiences",
      "/conversations": "Elinity | Conversations",
      "/conversations/history": "Elinity | Life Book",
      "/play": "Elinity | Play Palace",
    };

    document.title = titles[location.pathname] || "Elinity";
    // Trigger animations on route change
    setupRevealAnimations();
  }, [location.pathname]);

  return null;
}

/**
 * Sub-component to handle logic that requires Router context (useLocation, etc.)
 */
function AppContent({ waitlistRef, handleScrollToWaitlist }: { waitlistRef: any, handleScrollToWaitlist: any }) {
  const location = useLocation();
  const [isScrollable, setIsScrollable] = useState(true);

  // Framer Motion scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const checkScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      setIsScrollable(scrollHeight > clientHeight);
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [location]);
  const isChatPage = location.pathname.startsWith('/conversations/chat/') || location.pathname.startsWith('/play/session/');

  return (
    <div className="flex flex-col min-h-screen">
      {isScrollable && !isChatPage && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left"
          style={{
            scaleX,
            background: "linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)",
          }}
        />
      )}

      {!isChatPage && <Navbar />}

      <div className="flex-grow">
        <Routes>
          <Route path="/ab" element={
            <main className="flex flex-col">
              <Hero onJoinClick={handleScrollToWaitlist} />
              <WhatIsElinity />
              <Features />
              <ElinityDiscovery />
              <WhoIsElinityFor />
              <ElinityHowToUse />
              <WhatMakesElinitySpecial />
              <HowElinityWorks />
              <Testimonials />
              <WaitlistSection ref={waitlistRef} />
              <FAQ />
            </main>
          } />
          
          <Route path='/ellaris' element={<Ellaris />} />
          <Route path='/join-us' element={<JoinUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/enterprise" element={<ElinityEnterprise />} />
          <Route path="/foundgrowth" element={<Openroles />} />
          <Route path="/opendrop" element={<OpenRolesDropdown />} />
          <Route path="/pod" element={<ElinityPodcast />} />
          <Route path='/software' element={<Software />} />
          <Route path='/designhead' element={<DesignHead />} />
          <Route path='/headai' element={<AIResearch />} />
          <Route path='/quizzes' element={<ElinityQuizzes />} />
          <Route path="/trips" element={<ElinityTrips />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/experiences" element={<ElinityExperiences />} />
          <Route path="/experiences/:id" element={<ExperienceDetail />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/conversations/persona/:id" element={<ConversationDetail />} />
          <Route path="/conversations/chat/:sessionId" element={<ConversationChat />} />
          <Route path="/conversations/history" element={<ConversationHistory />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play/lobby/:sessionId" element={<GameLobby />} />
          <Route path="/play/session/:sessionId" element={<GameSession />} />
          <Route path='/' element={<ElinityLanding />} />
        </Routes>
      </div>
      
      {!isChatPage && <FloatingChat />}

      {!isChatPage && <Footer className="mt-auto" />}
    </div>
  );
}

/**
 * Root Application Component
 */
function App() {
  const waitlistRef = useRef(null);

  const handleScrollToWaitlist = (e?: any) => {
    if (e) e.preventDefault();
    waitlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    setupRevealAnimations();
    const handleScroll = () => setupRevealAnimations();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <TitleManager />
      <ScrollToTop />
      <AppContent 
        waitlistRef={waitlistRef} 
        handleScrollToWaitlist={handleScrollToWaitlist} 
      />
    </Router>
  );
}

export default App;