import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FeedbackModal = ({
  visible,
  setVisible,
  questions = [],
  feedback,
  setFeedback,
  handleSubmit,
  showFeedbackIcon = true, // Optional: Toggle feedback icon
}) => {
  return (
    <>
      {/* Feedback Icon */}
      {showFeedbackIcon && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: '#3d5afe',
            padding: 12,
            borderRadius: 50,
            zIndex: 1, // Ensure the icon is above other elements
          }}
          onPress={() => setVisible(true)}
        >
          <MaterialIcons name="help-outline" size={30} color="white" />
        </TouchableOpacity>
      )}

      {/* Feedback Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={64}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                width: '90%',
                maxHeight: '80%',
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {questions.map((question, index) => (
                  <View key={index} style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                      {index + 1}. {question.text}
                    </Text>
                    {question.labels && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: 'gray' }}>{question.labels[0]}</Text>
                        <Text style={{ fontSize: 14, color: 'gray' }}>{question.labels[1]}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <TouchableOpacity
                          key={`${question.key}-${value}`}
                          onPress={() => setFeedback({ ...feedback, [question.key]: value })}
                          style={{
                            padding: 10,
                            backgroundColor:
                              feedback[question.key] === value ? '#3d5afe' : '#e0e0e0',
                            borderRadius: 8,
                            borderWidth: feedback[question.key] === value ? 2 : 0,
                            borderColor:
                              feedback[question.key] === value ? '#0026ca' : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              color: feedback[question.key] === value ? 'white' : 'black',
                            }}
                          >
                            {value}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                  Any additional suggestions?
                </Text>
                <TextInput
                  style={{
                    height: 80,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginBottom: 20,
                    padding: 8,
                    textAlignVertical: 'top',
                  }}
                  value={feedback.suggestion}
                  onChangeText={(text) => setFeedback({ ...feedback, suggestion: text })}
                  placeholder="Enter your suggestions here"
                  multiline
                />
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    backgroundColor: '#3d5afe',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit Feedback</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default FeedbackModal;
