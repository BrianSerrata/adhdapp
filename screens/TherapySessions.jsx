// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   ScrollView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { auth, db } from '../firebase';
// import { collection, query, orderBy, getDocs } from 'firebase/firestore';
// import { format } from 'date-fns';
// import { Feather } from '@expo/vector-icons';
// import SessionSummary from '../components/SessionSummary';
// import styles from '../styles/TherapySessionsStyles';

// const TherapySessions = ({ navigation }) => {
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSummary, setSelectedSummary] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   const fetchSessions = async () => {
//     try {
//       const sessionsRef = collection(db, 'users', auth.currentUser.uid, 'sessions');
//       const q = query(sessionsRef, orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(q);
//       const sessionsData = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setSessions(sessionsData);
//     } catch (error) {
//       console.error('Error fetching sessions:', error);
//       Alert.alert('Error', 'Failed to fetch sessions. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSessions();
//   }, []);

//   const handleSummaryPress = (summary) => {
//     setSelectedSummary(summary);
//     setModalVisible(true);
//   };

//   const renderSession = ({ item }) => {
//     const createdAt = item.createdAt?.toDate();
//     const formattedDate = createdAt ? format(createdAt, 'MMMM dd, yyyy hh:mm a') : 'Unknown Date';

//     return (
//       <TouchableOpacity
//         style={styles.sessionCard}
//         onPress={() => navigation.navigate('Session', { sessionId: item.id })}
//       >
//         <View style={styles.sessionContent}>
//           <Text style={styles.sessionDate}>{formattedDate}</Text>
//           {item.summary && (
//             <TouchableOpacity onPress={() => handleSummaryPress(item.summary)} style={styles.iconButton}>
//               <Feather name="book" size={20} color="#4F46E5" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.gradient}>
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//             <Feather name="arrow-left" size={24} color="#4F46E5" />
//           </TouchableOpacity>
//           <View style={styles.headerTextContainer}>
//             <Text style={styles.headerTitle}>Therapy Sessions</Text>
//             <Text style={styles.headerSubtitle}>Review your past sessions</Text>
//           </View>
//         </View>

//         {sessions.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No past sessions found.</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={sessions}
//             renderItem={renderSession}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={styles.listContainer}
//           />
//         )}

//         <Modal visible={modalVisible} animationType="slide" transparent={true}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <ScrollView contentContainerStyle={styles.modalScrollContent}>
//                 <SessionSummary summaryData={selectedSummary} onClose={() => setModalVisible(false)} />
//               </ScrollView>
//               <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//                 <Text style={styles.closeButtonText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default TherapySessions;