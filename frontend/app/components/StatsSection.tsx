'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiTrendingUp, FiZap, FiDollarSign, FiUsers } from 'react-icons/fi';

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const stats = [
    {
      icon: FiTrendingUp,
      value: '99.9%',
      label: 'Uptime Guarantee',
      description: 'Rock-solid reliability for your APIs'
    },
    {
      icon: FiZap,
      value: '<100ms',
      label: 'Average Latency',
      description: 'Lightning-fast payment processing'
    },
    {
      icon: FiDollarSign,
      value: '$0.0001',
      label: 'Starting Price',
      description: 'Monetize even the smallest requests'
    },
    {
      icon: FiUsers,
      value: '1000+',
      label: 'Active APIs',
      description: 'Growing marketplace ecosystem'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-24 bg-gray-50" ref={ref}>
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Scale and Speed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform handles millions of transactions daily with enterprise-grade infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-100 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-violet-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
