export const processReport = (text, userLocation = 'Unknown') => {
  const lowerText = text.toLowerCase();
  
  // 1. Keyword Classification for Type
  let type = "general";
  if (/(injur|hospital|doctor|medic|blood|pain|wound)/.test(lowerText)) {
    type = "Medical";
  } else if (/(food|hungry|ration|water|starv|meal)/.test(lowerText)) {
    type = "Food";
  } else if (/(shelter|homeless|tent|sleep|evacuat|house)/.test(lowerText)) {
    type = "Shelter";
  }

  // 2. People Count Extraction
  let people_affected = 1; // Default
  const peopleMatch = lowerText.match(/(\d+)\s*(people|families|persons|civilians|kids|children|men|women)/);
  if (peopleMatch && peopleMatch[1]) {
    people_affected = parseInt(peopleMatch[1], 10);
  } else {
    // Try catching standalone numbers if no specific keyword matched, but this is risky
    // So stick to a fallback of 1 if regex fails
  }

  // 3. Urgency Detection
  let urgency = 2; // Default Low (2)
  if (/(urgent|critical|immediate|emergency|dying|fatal|severe)/.test(lowerText)) {
    urgency = 5; // High (5)
  } else if (/(needed soon|required|soon|please|help)/.test(lowerText)) {
    urgency = 3; // Medium (3)
  }

  // 4. Location Extraction (Basic named entity fallback or keyword 'in [Location]')
  let location = userLocation;
  const locMatch = lowerText.match(/in ([a-zA-Z\s]+)(?:,|!|\.|$)/);
  if (locMatch && locMatch[1]) {
    location = locMatch[1].trim();
  }

  // Confidence calculation (Mock heuristic for UI feedback)
  let confidence = 100;
  if (type === "general") confidence -= 25;
  if (!peopleMatch) confidence -= 25;
  if (location === 'Unknown') confidence -= 20;

  return {
    type,
    urgency,
    people_affected,
    location,
    description: text,
    confidence: Math.max(confidence, 15) // minimum 15%
  };
};
