import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Eye, 
  Zap, 
  Globe, 
  Cpu, 
  Camera,
  Smartphone,
  Heart,
  Bot,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  Phone,
  Bluetooth,
  Wifi,
  Activity
} from 'lucide-react';

interface CreativeFeature {
  id: string;
  icon: any;
  title: string;
  description: string;
  status: 'live' | 'beta' | 'coming-soon';
  trendValue: string;
  gradient: string;
  isActive: boolean;
}

export default function CreativeAIShowcase() {
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [realTimeData, setRealTimeData] = useState({
    heartbeatsMonitored: 15420,
    aiDecisionsMade: 8932,
    livesImpacted: 1247,
    accuracyRate: 98.7
  });

  const creativeFeatures: CreativeFeature[] = [
    {
      id: 'neural-vision',
      icon: Eye,
      title: '👁️ Neural Vision Blood Scanner',
      description: 'AI-powered computer vision instantly analyzes blood quality, hemoglobin levels, and contamination using smartphone camera',
      status: 'beta',
      trendValue: '99.8%',
      gradient: 'from-cyan-500 to-blue-500',
      isActive: false
    },
    {
      id: 'heartbeat-ai',
      icon: Activity,
      title: '💓 Heartbeat Health AI',
      description: 'Real-time health monitoring using phone sensors to predict donor eligibility and optimal donation timing',
      status: 'live',
      trendValue: '24/7',
      gradient: 'from-red-500 to-pink-500',
      isActive: true
    },
    {
      id: 'blockchain-trust',
      icon: Globe,
      title: '🔗 Blockchain Trust Network',
      description: 'Decentralized verification system ensuring blood authenticity and creating immutable donation records',
      status: 'coming-soon',
      trendValue: '100%',
      gradient: 'from-green-500 to-emerald-500',
      isActive: false
    },
    {
      id: 'quantum-matching',
      icon: Cpu,
      title: '⚛️ Quantum Donor Matching',
      description: 'Quantum algorithms process millions of compatibility factors to find perfect matches in milliseconds',
      status: 'beta',
      trendValue: '0.1ms',
      gradient: 'from-purple-500 to-indigo-500',
      isActive: true
    },
    {
      id: 'emotion-ai',
      icon: Brain,
      title: '🧠 Emotional Intelligence AI',
      description: 'AI analyzes donor stress levels and emotional state to optimize donation experience and retention',
      status: 'live',
      trendValue: '+87%',
      gradient: 'from-yellow-500 to-orange-500',
      isActive: false
    },
    {
      id: 'drone-swarm',
      icon: Zap,
      title: '🚁 Autonomous Drone Swarm',
      description: 'Coordinated drone fleet with AI pathfinding delivers blood units via optimal routes in under 10 minutes',
      status: 'beta',
      trendValue: '8min',
      gradient: 'from-slate-500 to-gray-500',
      isActive: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setRealTimeData(prev => ({
        heartbeatsMonitored: prev.heartbeatsMonitored + Math.floor(Math.random() * 10),
        aiDecisionsMade: prev.aiDecisionsMade + Math.floor(Math.random() * 5),
        livesImpacted: prev.livesImpacted + Math.floor(Math.random() * 2),
        accuracyRate: 98.5 + Math.random() * 0.5
      }));

      // Randomly activate features for demo
      const randomFeature = creativeFeatures[Math.floor(Math.random() * creativeFeatures.length)];
      setActiveFeatures(prev => {
        if (prev.includes(randomFeature.id)) {
          return prev.filter(id => id !== randomFeature.id);
        } else {
          return [...prev.slice(-2), randomFeature.id]; // Keep last 3 active
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Real-time AI Activity Monitor */}
      <motion.div
        className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Bot className="h-6 w-6 text-cyan-400" />
            <span>Live AI Activity Monitor</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-cyan-400">Neural Networks Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <motion.div 
              className="text-2xl font-bold text-red-400 mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {realTimeData.heartbeatsMonitored.toLocaleString()}
            </motion.div>
            <div className="text-xs text-gray-400">Heartbeats Monitored</div>
          </div>
          
          <div className="text-center">
            <motion.div 
              className="text-2xl font-bold text-purple-400 mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {realTimeData.aiDecisionsMade.toLocaleString()}
            </motion.div>
            <div className="text-xs text-gray-400">AI Decisions Made</div>
          </div>
          
          <div className="text-center">
            <motion.div 
              className="text-2xl font-bold text-green-400 mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {realTimeData.livesImpacted.toLocaleString()}
            </motion.div>
            <div className="text-xs text-gray-400">Lives Impacted</div>
          </div>
          
          <div className="text-center">
            <motion.div 
              className="text-2xl font-bold text-blue-400 mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {realTimeData.accuracyRate.toFixed(1)}%
            </motion.div>
            <div className="text-xs text-gray-400">AI Accuracy</div>
          </div>
        </div>
      </motion.div>

      {/* Creative Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creativeFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm transition-all duration-500 cursor-pointer ${
              activeFeatures.includes(feature.id)
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-700/80 border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/20'
                : 'bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-500/20 hover:border-gray-400/40'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, rotateY: 2 }}
          >
            {/* Active indicator */}
            {activeFeatures.includes(feature.id) && (
              <motion.div
                className="absolute top-4 right-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              </motion.div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity duration-300 ${
              activeFeatures.includes(feature.id) ? 'group-hover:opacity-5' : 'group-hover:opacity-10'
            }`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-20`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    feature.status === 'live' 
                      ? 'bg-green-500/20 text-green-300'
                      : feature.status === 'beta'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {feature.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <h4 className="text-lg font-semibold mb-3 leading-tight">{feature.title}</h4>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{feature.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.trendValue}
                </span>
                {activeFeatures.includes(feature.id) && (
                  <motion.div
                    className="flex items-center space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400 font-medium">ACTIVE</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trend Insights */}
      <motion.div
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-purple-400" />
          <span>Innovation Trends</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🚀</div>
            <h4 className="font-semibold mb-1">AI-First Healthcare</h4>
            <p className="text-sm text-gray-400">Machine learning is revolutionizing blood management with predictive analytics</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🌐</div>
            <h4 className="font-semibold mb-1">Decentralized Networks</h4>
            <p className="text-sm text-gray-400">Blockchain technology ensures transparency and trust in donation systems</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold mb-1">Real-time Processing</h4>
            <p className="text-sm text-gray-400">Edge computing enables instant decision-making for emergency situations</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
