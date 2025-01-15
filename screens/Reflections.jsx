// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Feather } from '@expo/vector-icons';
// import { format } from 'date-fns';
// import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
// import { db, auth } from '../firebase';
// import { StyleSheet } from 'react-native';

// const Reflections = ({ navigation }) => {
//   const [reflections, setReflections] = useState([]);
//   const [selectedReflection, setSelectedReflection] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchReflections = async () => {
//       try {
//         const userRef = collection(db, 'users', auth.currentUser.uid, 'reflections');
//         const q = query(userRef, orderBy('date', 'desc'));
//         const unsubscribe = onSnapshot(q, (snapshot) => {
//           const data = snapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data(),
//             date: doc.data().date.toDate(),
//           }));
//           setReflections(data);
//           setLoading(false);
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error('Error fetching reflections:', error);
//         Alert.alert('Error', 'Failed to load reflections. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchReflections();
//   }, []);

//   const handleReflectionPress = (reflection) => {
//     setSelectedReflection(reflection);
//     setModalVisible(true);
//   };

//   const renderReflectionItem = ({ item }) => (
//     <TouchableOpacity onPress={() => handleReflectionPress(item)} style={styles.sessionCard}>
//       <View style={styles.sessionContent}>
//         <Text style={styles.sessionDate}>{format(item.date, 'MMMM dd, yyyy')}</Text>
//         <TouchableOpacity style={styles.iconButton}>
//           <Feather name="book" size={20} color="#4F46E5" />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

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
//             <Text style={styles.headerTitle}>Reflections</Text>
//             <Text style={styles.headerSubtitle}>Review your past reflections</Text>
//           </View>
//         </View>

//         {reflections.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No reflections found.</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={reflections}
//             renderItem={renderReflectionItem}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={styles.listContainer}
//           />
//         )}

//         <Modal visible={modalVisible} animationType="slide" transparent={true}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <ScrollView contentContainerStyle={styles.modalScrollContent}>
//                 {selectedReflection && (
//                   <>
//                     <Text style={styles.sessionDate}>
//                       {format(selectedReflection.date, 'MMMM dd, yyyy')}
//                     </Text>
//                     <Text style={[styles.sessionDate, { marginTop: 10 }]}>
//                       {selectedReflection.question}
//                     </Text>
//                     <Text style={[styles.sessionDate, { marginTop: 10, color: '#6B7280' }]}>
//                       {selectedReflection.answer}
//                     </Text>
//                   </>
//                 )}
//               </ScrollView>
//               <TouchableOpacity 
//                 style={styles.closeButton}
//                 onPress={() => setModalVisible(false)}
//               >
//                 <Text style={styles.closeButtonText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   backButton: {
//     marginRight: 12,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     backgroundColor: 'white',
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   listContainer: {
//     padding: 16,
//   },
//   sessionCard: {
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 2,
//   },
//   sessionContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flex: 1,
//   },
//   sessionDate: {
//     fontSize: 16,
//     color: '#1F2937',
//   },
//   iconButton: {
//     padding: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#4B5563',
//     fontWeight: '600',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '90%',
//     maxHeight: '80%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   modalScrollContent: {
//     flexGrow: 1,
//     width: '100%',
//   },
//   closeButton: {
//     marginTop: 15,
//     backgroundColor: '#4F46E5',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

// export default Reflections;