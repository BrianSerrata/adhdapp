import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Import your Firebase config

export default function SavedRoutines({ navigation }) {
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    const fetchRoutines = () => {
      const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
      const q = query(routinesRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutines(fetchedRoutines);
      });

      return unsubscribe; // Cleanup listener on unmount
    };

    return fetchRoutines();
  }, []);

  const handleSelectRoutine = (routine) => {
    navigation.navigate("View Routines", { routine });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Routines</Text>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routineItem}
            onPress={() => handleSelectRoutine(item)}
          >
            <Text style={styles.routineName}>{item.name}</Text>
            <Text style={styles.routineTimestamp}>
              {new Date(item.timestamp?.seconds * 1000).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  routineItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  routineName: { fontSize: 18, fontWeight: "bold" },
  routineTimestamp: { fontSize: 12, color: "#888" },
});