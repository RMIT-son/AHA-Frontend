// speakerManager.js - Global speaker state management
class SpeakerManager {
    constructor() {
        this.currentSpeaker = null;
        this.listeners = new Set();
    }

    // Register a speaker component
    registerSpeaker(speakerInstance) {
        this.listeners.add(speakerInstance);
    }

    // Unregister a speaker component
    unregisterSpeaker(speakerInstance) {
        this.listeners.delete(speakerInstance);
    }

    // Set the currently active speaker
    setActiveSpeaker(speakerInstance) {
        // Stop the previous speaker if it exists and is different
        if (this.currentSpeaker && this.currentSpeaker !== speakerInstance) {
            this.currentSpeaker.stopFromManager();
        }

        this.currentSpeaker = speakerInstance;
    }

    // Clear the active speaker
    clearActiveSpeaker(speakerInstance) {
        if (this.currentSpeaker === speakerInstance) {
            this.currentSpeaker = null;
        }
    }

    // Stop all speakers
    stopAll() {
        this.listeners.forEach((speaker) => {
            speaker.stopFromManager();
        });
        this.currentSpeaker = null;
    }
}

// Create a singleton instance
const speakerManager = new SpeakerManager();

export default speakerManager;
