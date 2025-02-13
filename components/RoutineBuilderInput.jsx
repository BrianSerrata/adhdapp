import React, { useState, useEffect, useCallback } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import styles from "../styles/RoutineBuilderStyles";

const placeholderPrompts = [
    "I want to organize my closet this weekend.",
    "Help me plan a productive study session.",
    "Give me a quick and healthy dinner recipe.",
    "Give me steps to build a morning routine.",
    "I need a checklist for packing for my trip.",
    "Help me prioritize my tasks for today.",
    "I want a brief mindfulness exercise.",
    "I want to improve my bedtime habits.",
    "Create a workout plan with no equipment.",
    "How can I declutter my workspace.",
    "I want to create a budget for the next month.",
    "Help me brainstorm ideas for my project.",
    "Ways to stay focused working from home.",
    "I need steps to prepare for a job interview.",
    "I want a simple meal plan for the week.",
    "Tips to stay consistent with journaling.",
  ];

const RoutineBuilderInput = React.memo(function RoutineBuilderInput({
    userInput,
    setUserInput,
    isInputting,
    setIsInputting,
  }) {
    const [dynamicPlaceholder, setDynamicPlaceholder] = useState(placeholderPrompts[0]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [typing, setTyping] = useState(true);
  
    // Remove manual keyboardHeight state and listeners.
    // The KeyboardAvoidingView will handle keyboard events for us.
  
    useEffect(() => {
      if (userInput.length === 0 && !isInputting) {
        let typingTimer;
        let backspacingTimer;
        const typeText = () => {
          const currentPrompt = placeholderPrompts[currentPromptIndex];
          if (dynamicPlaceholder.length < currentPrompt.length && typing) {
            typingTimer = setTimeout(() => {
              setDynamicPlaceholder((prev) => prev + currentPrompt[prev.length]);
            }, 25);
          } else if (typing) {
            typingTimer = setTimeout(() => {
              setTyping(false);
            }, 650);
          }
        };
        const backspaceText = () => {
          if (dynamicPlaceholder.length > 0 && !typing) {
            backspacingTimer = setTimeout(() => {
              setDynamicPlaceholder((prev) => prev.slice(0, -1));
            }, 50);
          } else if (!typing) {
            setTyping(true);
            setCurrentPromptIndex((prev) => (prev + 1) % placeholderPrompts.length);
            setDynamicPlaceholder("");
          }
        };
        if (typing) typeText();
        else backspaceText();
        return () => {
          clearTimeout(typingTimer);
          clearTimeout(backspacingTimer);
        };
      }
    }, [dynamicPlaceholder, typing, currentPromptIndex, isInputting, userInput]);
  
    const handleTextChange = useCallback(
      (text) => setUserInput(text),
      [setUserInput]
    );
  
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer} // Use a style that positions your input as needed
      >
        <TextInput
          style={styles.goalInput}
          placeholder={dynamicPlaceholder}
          placeholderTextColor="#848484"
          value={userInput}
          onChangeText={handleTextChange}
          multiline
          numberOfLines={3}
          onFocus={() => setIsInputting(true)}
          onBlur={() => setIsInputting(false)}
        />
      </KeyboardAvoidingView>
    );
  });

  export default RoutineBuilderInput