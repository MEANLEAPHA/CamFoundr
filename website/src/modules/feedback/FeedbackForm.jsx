import React, { useState } from 'react';
import './FeedbackForm.css';
import toast from 'react-hot-toast';
import {StarOutlined, MessageOutlined, SmileOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export default function FeedbackForm() {
    const [step, setStep] = useState('initial');
    const [feedbackType, setFeedbackType] = useState(null);
    const [score, setScore] = useState(null);
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    // NPS Question: "How likely are you to recommend us?"[reference:1]
    const handleNPSScore = (selectedScore) => {
        setScore(selectedScore);
        setStep('follow-up');
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const payload = {
                feedback_type: feedbackType,
                score: feedbackType !== 'general' ? score : null,
                category: category || null,
                message: message || null,
                page_url: window.location.href
            };

            if (!payload.message) delete payload.message;
            if (!payload.category) delete payload.category;

            await api.post(`/api/feedback`, payload);
            setSubmitStatus('success');
            // Reset form after 3 seconds
            setTimeout(() => {
                setStep('initial');
                setFeedbackType(null);
                setScore(null);
                setMessage('');
                setCategory('');
                setSubmitStatus(null);
            }, 3000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to get follow-up question text based on score
    const getFollowUpQuestion = () => {
        if (feedbackType === 'nps') {
            if (score >= 9) return "That's great to hear! What do you love most about our product?";
            if (score >= 7) return "Good to know. What would make you a 10/10 promoter?";
            return "We're sorry to hear that. What's the main reason for this score?";
        } else if (feedbackType === 'csat') {
            if (score >= 4) return "Wonderful! What's working well for you?";
            if (score === 3) return "Thanks for your honesty. What could we improve?";
            return "We appreciate your honesty. What went wrong?";
        }
        return "Please share your thoughts with us.";
    };

    // Initial selection: NPS, CSAT, or General Feedback
    if (step === 'initial') {
        return (
            <div className="feedback-root">
                <div className="feedback-card">
                    <h2 className="feedback-title">Help Us Build a Better Product</h2>
                    <p className="feedback-subtitle">
                        Your honest feedback helps us prioritize what matters most to you.
                    </p>
                
                    <div className="feedback-type-selector">
                        <button 
                            className="feedback-type-btn"
                            onClick={() => {
                                setFeedbackType('nps');
                                setStep('rating');
                            }}
                        >
                            <span className="type-icon"><StarOutlined /></span>
                            <span className="type-name">Recommendation</span>
                            <span className="type-desc">How likely are you to recommend us?</span>
                        </button>
                        <button 
                            className="feedback-type-btn"
                            onClick={() => {
                                setFeedbackType('csat');
                                setStep('rating');
                            }}
                        >
                            <span className="type-icon"><SmileOutlined /></span>
                            <span className="type-name">Satisfaction</span>
                            <span className="type-desc">Rate your overall satisfaction</span>
                        </button>
                        <button 
                            className="feedback-type-btn"
                            onClick={() => {
                                setFeedbackType('general');
                                setStep('follow-up');
                            }}
                        >
                            <span className="type-icon"><MessageOutlined /></span>
                            <span className="type-name">General Feedback</span>
                            <span className="type-desc">Share ideas, requests, or thoughts</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Rating step (NPS or CSAT)
    if (step === 'rating') {
        const isNPS = feedbackType === 'nps';
        const maxScore = isNPS ? 10 : 5;
        const minLabel = isNPS ? "Not likely" : "Very dissatisfied";
        const maxLabel = isNPS ? "Extremely likely" : "Very satisfied";

        return (
            <div className="feedback-root">
                <div className="feedback-card">
                    <button className="feedback-back-btn" onClick={() => setStep('initial')}>
                       <ArrowLeftOutlined />
                    </button>
                    <h2 className="feedback-title">
                        {isNPS ? "How likely are you to recommend us?" : "How satisfied are you overall?"}
                    </h2>
                    <div className="feedback-scale">
                        <div className="scale-labels">
                            <span>{minLabel}</span>
                            <span>{maxLabel}</span>
                        </div>
                        <div className="scale-buttons">
                            {Array.from({ length: maxScore }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    className={`scale-btn ${score === num ? 'active' : ''}`}
                                    onClick={() => handleNPSScore(num)}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

   if(submitStatus === 'success'){
    toast.success('Thank you! Your feedback has been recorded.');
   }
   if(submitStatus === 'error'){
    toast.error('Something went wrong. Please try again.');
   }

    // Follow-up / message step (applies to all feedback types)
    return (
        <div className="feedback-root">
            <div className="feedback-card">
                <button 
                    className="feedback-back-btn" 
                    onClick={() => feedbackType === 'general' ? setStep('initial') : setStep('rating')}
                >
                    <ArrowLeftOutlined />
                </button>
                
                <h2 className="feedback-title">{getFollowUpQuestion()}</h2>
                
                {feedbackType !== 'general' && (
                    <div className="feedback-score-preview">
                        Your rating: <strong>{score}/{(feedbackType === 'nps' ? 10 : 5)}</strong>
                    </div>
                )}

                {feedbackType === 'general' && (
                    <div className="feedback-category">
                        <label>Category (optional)</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">Select category</option>
                            <option value="feature-idea">New Feature Idea</option>
                            <option value="improvement">Product Improvement</option>
                            <option value="praise">Praise / Kudos</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                )}

                <textarea
                    className="feedback-textarea"
                    rows="5"
                    placeholder="Your detailed feedback helps us tremendously..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <div className="feedback-actions">
                    <button 
                        className="feedback-submit-btn" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Send Feedback'}
                    </button>
                </div>
            </div>
        </div>
    );
}