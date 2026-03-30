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
    <div className="card card-wide">
      <h2 className="heading-lg">Tell us about your experience</h2>
      <p className="text-muted">Your answers will help us craft an authentic review</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="form-group">
            <label htmlFor={question.id} className="form-label">
              {index + 1}. {question.label}
            </label>
            <textarea
              id={question.id}
              value={answers[question.id]}
              onChange={(e) => handleChange(question.id, e.target.value)}
              rows={4}
              className="form-textarea"
              placeholder={question.placeholder}
            />
            {errors[question.id] && (
              <p className="error-message">{errors[question.id]}</p>
            )}
          </div>
        ))}

        <button type="submit" className="btn btn-primary">
          Generate My Review
        </button>
      </form>
    </div>
  );
}
