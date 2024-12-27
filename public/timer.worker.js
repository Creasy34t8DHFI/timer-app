// timer.worker.js
let timerInterval;
let startTime;
let duration;
let targetTime;

self.onmessage = function(e) {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'START':
      startTimer(payload.duration, payload.useTarget, payload.targetTime);
      break;
    case 'STOP':
      stopTimer();
      break;
    case 'RESET':
      resetTimer();
      break;
  }
};

function startTimer(durationMs, useTarget = false, target = null) {
  stopTimer();
  
  startTime = Date.now();
  duration = durationMs * 1000; // konwertujemy sekundy na milisekundy
  targetTime = target;
  
  function tick() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    
    if (useTarget) {
      const remaining = targetTime - currentTime;
      if (remaining <= 0) {
        self.postMessage({ type: 'FINISHED' });
        stopTimer();
        return;
      }
      self.postMessage({ 
        type: 'TICK', 
        payload: { 
          remaining: Math.ceil(remaining / 1000), // konwertujemy milisekundy na sekundy
          progress: 1 - (remaining / duration)
        } 
      });
    } else {
      if (elapsedTime >= duration) {
        self.postMessage({ type: 'FINISHED' });
        stopTimer();
        return;
      }
      self.postMessage({ 
        type: 'TICK', 
        payload: { 
          remaining: Math.ceil((duration - elapsedTime) / 1000), // konwertujemy milisekundy na sekundy
          progress: elapsedTime / duration
        } 
      });
    }
  }

  timerInterval = setInterval(tick, 100); // Update co 100ms dla płynności
  tick(); // Natychmiastowa pierwsza aktualizacja
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  startTime = null;
  duration = null;
  targetTime = null;
}