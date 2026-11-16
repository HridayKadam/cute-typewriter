export const WRITING_PROMPTS = [
  "What made you smile today, even just a little?",
  "Describe a moment today that felt like a warm hug.",
  "If your heart could speak right now, what would it say?",
  "What's something you're grateful for that you usually overlook?",
  "Write about a smell, sound, or texture that brought you comfort today.",
  "What would you tell your past self from one year ago?",
  "List three tiny beautiful things you noticed today.",
  "What dream has been visiting your thoughts lately?",
  "Describe your perfect cozy evening.",
  "What are you learning about yourself this season?",
];

export const DAILY_QUOTES = [
  { text: "And still, after all this time, the sun never says to the earth, 'You owe me.'", author: "Hafiz" },
  { text: "Keep some room in your heart for the unimaginable.", author: "Mary Oliver" },
  { text: "What is done in love is done well.", author: "Vincent van Gogh" },
  { text: "The world is full of magic things, patiently waiting for our senses to grow sharper.", author: "W.B. Yeats" },
  { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
  { text: "She wasn't looking for a knight. She was looking for a sword.", author: "Atticus" },
  { text: "To write is human, to edit is divine.", author: "Stephen King" },
];

export const MOODS = [
  { id: "blissful", emoji: "🌸", label: "Blissful", color: "#f4c4c8" },
  { id: "peaceful", emoji: "☁️", label: "Peaceful", color: "#c9d8e8" },
  { id: "hopeful", emoji: "✨", label: "Hopeful", color: "#e8d4a8" },
  { id: "tender", emoji: "💗", label: "Tender", color: "#ffc4d0" },
  { id: "wistful", emoji: "🌙", label: "Wistful", color: "#b8a9c9" },
  { id: "dreamy", emoji: "🦋", label: "Dreamy", color: "#a8d8e8" },
  { id: "grateful", emoji: "🍯", label: "Grateful", color: "#e8c9a0" },
  { id: "melancholy", emoji: "🌧️", label: "Melancholy", color: "#9aabbb" },
] as const;

export function promptForDate(d = new Date()) {
  const idx = (d.getDate() + d.getMonth() * 31) % WRITING_PROMPTS.length;
  return WRITING_PROMPTS[idx];
}

export function quoteForDate(d = new Date()) {
  const idx = (d.getDate() + d.getFullYear()) % DAILY_QUOTES.length;
  return DAILY_QUOTES[idx];
}