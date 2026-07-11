import React, { useState, useEffect, useRef } from 'react';

const HydrationBuddy = () => {
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [drinksCount, setDrinksCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [walkingFrameIndex, setWalkingFrameIndex] = useState(0);
  const [windowPosition, setWindowPosition] = useState({ y: window.innerHeight });
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  const walkingFrames = ['🚶', '🧘', '🏃', '🧘'];

  // Main timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowReminder(true);
          return intervalMinutes;
        }
        return prev - 1;
      });
    }, 60000); // 1 minute

    return () => clearInterval(timerRef.current);
  }, [intervalMinutes]);

  // Animation effect for reminder window
  useEffect(() => {
    if (!showReminder) return;

    const startY = window.innerHeight;
    const targetY = window.innerHeight - 550;
    let currentY = startY;
    let frameIndex = 0;

    const animate = () => {
      if (currentY > targetY) {
        currentY = Math.max(targetY, currentY - 20);
        setWindowPosition({ y: currentY });
        setWalkingFrameIndex(frameIndex % walkingFrames.length);
        frameIndex++;
        animationRef.current = setTimeout(animate, 50);
      }
    };

    animate();
    return () => clearTimeout(animationRef.current);
  }, [showReminder, walkingFrames.length]);

  const handleSetInterval = (minutes) => {
    setIntervalMinutes(minutes);
    setTimeLeft(minutes);
    setIsSnoozed(false);
  };

  const handleDrink = () => {
    setDrinksCount(prev => prev + 1);
    setTimeLeft(intervalMinutes);
    setIsSnoozed(false);
    setShowReminder(false);
  };

  const handleSnooze = () => {
    setTimeLeft(5);
    setIsSnoozed(true);
    setShowReminder(false);
  };

  const handleTestReminder = () => {
    setShowReminder(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Control Panel */}
      <div style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ background: '#667eea', padding: '30px 20px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>💧 Hydration Buddy</div>
          <div style={{ fontSize: '14px', color: '#e0e0ff' }}>Stay hydrated while you code</div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
          {/* Interval Selection */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>
              Reminder Interval
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[15, 20, 30, 45, 60].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => handleSetInterval(minutes)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: intervalMinutes === minutes ? '#667eea' : 'white',
                    color: intervalMinutes === minutes ? 'white' : '#333',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Next drink in</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '4px' }}>
                {timeLeft}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>minutes</div>
            </div>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Times hydrated</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#26d0ce', marginBottom: '4px' }}>
                {drinksCount}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>today</div>
            </div>
          </div>

          {/* Test Button */}
          <button
            onClick={handleTestReminder}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px',
              background: '#667eea',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'background 0.3s ease',
            }}
            onMouseOver={e => e.target.style.background = '#5568d3'}
            onMouseOut={e => e.target.style.background = '#667eea'}
          >
            🧪 Test Reminder (Click here)
          </button>

          {/* Timer Status */}
          <div style={{ fontSize: '13px', color: '#666', textAlign: 'center' }}>
            ⏱ {isSnoozed ? `Snoozed - reminder in ${timeLeft} minute${timeLeft !== 1 ? 's' : ''}` : `Timer active - reminder in ${timeLeft} minute${timeLeft !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px 12px 0 0',
              padding: '30px 20px',
              width: '100%',
              maxWidth: '450px',
              textAlign: 'center',
              boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
              animation: 'slideUp 0.4s ease-out',
            }}
          >
            {/* Emoji Animation */}
            <div style={{ fontSize: '80px', marginBottom: '20px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {walkingFrames[walkingFrameIndex]}
            </div>

            {/* Title */}
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#1a1a1a' }}>
              Time to hydrate!
            </h2>

            {/* Message */}
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Your brain works better when you're hydrated.
              <br />
              Take a sip of water and keep coding! 🚀
            </p>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={handleDrink}
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#26d0ce',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                }}
                onMouseOver={e => e.target.style.background = '#1bb8b6'}
                onMouseOut={e => e.target.style.background = '#26d0ce'}
              >
                ✓ Yes, let me drink
              </button>
              <button
                onClick={handleSnooze}
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#f0f0f0',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                }}
                onMouseOver={e => e.target.style.background = '#e0e0e0'}
                onMouseOut={e => e.target.style.background = '#f0f0f0'}
              >
                ⏱ Snooze 5m
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default HydrationBuddy;
