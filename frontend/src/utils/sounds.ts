// Sound file paths
const NOTIFICATION_SOUND_PATH = '/sounds/notification.mp3';
const COMPLETE_SOUND_PATH = '/sounds/complete.mp3';

// Initialize sound effects with error handling
let notificationSound: HTMLAudioElement;
let completeSound: HTMLAudioElement;

try {
  notificationSound = new Audio(NOTIFICATION_SOUND_PATH);
  completeSound = new Audio(COMPLETE_SOUND_PATH);
  
  // Set volume to a comfortable level
  notificationSound.volume = 0.5;
  completeSound.volume = 0.5;
  
  // Preload sounds
  notificationSound.load();
  completeSound.load();
} catch (error) {
  console.error('Error initializing sounds:', error);
}

// Function to handle user interaction requirement
let userInteracted = false;
export const handleUserInteraction = () => {
  userInteracted = true;
  // Try to play and immediately pause to handle autoplay restriction
  const playAndPause = async () => {
    try {
      // Create temporary Audio objects for initialization
      const tempSound = new Audio(NOTIFICATION_SOUND_PATH);
      tempSound.volume = 0;
      await tempSound.play();
      setTimeout(() => {
        tempSound.pause();
        tempSound.remove();
      }, 100);
    } catch (error) {
      console.warn('Could not initialize audio:', error);
    }
  };
  playAndPause();
};

// Add event listener for user interaction
if (typeof window !== 'undefined') {
  const initializeAudio = () => {
    if (!userInteracted) {
      handleUserInteraction();
    }
  };
  
  window.addEventListener('click', initializeAudio, { once: true });
  window.addEventListener('keydown', initializeAudio, { once: true });
  window.addEventListener('touchstart', initializeAudio, { once: true });
}

export const playNotification = async () => {
  if (!userInteracted) {
    console.warn('Waiting for user interaction before playing sounds');
    return;
  }

  try {
    // Create a new instance for each play to avoid overlapping issues
    const sound = new Audio(NOTIFICATION_SOUND_PATH);
    sound.volume = 0.5;
    await sound.play();
    
    // Clean up after playing
    sound.onended = () => {
      sound.remove();
    };
  } catch (error) {
    console.warn('Unable to play notification sound:', error);
  }
};

export const playComplete = async () => {
  if (!userInteracted) {
    console.warn('Waiting for user interaction before playing sounds');
    return;
  }

  try {
    // Create a new instance for each play to avoid overlapping issues
    const sound = new Audio(COMPLETE_SOUND_PATH);
    sound.volume = 0.5;
    await sound.play();
    
    // Clean up after playing
    sound.onended = () => {
      sound.remove();
    };
  } catch (error) {
    console.warn('Unable to play complete sound:', error);
  }
};

// Export the SoundManager class for compatibility
class SoundManager {
  static async playNotification() {
    await playNotification();
  }

  static async playComplete() {
    await playComplete();
  }
}

export default SoundManager; 