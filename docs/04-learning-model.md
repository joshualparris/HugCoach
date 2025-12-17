# Learning Model Specification


## Evidence-Based Principles


### 1. Retrieval Practice
**Research basis**: Roediger & Karpicke (2006) - Testing effect shows retrieval strengthens memory more than re-reading.


**Implementation**:
- Every lesson followed by quiz (forced retrieval)
- Reviews re-test knowledge at intervals
- No "peek at answer" option during initial attempt
- Feedback only after committing to answer


### 2. Spaced Repetition
**Research basis**: Ebbinghaus forgetting curve - retention improves with spaced reviews.


**Implementation**:
- SM-2 algorithm (Wozniak, 1990)
- Intervals: 1 day -> 6 days -> 14 days -> 30 days -> ... (exponential)
- Lapses reset to short intervals
- Optimal spacing prevents both forgetting and wasted reviews


### 3. Interleaving
**Research basis**: Mixed practice improves discrimination and transfer.


**Implementation**:
- Review queue mixes questions from different topics
- No topic-blocked study sessions
- Daily plan suggests variety (not all same topic)


### 4. Immediate Feedback
**Research basis**: Feedback timing affects learning (Kulik & Kulik meta-analysis).


**Implementation**:
- Answer -> Immediate correct/incorrect + explanation
- Quality rating prompts metacognition
- No delayed feedback (common LMS mistake)


### 5. Reflection
**Research basis**: Metacognitive prompts improve transfer (Schraw, 1998).


**Implementation**:
- Post-quiz reflection: "What was hardest?"
- Weekly summary prompts: "How will you apply this?"
- Ritual logs include notes field


### 6. Overlearning
**Research basis**: Continued practice after mastery improves retention.


**Implementation**:
- "Mastered" items still appear in reviews (longer intervals)
- No "retirement" of questions
- Gradual interval increases cap at ~180 days


## Daily Loop (10-15 minutes)
**Target time**: 10-15 min/day for sustainable habit.


**Flow**:
1. **Check Dashboard** (30s): See reviews due + ritual status
2. **Complete Reviews** (5-10 min): Clear due queue (target: 10-15 reviews/day)
3. **Log Ritual** (2 min): Quick check-in activity
4. **Optional: New Lesson** (if time remains)


**Triggers**:
- Push notification (if enabled): "5 reviews due today"
- Streak indicator: "7-day streak! Keep it going"


## Weekly Loop (30-60 minutes)
**Target time**: 30-60 min once per week for deeper learning.


**Flow**:
1. **New Lessons** (20-30 min): Complete 1-2 new lessons + quizzes
2. **Weekly Ritual** (20-30 min): Longer connection activity (date night, sensate focus)
3. **Review Summary** (5-10 min): Check analytics, note weak areas


**Triggers**:
- Sunday evening prompt: "Plan your week"
- Weekly email (if enabled): "This week's focus: [topic]"


## Mastery Progression Model


### Stages
1. **Novice** (0-40%): High error rate, short intervals
2. **Intermediate** (41-70%): Improving consistency
3. **Proficient** (71-89%): Stable recall
4. **Mastery** (90-100%): Long intervals, rare errors


### Topic Mastery Calculation
```
Mastery = ( question_mastery) / total_questions
Question Mastery = (easinessFactor - 1.3) / (2.5 - 1.3) * 100
```
- EF 1.3 -> 0% mastery
- EF 2.5 -> 100% mastery


### Advancement Gates
- **Unlock next topic**: 70%+ mastery on prerequisite topics
- **Weekly summary**: Only appears after 7+ days of activity
