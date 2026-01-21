'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/discover', label: 'Discover', icon: '🔍' },
    { href: '/publish', label: 'Publish', icon: '➕' },
    { href: '/my-apis', label: 'My APIs', icon: '📋' },
    { href: '/my-subscriptions', label: 'Subscriptions', icon: '👤' },
    { href: '/guardian', label: 'AI Guardian', icon: '🛡️', highlight: true },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📈</span>
            <span className="font-bold text-xl">402Routes</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                    ${item.highlight ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection placeholder */}
          <div className="text-sm text-gray-600">
            Connect Wallet
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-2 flex overflow-x-auto space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-1 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 bg-gray-50'
                  }
                  ${item.highlight ? 'ring-1 ring-blue-300' : ''}
                `}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
