import { useState } from 'react';

export default function GuidedQuestions({ email, onNext }) {
  const [answers, setAnswers] = useState({
    takeaway: '',
    recommendation: '',
    standout: ''
  });
  const [errors, setErrors] = useState({});

  const questions = [
    {
      id: 'takeaway',
      label: 'What was your biggest takeaway from the book?',
      placeholder: 'E.g., How to turn fear into action...'
    },
    {
      id: 'recommendation',
      label: 'Who would you recommend this book to?',
      placeholder: 'E.g., Anyone struggling with self-doubt...'
    },
    {
      id: 'standout',
      label: 'What stood out most?',
      placeholder: 'E.g., The practical exercises and real examples...'
    }
  ];

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!answers.takeaway.trim()) newErrors.takeaway = 'Please answer this question';
    if (!answers.recommendation.trim()) newErrors.recommendation = 'Please answer this question';
    if (!answers.standout.trim()) newErrors.standout = 'Please answer this question';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(answers);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tell us about your experience
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your answers will help us craft an authentic review
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id}>
              <label htmlFor={question.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {index + 1}. {question.label}
              </label>
              <textarea
                id={question.id}
                value={answers[question.id]}
                onChange={(e) => handleChange(question.id, e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-colors"
                placeholder={question.placeholder}
              />
              {errors[question.id] && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors[question.id]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate My Review
          </button>
        </form>
      </div>
    </div>
  );
}
