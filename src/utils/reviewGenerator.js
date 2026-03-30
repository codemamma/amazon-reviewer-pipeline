export function generateReview(takeaway, recommendation, standout) {
  const shortReview = generateShortReview(takeaway, recommendation, standout);
  const longReview = generateLongReview(takeaway, recommendation, standout);

  return { shortReview, longReview };
}

function generateShortReview(takeaway, recommendation, standout) {
  const templates = [
    `This book gave me a clear perspective on ${takeaway.toLowerCase()}. I especially found ${standout.toLowerCase()} valuable. I would highly recommend it to ${recommendation.toLowerCase()}.`,

    `${takeaway} - that's what I took away from this book. What really stood out was ${standout.toLowerCase()}. If you're ${recommendation.toLowerCase()}, this is a must-read.`,

    `I found this book incredibly insightful, especially regarding ${takeaway.toLowerCase()}. ${standout} really resonated with me. Perfect for ${recommendation.toLowerCase()}.`
  ];

  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

function generateLongReview(takeaway, recommendation, standout) {
  return `I recently finished this book and wanted to share my thoughts.

My biggest takeaway was ${takeaway.toLowerCase()}. This insight alone made the book worth reading and gave me a new way to think about things.

What really stood out to me was ${standout.toLowerCase()}. The author's approach to this topic felt fresh and genuine, not like the typical self-help fluff you see everywhere.

I think this book would be especially valuable for ${recommendation.toLowerCase()}. If that's you, I'd definitely recommend picking this up.

Overall, it's a solid read that delivers practical value without being preachy. The writing style is conversational and easy to follow, which I appreciated. Worth your time if you're looking for actionable insights.`;
}
