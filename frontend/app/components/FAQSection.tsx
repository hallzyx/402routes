'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'How does X402 payment protocol work?',
      answer: 'X402 is an HTTP status code that enables automatic, per-request payments. When an AI agent or user makes a request to your API, they automatically pay the specified amount in USDC on the Cronos blockchain. No API keys, no manual billing - just instant, micropayments for every call.'
    },
    {
      question: 'What cryptocurrencies do you accept?',
      answer: 'Currently, we support USDC (USD Coin) on the Cronos testnet. USDC is a stablecoin, meaning its value is pegged to the US Dollar, eliminating volatility concerns for both API providers and consumers.'
    },
    {
      question: 'How do I get started publishing my API?',
      answer: 'Getting started is easy! First, connect your MetaMask wallet. Then, click "Publish API" and fill out the form with your API details including name, description, endpoint URL, and price per call. Once published, your API will be discoverable in our marketplace.'
    },
    {
      question: 'Can AI agents really use my API automatically?',
      answer: 'Yes! AI agents can discover your API through our marketplace, understand its capabilities from your description, and automatically make payments using the X402 protocol. This enables seamless integration without manual setup or API key management.'
    },
    {
      question: 'What are the transaction fees?',
      answer: 'We charge a small platform fee of 2.5% per transaction to maintain the infrastructure and continue improving the service. All payments are processed on the Cronos blockchain, which has minimal gas fees compared to other networks.'
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'Your earnings are automatically deposited to your connected wallet address in real-time with each API call. You have full custody of your funds and can withdraw or transfer them at any time using your MetaMask wallet.'
    },
    {
      question: 'Is there a minimum price for API calls?',
      answer: 'Yes, the minimum price is $0.0001 USDC per call. This ensures that micropayments remain economically viable while covering blockchain transaction costs. You can set any price above this minimum based on the value your API provides.'
    },
    {
      question: 'What happens if my API goes down?',
      answer: 'If your API is unavailable or returns an error, the payment is automatically refunded to the caller. This ensures fair transactions and maintains trust in the marketplace. We recommend implementing proper monitoring and high availability for your APIs.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about 402Routes
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
