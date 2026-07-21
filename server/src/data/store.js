const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'db.json');

async function ensureDb() {
  try {
    await fs.access(dbPath);
    // Ensure arrays exist in existing DBs
    const raw = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(raw);
    let changed = false;
    if (!db.users) { db.users = []; changed = true; }
    if (!db.caseStudies) { 
      const defaultCaseStudies = require('./caseStudiesData');
      db.caseStudies = defaultCaseStudies; 
      changed = true; 
    }
    if (changed) {
      await writeDb(db);
    }
  } catch {
    const defaultCaseStudies = require('./caseStudiesData');
    await writeDb({ scenarios: [], sessions: [], users: [], caseStudies: defaultCaseStudies });
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(data) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function now() {
  return new Date().toISOString();
}

function createRecord(input) {
  const timestamp = now();
  return {
    _id: crypto.randomUUID(),
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

async function listScenarios(filters = {}) {
  const db = await readDb();
  let scenarios = [...db.scenarios];
  if (filters.difficulty) scenarios = scenarios.filter((item) => item.difficulty === filters.difficulty);
  if (filters.concept) scenarios = scenarios.filter((item) => item.concepts.includes(filters.concept));
  if (filters.q) {
    const query = filters.q.toLowerCase();
    scenarios = scenarios.filter((item) => (
      item.title.toLowerCase().includes(query) ||
      item.context.toLowerCase().includes(query) ||
      item.concepts.some((concept) => concept.toLowerCase().includes(query))
    ));
  }
  return scenarios.sort((a, b) => (b.effectivenessScore || 0) - (a.effectivenessScore || 0));
}

async function getScenario(id) {
  const db = await readDb();
  return db.scenarios.find((scenario) => scenario._id === id) || null;
}

async function addScenario(input) {
  const db = await readDb();
  const scenario = createRecord(input);
  db.scenarios.push(scenario);
  await writeDb(db);
  return scenario;
}

async function updateScenario(id, input) {
  const db = await readDb();
  const index = db.scenarios.findIndex((s) => s._id === id);
  if (index === -1) return null;
  
  db.scenarios[index] = {
    ...db.scenarios[index],
    ...input,
    updatedAt: now()
  };
  await writeDb(db);
  return db.scenarios[index];
}

async function deleteScenario(id) {
  const db = await readDb();
  const index = db.scenarios.findIndex((s) => s._id === id);
  if (index === -1) return false;
  
  db.scenarios.splice(index, 1);
  await writeDb(db);
  return true;
}

async function listSessions() {
  const db = await readDb();
  return db.sessions
    .map((session) => ({
      ...session,
      scenario: db.scenarios.find((scenario) => scenario._id === session.scenario) || null
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function addSession(input) {
  const db = await readDb();
  const session = createRecord(input);
  db.sessions.push(session);
  await writeDb(db);
  return {
    ...session,
    scenario: db.scenarios.find((scenario) => scenario._id === session.scenario) || null
  };
}

async function getUserByUsername(username) {
  const db = await readDb();
  return db.users.find((u) => u.username === username) || null;
}

async function getUserByEmail(email) {
  const db = await readDb();
  return db.users.find((u) => u.email === email) || null;
}

async function addUser(input) {
  const db = await readDb();
  const user = createRecord(input);
  db.users.push(user);
  await writeDb(db);
  return user;
}

async function listCaseStudies() {
  const db = await readDb();
  return db.caseStudies || [];
}

async function addCaseStudy(input) {
  const db = await readDb();
  const newStudy = {
    id: Date.now(),
    title: input.title,
    description: input.description,
    availableChips: input.availableChips || [],
    targetConcept: input.targetConcept,
    targetKeywords: input.targetKeywords || []
  };
  
  if (!db.caseStudies) {
    db.caseStudies = [];
  }
  
  db.caseStudies.push(newStudy);
  await writeDb(db);
  return newStudy;
}

async function resetData(scenarios) {
  await writeDb({
    scenarios: scenarios.map((scenario) => createRecord(scenario)),
    sessions: [],
    users: []
  });
}

module.exports = {
  addScenario,
  addSession,
  getScenario,
  updateScenario,
  deleteScenario,
  listScenarios,
  listSessions,
  getUserByUsername,
  getUserByEmail,
  addUser,
  listCaseStudies,
  addCaseStudy,
  readDb,
  resetData
};
