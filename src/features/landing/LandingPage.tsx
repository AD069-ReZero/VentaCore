import React from 'react';
import { Navbar } from '../../components/navigation/Navbar';
import { FloatingDock } from '../../components/navigation/FloatingDock';
import { HeroSection } from './HeroSection';
import { AssetAtlasSection } from './AssetAtlasSection';
import { FloatingCardsSection } from './FloatingCardsSection';
import { BentoGridSection } from './BentoGridSection';
import { RuntimeSecuritySection } from './RuntimeSecuritySection';
import { AttackChainSection } from './AttackChainSection';
import { FinalCtaSection } from './FinalCtaSection';
import { useLenisScroll } from '../../hooks/useLenisScroll';

import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onLaunchConsole?: () => void;
  onEnterLab?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchConsole,
  onEnterLab,
}) => {
  const navigate = useNavigate();
  const launchConsole = onLaunchConsole || (() => navigate('/console'));
  const enterLab = onEnterLab || (() => navigate('/console/lab'));

  // Initialize Lenis smooth scroll hook respecting prefers-reduced-motion and syncing with GSAP
  useLenisScroll({
    duration: 1.25,
    smoothWheel: true,
    syncWithGsap: true,
  });

  return (
    <div className="relative min-h-screen bg-[#050605] text-[#EDEDED] selection:bg-[#70FF5E] selection:text-black">
      {/* Top Fixed Minimalist Navbar */}
      <Navbar onLaunchConsole={launchConsole} />

      {/* Main Cinematic Scroll Sequence */}
      <main>
        {/* Scene 1: Hero — Defending the Agent / 3D Neural Swarm */}
        <HeroSection onLaunchConsole={launchConsole} onEnterLab={enterLab} />

        {/* Scene 2: AssetAtlas / Vertical Beam & Biometric Agent Scanner HUD */}
        <AssetAtlasSection onLaunchConsole={launchConsole} />

        {/* Scene 3: Tailored Security Solutions / Floating 3D Cards */}
        <FloatingCardsSection />

        {/* Scene 4: Control Plane Bento Grid */}
        <BentoGridSection />

        {/* Scene 5: Execution Boundary Interception Sandbox */}
        <RuntimeSecuritySection />

        {/* Scene 6: Attack Chain Correlation */}
        <AttackChainSection />

        {/* Scene 7: Biometric Ring CTA & Minimalist Editorial Footer */}
        <FinalCtaSection onLaunchConsole={launchConsole} onEnterLab={enterLab} />
      </main>

      {/* Floating Bottom Navigation Dock */}
      <FloatingDock onLaunchConsole={launchConsole} />
    </div>
  );
};
