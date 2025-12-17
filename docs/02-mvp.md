# MVP Definition: Vertical Slice Features


## Scope: Single-Page "Vertical Slice"
The MVP delivers ONE complete learning loop to prove the core value proposition:


**Topic -> Lesson -> Quiz -> Spaced Review -> Weekly Summary**


### In Scope (MVP v0.1)
1. **Browse Topics**: List 3 seed topics from PDF corpus
2. **Read Lesson**: Markdown-rendered content with clear learning objectives
3. **Take Quiz**: 5-question quiz (MCQ + short answer) with immediate feedback
4. **Schedule Reviews**: SM-2 algorithm schedules future reviews based on performance
5. **Complete Reviews**: Daily review queue of due questions
6. **Log Rituals**: Simple checklist for daily/weekly connection activities
7. **View Dashboard**: Today's plan (reviews due + next lesson + ritual reminder)
8. **Weekly Summary**: Basic analytics (streak, mastery %, weakest topics)


### Out of Scope (Future Iterations)
- Multi-user support (start single-user/local)
- Mobile apps (web-first)
- Cloud sync
- Advanced analytics/ML
- Gamification beyond streaks
- Social features
- Video/audio content
- Advanced question types (drag-drop, matching)
- Content authoring UI (start with seed scripts)


### Technical Constraints
- **Local-first**: SQLite database, no cloud required
- **Privacy**: No telemetry, no external API calls
- **Performance**: <2s page loads, <500ms interactions
- **Accessibility**: WCAG 2.1 AA compliance


### Launch Criteria
- [ ] 3 topics, 2 lessons each, 5 questions per lesson (30 questions total)
- [ ] Quiz -> Review loop functional end-to-end
- [ ] Scheduler correctly implements SM-2
- [ ] Dashboard shows accurate "today's plan"
- [ ] 90%+ test coverage on scheduling logic
- [ ] Zero data loss on app restart
