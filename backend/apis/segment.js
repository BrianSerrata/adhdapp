import axios from "axios";

const SEGMENT_WRITE_KEY = 'kBwhqL1ZvrzswrUPd1kbbkWHH9IN4GLH';
const SEGMENT_URL = 'https://api.segment.io/v1/track';

/**
 * Generic function to send events to Segment.
 * 
 * @param {string} event - The name of the event.
 * @param {Object} properties - The properties associated with the event.
 */
const trackEvent = async (event, properties) => {
    try {
      const response = await axios.post(
        SEGMENT_URL,
        {
          event,
          properties,
          userId: properties.userId, // Ensure userId is part of properties
        },
        {
          auth: {
            username: SEGMENT_WRITE_KEY,
          },
        }
      );
      console.log(`Segment event "${event}" sent successfully:`, response.data);
    } catch (error) {
      console.error(`Error sending "${event}" event to Segment:`, error);
    }
  };
  
  // Specific Event Tracking Functions
  
  /**
   * Tracks the "Task Completion Toggled" event.
   */
  export const trackTaskCompletionToggled = async (details) => {
    await trackEvent('Task Completion Toggled', details);
  };
  
  /**
   * Tracks the "Routine Completed" event.
   */
  export const trackRoutineCompleted = async (details) => {
    await trackEvent('Routine Completed', details);
  };
  
  /**
   * Tracks the "Routine Saved" event.
   */
  export const trackRoutineSaved = async (details) => {
    await trackEvent('Routine Saved', details);
  };
  
  /**
   * Tracks the "Routine Generated" event.
   */
  export const trackRoutineGenerated = async (details) => {
    await trackEvent('Routine Generated', details);
  };
  
  /**
   * Tracks the "Routine Not Saved" event.
   */
  export const trackRoutineNotSaved = async (details) => {
    await trackEvent('Routine Not Saved', details);
  };
  
  /**
   * Tracks the "Task Added" event.
   */
  export const trackTaskAdded = async (details) => {
    await trackEvent('Task Added', details);
  };
  
  /**
   * Tracks the "Task Deleted" event.
   */
  export const trackTaskDeleted = async (details) => {
    await trackEvent('Task Deleted', details);
  };
  
  /**
   * Tracks the "Recurring Routine Toggled" event.
   */
  export const trackRecurringRoutineToggled = async (details) => {
    await trackEvent('Recurring Routine Toggled', details);
  };
  
  /**
   * Tracks the "Time Picker Used" event.
   */
  export const trackTimePickerUsed = async (details) => {
    await trackEvent('Time Picker Used', details);
  };

  /**
 * Tracks the "Save Button Clicked" event in Goal Builder.
 */
export const trackSaveButtonClicked = async (details) => {
    await trackEvent('Save Button Clicked', details);
  };
  
  /**
   * Tracks the "Goals Generated" event in Goal Builder.
   */
  export const trackGoalsGenerated = async (details) => {
    await trackEvent('Goals Generated', details);
  };
  
  /**
   * Tracks the "Date Selector Used" event in Goal Builder.
   */
  export const trackDateSelectorUsed = async (details) => {
    await trackEvent('Date Selector Used', details);
  };
  
  /**
   * Tracks the "Goal Entered" event in Goal Builder.
   */
  export const trackGoalEntered = async (details) => {
    await trackEvent('Goal Entered', details);
  };
  
  /**
   * Tracks the "App Opened" event.
   */
  export const trackAppOpened = async (details) => {
    await trackEvent('App Opened', details);
  };

  // New Tracking Functions for Life Coach

/**
 * Tracks when a user starts a new conversation.
 */
export const trackConversationStarted = async (details) => {
    await trackEvent('Conversation Started', details);
  };
  
  /**
   * Tracks when a user sends a message.
   */
  export const trackMessageSent = async (details) => {
    await trackEvent('Message Sent', details);
  };
  
  /**
   * Tracks when the AI responds to a message.
   */
  export const trackAIResponse = async (details) => {
    await trackEvent('AI Response', details);
  };
  
  /**
   * Tracks when a conversation is deleted.
   */
  export const trackConversationDeleted = async (details) => {
    await trackEvent('Conversation Deleted', details);
  };
  
  /**
   * Tracks when feedback is submitted in Life Coach.
   */
  export const trackFeedbackSubmitted = async (details) => {
    await trackEvent('Feedback Submitted', details);
  };
  
  /**
   * Tracks the duration of a conversation.
   */
  export const trackConversationDuration = async (details) => {
    await trackEvent('Conversation Duration', details);
  };
  
  /**
   * Tracks user intents or purposes for using the Life Coach.
   */
  export const trackUserIntent = async (details) => {
    await trackEvent('User Intent', details);
  };

  /**
 * Tracks when the Resources tab/page is opened.
 */
export const trackResourcesTabOpened = async (details) => {
    await trackEvent('Resources Tab Opened', details);
  };
  
  /**
   * Tracks when a user clicks on a resource link.
   */
  export const trackResourceLinkClicked = async (details) => {
    await trackEvent('Resource Link Clicked', details);
  };

  /**
 * Tracks when a user deletes a routine.
 * @param {Object} details - Details about the deletion.
 */
export const trackRoutineDeleted = async (details) => {
    await trackEvent('Routine Deleted', details);
  };
  
  /**
   * Tracks when a user removes a task from a routine.
   * @param {Object} details - Details about the task removal.
   */
  export const trackTaskRemoved = async (details) => {
    await trackEvent('Task Removed', details);
  };

  export const trackResourceTabClicked = async (details) => {
    await trackEvent('Resource Tab Clicked', details);
  };

  export const trackHomeTabOpened = async (details) => {
    await trackEvent('Home Tab Opened', details);
  };

  export const trackPlannerTabOpened = async (details) => {
    await trackEvent('Planner Tab Opened', details);
  };

  export const trackCoachTabOpened = async (details) => {
    await trackEvent('Coach Tab Opened', details);
  };

  export const trackRoutinesTabOpened = async (details) => {
    await trackEvent('Routines Tab Opened', details);
  };