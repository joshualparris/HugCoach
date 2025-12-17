# Question Bank Specification


## Question Types Supported (MVP)


### 1. Multiple Choice (MCQ)
**Use for**: Concept identification, fact recall, scenario analysis


**Format**:
```json
{
  "type": "mcq",
  "question": "Which component of Gottman's Sound Relationship House involves knowing your partner's inner world?",
  "options": [
    "Love Maps",
    "Trust",
    "Conflict Management",
    "Shared Meaning"
  ],
  "correctIndex": 0,
  "explanation": "Love Maps refer to the cognitive room where you store all the relevant information about your partner's life."
}
```


**Rules**:
- 4 options (1 correct, 3 plausible distractors)
- Distractors must be plausible (not obviously wrong)
- Avoid "all of the above" or "none of the above"
- Single concept per question


### 2. Short Answer
**Use for**: Application, reflection, personal insight


**Format**:
```json
{
  "type": "short_answer",
  "question": "Describe one 'brake' (inhibitor of arousal) from Nagoski's Dual Control Model that might affect you personally.",
  "sampleAnswers": [
    "Stress from work deadlines",
    "Feeling tired or fatigued",
    "Worries about performance"
  ],
  "explanation": "Brakes are factors that inhibit sexual arousal. Common brakes include stress, fatigue, distractions, or performance anxiety."
}
```


**Rules**:
- No auto-grading (user self-evaluates with quality rating)
- Provide 2-3 sample answers for guidance
- Explanation shows key concepts to include


### 3. Scenario-Based (MCQ variant)
**Use for**: Applying knowledge to realistic situations


**Format**:
```json
{
  "type": "mcq",
  "question": "Your partner seems distant during intimacy. According to Sue Johnson's EFT, what's the best first response?",
  "options": [
    "Ask 'Are you okay? What's on your mind?' and listen without judgment",
    "Try a different technique to increase arousal",
    "Assume they're not interested and stop",
    "Continue and hope they'll relax"
  ],
  "correctIndex": 0,
  "explanation": "EFT emphasizes emotional attunement. Checking in verbally creates safety and addresses potential attachment concerns."
}
```


### 4. Reflection Prompts (Short Answer variant)
**Use for**: Metacognition, personal application


**Format**:
```json
{
  "type": "short_answer",
  "question": "Reflect: How might implementing a 20-second hug daily affect your emotional connection?",
  "sampleAnswers": [
    "It could increase oxytocin and create a moment of presence",
    "It might help us slow down and reconnect amid busy schedules"
  ],
  "explanation": "Reflection prompts have no single 'correct' answer. The goal is to think deeply about personal application."
}
```


## Question Quality Guidelines


### Single Concept Rule
 Bad: "According to Basson and Nagoski, which model describes responsive desire and what are the key accelerators?"
 Good: "Basson's model suggests female desire often emerges from which process?"


### Plausible Distractors
 Bad distractors: "Eating pizza", "Watching TV" (obviously wrong in sexual context)
 Good distractors: "Spontaneous desire", "Goal-oriented arousal" (plausible but incorrect)


### Clear Correct Answer
- Only ONE defensibly correct option
- No ambiguity (unless testing judgment)
- Explanation justifies why correct


### Appropriate Difficulty
- **Knowledge**: Direct recall from lesson
- **Comprehension**: Explain in own words
- **Application**: Use in new scenario
- **Analysis**: Compare/contrast concepts


### Respectful Tone
- No TMI (too much information)
- Use clinical terminology when needed
- Frame intimacy in consent-first language
- Avoid male-centric or coercive framing


## Seed Content Structure


### Topic 1: Communication Foundations
**Lessons**:
1. Active Listening & Bids for Connection (Gottman)
2. Consent Conversations & Boundaries


**Sample Questions**:
- MCQ: "What is a 'bid' in Gottman's terminology?"
- Scenario: "Your partner mentions feeling tired. How do you 'turn towards' this bid?"
- Reflection: "When was the last time you turned away from a bid? What happened?"


### Topic 2: Understanding Arousal
**Lessons**:
1. Dual Control Model (Nagoski)
2. Responsive vs. Spontaneous Desire (Basson)


**Sample Questions**:
- MCQ: "Which is an example of an 'accelerator' in the Dual Control Model?"
- Short Answer: "List two brakes you've personally experienced."
- Scenario: "Your partner rarely initiates. Given Basson's model, what might explain this?"


### Topic 3: Mindfulness & Presence
**Lessons**:
1. Sensate Focus Basics (Masters & Johnson)
2. Mindfulness for Intimacy (Brotto)


**Sample Questions**:
- MCQ: "What is the primary goal of sensate focus exercises?"
- Short Answer: "Describe one way to bring mindfulness into a touch session."
- Reflection: "What distractions pull you out of presence during intimacy?"
