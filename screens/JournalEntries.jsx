// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { auth, db } from '../firebase';
// import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
// import { format } from 'date-fns';
// import axios from 'axios';
// import { MaterialIcons } from '@expo/vector-icons';
// import styles from '../styles/JournalEntriesStyles';
// import { OPENAI_API_KEY } from '@env';

// const JournalEntries = ({ navigation }) => {
//   const [entryText, setEntryText] = useState('');
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isEntryModalVisible, setIsEntryModalVisible] = useState(false);
//   const [insights, setInsights] = useState('');
//   const [isLoadingInsights, setIsLoadingInsights] = useState(false);
//   const [title, setTitle] = useState('');

//   const dismissKeyboard = () => {
//     Keyboard.dismiss();
//   };

//   useEffect(() => {
//     if (!auth.currentUser) {
//       Alert.alert('Error', 'User not authenticated.');
//       navigation.navigate('Login');
//       return;
//     }

//     const entriesRef = collection(db, 'users', auth.currentUser.uid, 'entries');
//     const q = query(entriesRef, orderBy('timestamp', 'desc'));

//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const entriesData = [];
//       querySnapshot.forEach((doc) => entriesData.push({ id: doc.id, ...doc.data() }));
//       setEntries(entriesData);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [navigation]);

//   const handleAddEntry = async () => {
//     if (entryText.trim() === '') {
//       return;
//     }

//     try {
//       const entriesRef = collection(db, 'users', auth.currentUser.uid, 'entries');
//       await addDoc(entriesRef, {
//         content: entryText.trim(),
//         timestamp: serverTimestamp(),
//       });
//       setEntryText('');
//       setIsEntryModalVisible(false);
//     } catch (error) {
//       console.error('Error adding entry:', error);
//       Alert.alert('Error', 'Failed to add entry. Please try again.');
//     }
//   };

//   const handleDeleteEntry = (entryId) => {
//     Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             const entryDocRef = doc(db, 'users', auth.currentUser.uid, 'entries', entryId);
//             await deleteDoc(entryDocRef);
//           } catch (error) {
//             console.error('Error deleting entry:', error);
//             Alert.alert('Error', 'Failed to delete entry. Please try again.');
//           }
//         },
//       },
//     ]);
//   };

//   const handleGetInsights = async () => {
//     if (entries.length === 0) {
//       Alert.alert('No Entries', 'Please log some entries to receive insights.');
//       return;
//     }

//     setIsLoadingInsights(true);
//     setIsModalVisible(true);
    
//     try {
//       const entryTexts = entries
//         .map((entry) => {
//           const timestamp = entry.timestamp ? format(entry.timestamp.toDate(), 'MMMM dd, yyyy hh:mm a') : 'Unknown time';
//           return `${entry.content} (Logged on: ${timestamp})`;
//         })
//         .join('\n');

//       const response = await axios.post(
//         'https://api.openai.com/v1/chat/completions',
//         {
//           model: 'gpt-4o-mini',
//           messages: [
//             {
//               role: 'system',
//               content: `You are an ADHD life coach reviewing journal entries to help users gain actionable insights and self-awareness. 

//               Analyze entries with these key objectives:
//               1. Identify patterns in productivity, energy levels, and daily routines that impact the user's effectiveness
//               2. Spotlight moments of success and what contributed to them
//               3. Notice environmental factors and contexts where the user thrives or struggles
//               4. Recognize emerging interests, strengths, and natural tendencies that could be leveraged
//               5. Track progress on stated goals or intentions
              
//               Provide analysis in this format:
              
//               ### Pattern Recognition
//               - Note key patterns in timing, environment, and behavior
//               - Highlight connections between actions and outcomes
//               - Identify what circumstances lead to peak performance
              
//               ### Growth & Insights
//               - Point out emerging strengths and capabilities
//               - Connect dots between different experiences
//               - Frame challenges as opportunities for system optimization
              
//               ### Coaching Observations
//               - Suggest small experiments based on observed patterns
//               - Highlight potential tools or strategies that align with natural tendencies
//               - Offer specific questions for deeper self-reflection
              
//               Keep language encouraging and growth-oriented. Focus on practical insights that promote self-discovery rather than prescriptive advice.`
//             },
//             {
//               role: 'user',
//               content: `Entries:\n${entryTexts}`
//             }
//           ],
//           max_tokens: 1000,
//           temperature: 0.7,
//           n: 1,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${OPENAI_API_KEY}`,
//           },
//         }
//       );

//       const insightText = response.data?.choices?.[0]?.message?.content?.trim() || 'No insights available.';
//       setInsights(insightText);
      
