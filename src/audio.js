// ==========================================
// AUDIO SYNTHESIZER
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const sfx = (type) => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); 
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    
    if (type === 'shoot') {
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(600, now); 
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.05, now); 
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'boom') {
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(150, now); 
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
        gain.gain.setValueAtTime(0.1, now); 
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'powerup') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(400, now); 
        osc.frequency.linearRampToValueAtTime(800, now + 0.1); 
        osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.1, now); 
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    }
};
