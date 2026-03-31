import { useState } from 'react';
import EmailCapture from './components/EmailCapture';
import GuidedQuestions from './components/GuidedQuestions';
import ReviewDisplay from './components/ReviewDisplay';
import SuccessScreen from './components/SuccessScreen';
import ProgressIndicator from './components/ProgressIndicator';
import Dashboard from './components/Dashboard';
import { generateReview } from './utils/reviewGenerator';
import { supabase } from './lib/supabase';
import './App.css';
import './components/Dashboard.css';

function App() {
  const [view, setView] = useState('review');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState(null);
  const [review, setReview] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  const handleEmailSubmit = (userEmail) => {
    setEmail(userEmail);
    setStep(2);
  };

  const handleQuestionsSubmit = async (userAnswers) => {
    setAnswers(userAnswers);

    const generatedReview = generateReview(
      userAnswers.takeaway,
      userAnswers.recommendation,
      userAnswers.standout
    );
    setReview(generatedReview);

    try {
      const { data, error } = await supabase
        .from('review_attempts')
        .insert({
          email: email,
          takeaway: userAnswers.takeaway,
          recommendation: userAnswers.recommendation,
          standout: userAnswers.standout,
          review_generated: true,
          copied: false
        })
        .select()
        .maybeSingle();

      if (data) {
        setAttemptId(data.id);
      }

      if (error) {
        console.error('Error tracking review generation:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    }

    setStep(3);
  };

  const handleCopy = async () => {
    if (attemptId) {
      try {
        await supabase
          .from('review_attempts')
          .update({ copied: true })
          .eq('id', attemptId);
      } catch (err) {
        console.error('Error updating copy status:', err);
      }
    }
  };

  const handleNext = () => {
    setStep(4);
  };

  const handleAmazonLinkClick = async () => {
    if (attemptId) {
      try {
        await supabase
          .from('review_attempts')
          .update({ amazon_link_used: true })
          .eq('id', attemptId);
      } catch (err) {
        console.error('Error updating Amazon link status:', err);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <nav style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => setView('review')}
            className={view === 'review' ? 'nav-link' : 'btn-text'}
            style={{ marginRight: '1rem' }}
          >
            Create Review
          </button>
          <button
            onClick={() => setView('dashboard')}
            className={view === 'dashboard' ? 'nav-link' : 'btn-text'}
          >
            Dashboard
          </button>
        </nav>

        {view === 'dashboard' ? (
          <Dashboard />
        ) : (
          <>
            {step < 4 && <ProgressIndicator currentStep={step} />}

            {step === 1 && <EmailCapture onNext={handleEmailSubmit} />}

            {step === 2 && <GuidedQuestions email={email} onNext={handleQuestionsSubmit} />}

            {step === 3 && review && (
              <ReviewDisplay
                shortReview={review.shortReview}
                longReview={review.longReview}
                onCopy={handleCopy}
                onNext={handleNext}
                onAmazonLinkClick={handleAmazonLinkClick}
              />
            )}

            {step === 4 && <SuccessScreen />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
