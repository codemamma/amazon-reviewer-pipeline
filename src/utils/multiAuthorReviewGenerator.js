export function generateReview(takeaway, recommendation, standout, bookTitle) {
  const shortReview = generateShortReview(takeaway, recommendation, standout, bookTitle);
  const longReview = generateLongReview(takeaway, recommendation, standout, bookTitle);

  return {
    shortReview,
    longReview
  };
}

function generateShortReview(takeaway, recommendation, standout, bookTitle) {
  const templates = [
    `I found ${bookTitle} to be genuinely insightful. ${takeaway} What really stood out was ${standout} I'd especially recommend this to ${recommendation}`,

    `${bookTitle} delivered more than I expected. ${takeaway} The part about ${standout} really resonated with me. If you're ${recommendation}, this is worth your time.`,

    `This book gave me a clearer perspective on things. ${takeaway} ${standout} was particularly well done. I think ${recommendation} would get a lot out of this.`,

    `I picked up ${bookTitle} hoping to learn something new, and it delivered. ${takeaway} What struck me most was ${standout} Definitely recommend it if you're ${recommendation}`,

    `${bookTitle} is a thoughtful and practical read. ${takeaway} I was impressed by ${standout} This would be perfect for ${recommendation}`
  ];

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

  return cleanText(randomTemplate);
}

function generateLongReview(takeaway, recommendation, standout, bookTitle) {
  const intros = [
    `I recently finished ${bookTitle} and wanted to share my thoughts.`,
    `${bookTitle} was one of those reads that stayed with me after I finished it.`,
    `I went into ${bookTitle} with moderate expectations and came away pleasantly surprised.`,
    `I'd heard good things about ${bookTitle}, and I'm glad I finally picked it up.`,
    `${bookTitle} caught my attention, and I'm happy to say it was worth the read.`
  ];

  const transitions = [
    'One of my biggest takeaways was this:',
    'The main thing that stuck with me was:',
    'What really resonated was:',
    'The core message I took away:',
    'Here\'s what I found most valuable:'
  ];

  const standoutIntros = [
    'What stood out most to me was',
    'I was particularly impressed by',
    'The highlight for me was definitely',
    'One thing that really caught my attention was',
    'What I found most compelling was'
  ];

  const conclusions = [
    'Overall, I think this is a solid read.',
    'All in all, I\'d call this a worthwhile read.',
    'I\'m glad I took the time to read this.',
    'This one\'s worth your time if it sounds interesting to you.',
    'I\'d recommend giving this a shot if you\'re curious.'
  ];

  const intro = intros[Math.floor(Math.random() * intros.length)];
  const transition = transitions[Math.floor(Math.random() * transitions.length)];
  const standoutIntro = standoutIntros[Math.floor(Math.random() * standoutIntros.length)];
  const conclusion = conclusions[Math.floor(Math.random() * conclusions.length)];

  const longReview = `${intro}

${transition} ${takeaway}

${standoutIntro} ${standout} It added real depth to the reading experience.

I'd recommend ${bookTitle} to ${recommendation} It's well-written, engaging, and offers practical insights you can actually use.

${conclusion}`;

  return cleanText(longReview);
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .trim();
}
