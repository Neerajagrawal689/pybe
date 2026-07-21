const express = require('express');
const store = require('../data/store');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const [sessions, db] = await Promise.all([store.listSessions(), store.readDb()]);
    const scenarioCount = db.scenarios.length;
    const conceptCounts = {};
    const misconceptionCounts = {};
    let promptTotal = 0;

    sessions.forEach((session) => {
      promptTotal += session.promptScore || 0;
      session.abstractionMap.forEach((map) => {
        conceptCounts[map.pythonConcept] = (conceptCounts[map.pythonConcept] || 0) + 1;
      });
      session.misconceptions.forEach((item) => {
        misconceptionCounts[item] = (misconceptionCounts[item] || 0) + 1;
      });
    });

    res.json({
      scenarioCount,
      sessionCount: sessions.length,
      averagePromptScore: sessions.length ? Math.round(promptTotal / sessions.length) : 0,
      conceptCounts,
      misconceptionCounts,
      recentSessions: sessions.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/students', async (req, res, next) => {
  try {
    const [sessions] = await Promise.all([store.listSessions()]);
    
    const studentData = {};
    
    sessions.forEach(session => {
      const name = session.learnerName || 'Guest learner';
      if (!studentData[name]) {
        studentData[name] = {
          name,
          totalSessions: 0,
          totalPromptScore: 0,
          uniqueConcepts: new Set()
        };
      }
      studentData[name].totalSessions += 1;
      studentData[name].totalPromptScore += session.promptScore || 0;
      if (session.abstractionMap) {
        session.abstractionMap.forEach(map => {
          studentData[name].uniqueConcepts.add(map.pythonConcept);
        });
      }
    });

    const students = Object.values(studentData).map(student => ({
      name: student.name,
      totalSessions: student.totalSessions,
      averagePromptScore: student.totalSessions ? Math.round(student.totalPromptScore / student.totalSessions) : 0,
      conceptsLearned: student.uniqueConcepts.size
    }));

    res.json(students);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
