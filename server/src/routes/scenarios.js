const express = require('express');
const store = require('../data/store');
const caseStudies = require('../data/caseStudiesData');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, concept, difficulty } = req.query;
    const scenarios = await store.listScenarios({ q, concept, difficulty });
    res.json(scenarios);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const scenario = await store.addScenario(req.body);
    res.status(201).json(scenario);
  } catch (error) {
    next(error);
  }
});

router.get('/case-studies', async (req, res, next) => {
  try {
    const caseStudies = await store.listCaseStudies();
    res.json(caseStudies);
  } catch (error) {
    next(error);
  }
});

router.post('/case-studies', async (req, res, next) => {
  try {
    const newStudy = await store.addCaseStudy(req.body);
    res.status(201).json(newStudy);
  } catch (error) {
    next(error);
  }
});

router.post('/evaluate-logic', async (req, res, next) => {
  try {
    const { scenarioId, userLogicText, selectedChips } = req.body;
    const caseStudies = await store.listCaseStudies();
    const scenario = caseStudies.find(s => parseInt(s.id) === parseInt(scenarioId));
    if (!scenario) return res.status(404).json({ success: false, message: 'Scenario not found' });

    // Basic Heuristic Engine
    const combinedText = `${userLogicText || ''} ${(selectedChips || []).join(' ')}`.toLowerCase();
    
    let score = 30; // Base score for participating
    let matchCount = 0;
    
    const keywords = scenario.conceptKeywords || scenario.targetKeywords || [];
    keywords.forEach(keyword => {
      if (combinedText.includes(keyword.toLowerCase())) {
        score += 15;
        matchCount++;
      }
    });

    const conceptMatch = matchCount >= 2;
    score = Math.min(score, 100);

    let aiFeedback = "";
    if (conceptMatch) {
      aiFeedback = `Spot on! Your logical breakdown hits the core requirements. In Python, this exact construct is mapped to: ${scenario.targetConcept}.`;
    } else {
      aiFeedback = `You are on the right track, but consider how properties like uniqueness, key-mapping, or scope visibility apply here. The optimal Python solution relates to ${scenario.targetConcept}.`;
    }

    res.json({
      success: true,
      discoveredConcept: conceptMatch ? scenario.targetConcept : "Concept not fully discovered yet",
      score,
      conceptMatch,
      aiFeedback,
      nextScenarioId: null // Let frontend handle next logic to avoid index issues with dynamic DB
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const scenario = await store.getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
    res.json(scenario);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const scenario = await store.updateScenario(req.params.id, req.body);
    if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
    res.json(scenario);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const success = await store.deleteScenario(req.params.id);
    if (!success) return res.status(404).json({ message: 'Scenario not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
