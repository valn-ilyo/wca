/**
 * Stop words filtered out before computing top-word frequency.
 *
 * Intentionally omits slang/idiolect variants (lel, idk, cuz, dang, ouk…)
 * so those can still surface as characteristic words per participant.
 */
export const STOP_WORDS = new Set([
  // Pronouns
  "i", "you", "he", "she", "we", "they",
  "me", "him", "her", "them", "us", "it",
  "my", "your", "his", "our", "their", "its",
  "mine", "yours", "ours", "theirs",
  "myself", "yourself", "himself", "herself", "ourselves", "themselves", "itself",
  "this", "that", "these", "those",
  "who", "whom", "which", "what",
  "something", "someone", "anything", "anyone", "everything", "everyone", "nothing", "nobody",

  // Articles & conjunctions
  "the", "a", "an",
  "and", "or", "but", "so", "yet", "nor",
  "both", "either", "neither", "not",

  // Prepositions
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
  "into", "through", "during", "before", "after", "above", "below", "between",
  "out", "off", "over", "under", "again", "then", "once",
  "up", "down", "about", "against", "along", "around", "near",
  "per", "since", "until", "within",

  // Common verbs
  "is", "are", "was", "were", "be", "been", "being", "am",
  "have", "has", "had", "having",
  "do", "does", "did", "done", "doing",
  "will", "would", "shall", "should", "may", "might", "must", "can", "could",
  "go", "went", "gone",
  "get", "got", "gotten", "getting",
  "know", "knew", "think", "thought",
  "see", "saw", "come", "came",
  "say", "said", "tell", "told",
  "ask", "asked", "make", "made",
  "take", "took", "want", "need",
  "use", "used", "let", "try", "keep", "put",
  "seem", "feel", "felt",
  "leave", "left", "call", "send", "sent",
  "give", "gave", "show", "find", "found", "look", "mean",
  "start", "started", "stop", "stopped",
  "talk", "talked", "stay",
  "turned", "turn", "become", "became",
  "bring", "brought",

  // Contractions (apostrophe-stripped)
  "dont", "doesnt", "didnt", "cant", "wont",
  "shouldnt", "wouldnt", "couldnt",
  "isnt", "arent", "wasnt", "werent",
  "hasnt", "havent", "hadnt",
  "im", "ive", "id", "ill",
  "youre", "youve", "youd", "youll",
  "hes", "shes", "its",
  "were", "theyre", "theyve", "theyd", "theyll",
  "weve", "wed", "well", "lets",
  "thats", "whats", "whos", "hows", "whens", "wheres", "theres", "heres",
  "couldve", "wouldve", "shouldve", "mightve", "mustve",

  // Conversational fillers & affirmations
  "yes", "yeah", "yep", "yup", "yea",
  "nope", "nah", "no",
  "ok", "okay", "alright", "sure", "right",
  "fine", "good", "great", "nice", "cool",
  "wow", "oh", "ah", "uh", "um", "hmm", "hm",
  "hey", "hi", "hello", "bye",
  "haha", "lol", "hahaha", "lmao", "omg",
  "tbh", "btw", "ngl", "imo",

  // Adverbs & qualifiers
  "just", "also", "very", "really", "too",
  "more", "most", "less", "much", "many",
  "some", "any", "all", "both", "few", "other",
  "only", "even", "still", "already",
  "always", "never", "often",
  "now", "here", "there",
  "when", "where", "how", "why",
  "well", "back",
  "actually", "maybe", "probably", "basically", "literally", "anyway", "though",
  "like", "one", "two",
  "first", "last", "next",
  "new", "old", "same", "own", "every", "each",

  // WhatsApp system message noise
  "message", "deleted", "null", "missed",
  "voice", "video", "call",
  "joined", "added", "removed", "left", "changed",
  "group", "image", "sticker", "audio", "document", "contact", "location",
]);
