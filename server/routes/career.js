const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { name, branch, year, skills, domain, goal } = req.body;

    const prompt = `
You are a brutally honest senior software engineer and career advisor in India who knows exactly what the industry wants in 2025-2026.

A student has given you their profile:
- Name: ${name}
- Branch: ${branch}
- Year: ${year}
- Current Skills: ${skills}
- Interested Domain: ${domain}
- Career Goal: ${goal}

Give them a honest, direct career reality check in the following exact format:

SCORE: [give a number between 0 and 100 representing how ready they are for their goal]

REALITY_CHECK: [Which of their current skills are outdated or not enough alone? Be direct.]

SKILL_GAP: [What specific skills are they missing for their domain in today's industry?]

AI_UPGRADE: [Which of their existing skills need an AI upgrade?]

INDUSTRY_WANTS: [What are companies hiring for right now in their specific domain?]

ACTION_PLAN: [Based on their year (${year}), calculate roughly how many months they have before placements. 1st year has ~30 months, 2nd year has ~18 months, 3rd year has ~6 months, 4th year has ~2 months. Create a realistic action plan based on this time. Be specific about urgency — if they are in final year, say clearly what to prioritize immediately and what to skip. If they have more time, give a relaxed but structured plan.]

Be direct, honest, and use simple language. Don't sugarcoat. Talk like a senior friend, not a professor.
`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile'
    });

    const analysis = response.choices[0].message.content;

    // Extract score
    const scoreMatch = analysis.match(/SCORE:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    res.json({ analysis, score });

  } catch (err) {
    console.log('Groq Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;