# Skillo: Frontend Specification
### Dashboard Architecture & Interface Design

---

## Technical Stack
- **Engine**: Next.js 14 (App Router)
- **Design System**: Tailwind CSS
- **Motion Orchestration**: Framer Motion
- **State Management**: React Context & SSE Listeners

## Installation & Setup

1. **Dependency Ingestion**:
   ```bash
   npm install
   ```

2. **Configuration**:
   Ensure `.env.local` contains the necessary API endpoints and OAuth Client IDs.

3. **Execution**:
   ```bash
   npm run dev
   ```

## Interface Philosophy
The interface is designed around the concept of **"High-Trust Transparency"**:
- **Real-time Pipeline**: Directly streams backend agent states to the user.
- **Glassmorphic Design**: Minimizes visual noise while maintaining depth.
- **Asynchronous Interactions**: Non-blocking UI ensures the dashboard remains responsive during complex AI operations.
