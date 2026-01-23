# Hackathon Presentation Guide

This guide provides everything hackathon judges need to understand 402Routes without running the application. Use this as a quick reference during evaluation.

## Executive Summary

**What it is:** A decentralized API marketplace that replaces API keys with blockchain-based per-call payments using X402 protocol on Cronos.

**Problem solved:** Traditional API marketplaces require monthly subscriptions, API keys that can be stolen, and complex billing systems. 402Routes eliminates these friction points with pay-per-use, wallet-based authentication, and instant on-chain settlement.

**Key innovation:** X402 protocol wraps any HTTP API with automatic payment enforcement, enabling true pay-per-request pricing without intermediaries.

## Core Features (What We Built)

### 1. API Marketplace
Developers publish APIs with custom pricing. Users browse and discover APIs by category. Real-time availability status. Subscription management with wallet signatures.

### 2. X402 Payment Protocol Integration
HTTP 402 Payment Required status code implementation. EIP-3009 signature-based payment authorization. Off-chain verification with on-chain settlement. Facilitator SDK integration for Cronos blockchain.

### 3. Subscription System
Wallet-based subscriptions (no email, no password). Subscribe/unsubscribe with one click. Persistent storage in db.json (demo) or database (production). Access control enforced by backend.

### 4. AI Budget Guardian
Autonomous AI agent with dedicated wallet. Real-time transaction monitoring. Anomaly detection using OpenAI/DeepSeek. Auto-pause suspicious transactions. Spending alerts and protection. Most importantly: automatic payment capability where the AI agent pays on behalf of users without manual confirmation for each API call, streamlining the user experience while maintaining security through AI-powered monitoring.

### 5. Developer Tools
402-wrapped URLs for any API. Direct browser testing interface. Copy-paste integration for server-to-server. API analytics and revenue tracking. Standalone test application (/test) running on port 5173 that allows external validation and testing of 402-wrapped links independent of the main marketplace, demonstrating how third-party applications can integrate with X402-protected APIs.

## Technical Architecture

System components: Frontend (Next.js) communicates with Backend (Express) which integrates with Cronos Blockchain via Facilitator SDK. AI Budget Guardian monitors transactions independently.

Technology Stack:
- Backend: Express + TypeScript, X402 middleware, Facilitator SDK
- Frontend: Next.js 15 + React 19, TailwindCSS, Ethers.js
- AI Agent: Python + FastAPI, OpenAI/DeepSeek, Web3.py
- Blockchain: Cronos, X402 Protocol, EIP-3009, USDC

## How It Works (Step-by-Step)

### Publishing an API
Developer connects wallet, fills API form, submits to marketplace. Backend generates unique API ID and 402-wrapped URL. API is now protected and monetized.

### Consuming an API
User browses marketplace, subscribes, gets 402-wrapped URL. First call returns 402 Payment Required. Frontend prompts MetaMask signature (EIP-3009). Backend verifies off-chain and settles on-chain. User retries with payment ID header. Backend proxies request to original API. Subsequent calls reuse same payment ID.

### AI Guardian Monitoring
Agent monitors blockchain in real-time, detects transactions, analyzes patterns with AI, evaluates risk. If anomaly detected: creates alert, notifies user, auto-pauses if high risk. User reviews and approves/blocks.

**Key Feature - Automatic Payments:** The AI Guardian can pay for API calls automatically on behalf of users without requiring MetaMask signature for each individual request. Users fund the agent wallet once, and the agent handles all subsequent payments intelligently while monitoring for suspicious patterns. This eliminates the friction of signing each transaction while maintaining security through AI-powered anomaly detection.

## Key Endpoints

Marketplace: GET/POST/PUT/DELETE /api/marketplace
Subscriptions: POST/DELETE/GET /api/subscriptions
Payment: POST /api/pay, GET /api/proxy/:id/*
AI Guardian: GET /api/agent/wallet/balance, POST /api/agent/analyze

## Demo Walkthrough (Without Running Code)

5-Minute Pitch:
- Minute 1: Problem - traditional API marketplaces with monthly plans
- Minute 2: Solution - X402 protocol with wallet-based auth
- Minute 3: User Experience - browse, subscribe, pay, execute
- Minute 4: Technical Innovation - EIP-3009, Facilitator SDK, AI Guardian
- Minute 5: Impact - pay-per-use, transparent, secure, no intermediaries

## Documentation Structure

All documentation designed for judges:
- README.md - Project overview
- ARCHITECTURE.md - Technical deep dive
- USERFLOWS.md - Step-by-step user journeys
- HACKATHON_GUIDE.md - This file (judge-first)
- backend/README.md - Backend installation and API docs
- frontend/README.md - Frontend installation and UI guide
- agent/README.md - AI agent configuration
- test/README.md - Test client installation

## Installation (For Judges Who Want to Run It)

Prerequisites: Node.js 20+, Python 3.10+, MetaMask with test CRO and USDC

Backend: cd backend && npm install && npm run dev
Frontend: cd frontend && npm install && npm run dev
AI Agent: cd agent && pip install -e . && python main.py
Test Client: cd test && npm install && npm run dev

Access Points:
- Frontend: http://localhost:3000 - Main marketplace UI
- Backend: http://localhost:8787 - API and payment backend
- AI Agent: http://localhost:8000 - Guardian service
- Test Client: http://localhost:5173 - External validation tool for testing wrapped URLs

**Test Client Purpose:** The test application demonstrates how external applications can integrate with 402-wrapped APIs. Copy a wrapped URL from the marketplace, paste it into the test client, and validate the complete payment flow in isolation. This serves as both a debugging tool and an integration example for third-party developers.

## Talking Points for Q&A

Q: Why Cronos?
A: Fast finality, low gas fees, EVM-compatible, strong DeFi ecosystem.

Q: Why not use existing payment rails?
A: Blockchain enables instant global payments, transparent auditing, no chargebacks.

Q: How do you prevent API abuse?
A: AI guardian monitors patterns, rate limiting, reputation system (future).

Q: Can traditional APIs integrate easily?
A: Yes! Any HTTP API can be wrapped with our proxy infrastructure.

Q: Gas fees for users?
A: EIP-3009 signatures are off-chain (free). Only settlement requires gas, paid by marketplace.

Q: How does automatic payment work with AI Guardian?
A: Users fund the AI agent wallet once. The agent then automatically pays for API calls on their behalf without requiring MetaMask confirmation each time. The AI continuously monitors for suspicious patterns and can auto-pause transactions if anomalies are detected, providing convenience without sacrificing security.

Q: What is the test client for?
A: The test application (http://localhost:5173) is a standalone tool for validating 402-wrapped URLs outside the main marketplace. It demonstrates how external applications can integrate with X402-protected APIs and serves as a debugging/testing tool for developers building integrations.

## Contact & Links

Repository, live demo, documentation, video demo, and team information available in repo.

Thank You: 402Routes demonstrates the future of API monetization - instant, transparent, pay-per-use, powered by blockchain and AI.