//     } catch (error) {
//       console.error('Error fetching insights:', error);
//       setInsights('An error occurred while fetching insights. Please try again.');
//     } finally {
//       setIsLoadingInsights(false);
//     }
//   };

//   const renderEntryItem = ({ item }) => {
//     const formattedDate = item.timestamp
//       ? format(item.timestamp.toDate(), 'MMM dd, yyyy')
//       : 'Just now';

//     return (
//       <TouchableWithoutFeedback onPress={dismissKeyboard}>
//         <View style={styles.messageRow}>
//           <View style={styles.messageBubble}>
//             <Text style={styles.messageText}>{item.content}</Text>
//             <Text style={styles.timestamp}>{formattedDate}</Text>
//             <TouchableOpacity 
//               style={styles.deleteButton} 
//               onPress={() => handleDeleteEntry(item.id)}
//             >
//               <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </TouchableWithoutFeedback>
//     );
//   };

//   return (
//     <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.container}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoidingView}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//       >
//         <SafeAreaView style={styles.safeArea}>
//           <TouchableWithoutFeedback onPress={dismissKeyboard}>
//             <View style={styles.contentContainer}>
//               <View style={styles.header}>
//                 <TouchableOpacity
//                   onPress={() => navigation.goBack()}
//                   style={styles.backButton}
//                 >
//                   <Ionicons name="arrow-back" size={24} color="#6D28D9" />
//                 </TouchableOpacity>
//                 <View style={styles.headerTextContainer}>
//                   <Text style={styles.headerTitle}>Journal</Text>
//                   <Text style={styles.headerSubtitle}>Record your thoughts</Text>
//                 </View>
//                 <TouchableOpacity onPress={handleGetInsights}>
//                   <Ionicons name="bulb-outline" size={24} color="#6D28D9" />
//                 </TouchableOpacity>
//               </View>

//               {loading ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="large" color="#6D28D9" />
//                 </View>
//               ) : (
//                 <FlatList
//                   data={entries}
//                   renderItem={renderEntryItem}
//                   keyExtractor={(item) => item.id}
//                   style={styles.messageList}
//                   contentContainerStyle={styles.listContent}
//                   keyboardShouldPersistTaps="handled"
//                   ListEmptyComponent={
//                     <View style={styles.emptyContainer}>
//                       <Text style={styles.emptyText}>No entries yet</Text>
//                       <Text style={styles.emptySubtext}>Start journaling your thoughts</Text>
//                     </View>
//                   }
//                 />
//               )}

//               <Modal
//                 visible={isModalVisible}
//                 animationType="slide"
//                 transparent={true}
//                 onRequestClose={() => setIsModalVisible(false)}
//               >
//                 <View style={styles.modalOverlay}>
//                   <View style={styles.modalContent}>
//                     <View style={styles.modalHeader}>
//                       <Text style={styles.modalTitle}>Insights & Advice</Text>
//                       <TouchableOpacity
//                         style={styles.closeButtonTop}
//                         onPress={() => setIsModalVisible(false)}
//                       >
//                         <Ionicons name="close" size={24} color="#4B5563" />
//                       </TouchableOpacity>
//                     </View>
                    
//                     {isLoadingInsights ? (
//                       <View style={styles.modalLoadingContainer}>
//                         <ActivityIndicator size="large" color="#6D28D9" />
//                       </View>
//                     ) : (
//                       <ScrollView
//                         style={styles.modalScrollView}
//                         contentContainerStyle={styles.modalScrollContent}
//                       >
//                         <Text style={styles.modalText}>
//                           {insights}
//                         </Text>
//                       </ScrollView>
//                     )}
                    
//                     <TouchableOpacity
//                       style={styles.closeButtonBottom}
//                       onPress={() => setIsModalVisible(false)}
//                     >
//                       <Text style={styles.closeButtonText}>Close</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </Modal>

//               <View style={styles.inputContainer}>
//                 <TextInput
//                   style={styles.input}
//                   value={entryText}
//                   onChangeText={setEntryText}
//                   placeholder="Write your thoughts..."
//                   placeholderTextColor="#9CA3AF"
//                   multiline
//                   maxHeight={100}
//                 />
//                 <TouchableOpacity
//                   onPress={handleAddEntry}
//                   style={[
//                     styles.sendButton,
//                     { backgroundColor: entryText.trim() ? '#6D28D9' : '#C4B5FD' },
//                   ]}
//                   disabled={!entryText.trim()}
//                 >
//                   <Ionicons name="send" size={20} color="#FFFFFF" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </SafeAreaView>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default JournalEntries