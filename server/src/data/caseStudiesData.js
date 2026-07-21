const caseStudies = [
  {
    id: 1,
    title: "Scenario 1: Massive Event Registration",
    description: "You are managing an online event where 50,000 users are registering. You need to instantly verify if a username is already taken without scanning through a slow list. How would you store and look up these usernames efficiently, and why?",
    targetConcept: "Python Set (HashSet)",
    conceptKeywords: ["unique", "duplicate", "fast", "instant", "hash", "set", "o(1)", "no duplicates"],
    availableChips: ["[Key-Value Pair]", "[No Duplicates]", "[Sequential List]", "[O(1) Lookup]", "[Ordered Array]", "[Global Visibility]"]
  },
  {
    id: 2,
    title: "Scenario 2: Pharmacy Inventory",
    description: "You are building a system for a large pharmacy. When a cashier scans a medicine barcode, the system must instantly retrieve its price, stock quantity, and supplier information. How would you logically link the medicine name/ID to its details for instant access?",
    targetConcept: "Python Dictionary (HashMap)",
    conceptKeywords: ["map", "key", "value", "dictionary", "dict", "lookup", "associate", "link", "hashmap"],
    availableChips: ["[Iterate Everything]", "[Key-Value Mapping]", "[Last In First Out]", "[Instant Retrieval]", "[Index based]"]
  },
  {
    id: 3,
    title: "Scenario 3: Bank Transaction Security",
    description: "You are designing a banking system. The 'Total Bank Reserve' needs to be accessible by every ATM branch to ensure liquidity. However, the 'Current Customer PIN' should only be visible temporarily inside a single transfer routine and destroyed immediately after. How do you conceptually separate these two types of data?",
    targetConcept: "Global vs Local Scope",
    conceptKeywords: ["global", "local", "scope", "function", "everywhere", "restrict", "temporary", "visible"],
    availableChips: ["[Global Variable]", "[Persistent Data]", "[Local Scope]", "[Nested List]", "[Temporary Visibility]"]
  }
];

module.exports = caseStudies;
