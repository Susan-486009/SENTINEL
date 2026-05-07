import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ReportModal from '../components/ReportModal';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, BookOpen, HelpCircle, UserPlus,
  ArrowRight, Flag, Heart
} from 'lucide-react';
import campusImg from '../assets/lasustech_campus_scene.png';

const Home = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <Hero onReportClick={() => setIsReportModalOpen(true)} />

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </main>
  );
};

export default Home;
