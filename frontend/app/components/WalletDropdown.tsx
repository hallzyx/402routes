'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiPackage, FiCreditCard, FiLogOut } from 'react-icons/fi';

interface WalletDropdownProps {
  walletAddress: string;
  onLogout: () => void;
}

export default function WalletDropdown({ walletAddress, onLogout }: WalletDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
      >
        <span className="text-sm font-mono">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <button
            onClick={() => handleNavigation('/my-apis')}
            className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
          >
            <FiPackage className="w-4 h-4" />
            <span className="font-medium">My APIs</span>
          </button>
          <button
            onClick={() => handleNavigation('/my-subscriptions')}
            className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
          >
            <FiCreditCard className="w-4 h-4" />
            <span className="font-medium">My Subscriptions</span>
          </button>
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
