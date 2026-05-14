# Technical Briefing: Skillo Presentation Guide
### Strategy for a Successful Project Demonstration

---

## The Presentation Philosophy
Focus on engineering excellence and structural integrity. Do not describe Skillo as a "tool," but as an "autonomous framework."

---

## ⏱️ Demonstration Structure

### Phase 1: Context & Interface (0:00 - 0:45)
*Objective: Establish the problem and demonstrate UI responsiveness.*
*   **Action**: Launch the dashboard.
*   **Key Talking Point**: "Skillo addresses the 'Planning Friction' problem. We've built a high-fidelity interface using Next.js and Framer Motion that acts as a real-time command center for student data."

### Phase 2: Agentic Orchestration (0:45 - 2:00)
*Objective: Show the backend complexity.*
*   **Action**: Generate a Smart Timetable.
*   **Key Talking Point**: "We aren't just calling an LLM. We've implemented a state-machine using LangGraph. You can see the 'Thinking Pipeline' here, which reflects the real-time routing of my request to the specific Planning Agent."

### Phase 3: Resilience & Architecture (2:00 - 3:00)
*Objective: Prove robustness.*
*   **Key Talking Point**: "A critical feature is our Resilience Layer. If the external Gemini API fails or the database times out, the system is hard-coded to fall back to our proprietary local Python algorithms. This ensures the student is never without their plan."

---

## Anticipated Technical Questions

**Q: Why choose a multi-agent system over a single LLM prompt?**
> "Single-prompt systems lack state and reliability for multi-step tasks. By using a multi-agent graph, we isolate responsibilities—ensuring the Study Agent focuses on RAG accuracy while the Planner Agent focuses on temporal constraints."

**Q: How is real-time streaming achieved?**
> "We use Server-Sent Events (SSE) via FastAPI. This allows the backend to push 'thought updates' to the frontend as the agent graph progresses, providing immediate user feedback without polling."

**Q: What is the benefit of the dual-path execution model?**
> "It ensures the application is production-ready. We use LLMs for high-value intelligence but maintain deterministic Python logic for core survival functions if APIs are unreachable."

---

## Pre-Demonstration Audit
- [ ] **API Check**: Verify `GEMINI_API_KEY` in `backend/.env`.
- [ ] **Server Check**: Ensure both `python main.py` and `npm run dev` are operational.
- [ ] **Data Check**: Clear `mock_db.json` if a clean onboarding flow is required.
- [ ] **Browser**: Use a high-performance browser (Chrome/Edge) to ensure smooth animations.

---
<div align="center">
  <p><i>Confident delivery and technical depth will define the success of this viva.</i></p>
</div>
