import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, addDoc, serverTimestamp, query, where, orderBy, increment, deleteField } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { useState, useEffect } from 'react';

// === FIREBASE CONFIGURATION ===
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);

// Custom hook to provide real-time updates to components
export const useStore = () => {
  const [store, setStore] = useState({
    authUser: null,
    userRole: null,
    userProfile: null,
    users: [],
    ngos: [], // Deprecated in unified model, keeping empty for compat
    tasks: [], 
    assignments: [],
    notifications: [],
    usersLoading: true,
    tasksLoading: true,
    assignmentsLoading: true,
    notificationsLoading: true,
    loading: true
  });

  useEffect(() => {
    let unsubUsers = () => {};
    let unsubTasks = () => {};
    let unsubAssignments = () => {};
    let unsubNotifications = () => {};
    let unsubProfile = () => {};

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Find user profile in Users collection only (Unified Role Storage)
        unsubProfile = onSnapshot(doc(db, 'Users', user.uid), (userSnap) => {
          if (userSnap.exists()) {
            const data = userSnap.data();
            setStore(prev => ({ 
              ...prev, 
              authUser: user, 
              userProfile: { id: userSnap.id, ...data }, 
              userRole: data.role 
            }));

            // Dependent queries based on user
            unsubUsers = onSnapshot(query(collection(db, 'Users'), where("status", "==", "active")), (snapshot) => {
              setStore(prev => ({ ...prev, users: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), usersLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            // Role-based tasks query
            let tasksQuery = query(collection(db, 'Tasks')); // admin gets all
            if (data.role === 'volunteer' || data.role === 'field_worker') {
               tasksQuery = query(collection(db, 'Tasks'), where("status", "in", ["created", "assigned", "in_progress", "completed"])); 
            } else if (data.role === 'ngo') {
               tasksQuery = query(collection(db, 'Tasks'), where("status", "in", ["created", "assigned", "in_progress", "completed"]));
            }
            unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
              setStore(prev => ({ ...prev, tasks: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), tasksLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            unsubAssignments = onSnapshot(query(collection(db, 'Assignments'), where("volunteer_id", "==", user.uid)), (snapshot) => {
              setStore(prev => ({ ...prev, assignments: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), assignmentsLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            unsubNotifications = onSnapshot(query(collection(db, 'Notifications'), where("user_id", "==", user.uid), orderBy("createdAt", "desc")), (snapshot) => {
              setStore(prev => ({ ...prev, notifications: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), notificationsLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

          } else if (user.email === 'admin@communitybridge.org') {
            // Admin fallback
            setStore(prev => ({ ...prev, authUser: user, userProfile: { id: 'admin', email: user.email, name: 'Admin' }, userRole: 'admin' }));
            
            unsubUsers = onSnapshot(collection(db, 'Users'), (snapshot) => {
              setStore(prev => ({ ...prev, users: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), usersLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));
            unsubTasks = onSnapshot(collection(db, 'Tasks'), (snapshot) => {
              setStore(prev => ({ ...prev, tasks: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), tasksLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));
            setStore(prev => ({ ...prev, assignmentsLoading: false, notificationsLoading: false }));
          }
        }, (err) => console.error("Firestore listener error:", err));
      } else {
        setStore(prev => ({ 
          ...prev, 
          authUser: null, userRole: null, userProfile: null, 
          users: [], ngos: [], tasks: [], assignments: [], notifications: [],
          usersLoading: false, tasksLoading: false, assignmentsLoading: false, notificationsLoading: false
        }));
      }
    });

    return () => {
      unsubAuth();
      unsubUsers();
      unsubTasks();
      unsubAssignments();
      unsubNotifications();
      unsubProfile();
    };
  }, []);

  useEffect(() => {
    setStore(prev => ({
      ...prev,
      loading: prev.usersLoading || prev.tasksLoading || prev.assignmentsLoading || prev.notificationsLoading
    }));
  }, [store.usersLoading, store.tasksLoading, store.assignmentsLoading, store.notificationsLoading]);

  return store;
};

export const getUserAssignments = async (userId) => {
  const q = query(collection(db, 'Assignments'), where("volunteer_id", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getPendingNGOs = async () => {
  const q = query(collection(db, 'Users'), where("role", "==", "ngo"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getTasksByStatus = async (statusList) => {
  const q = query(collection(db, 'Tasks'), where("status", "in", statusList));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserNotifications = async (userId) => {
  const q = query(collection(db, 'Notifications'), where("user_id", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAvailableVolunteers = async (filters = {}) => {
  let conditions = [
    where("role", "in", ["volunteer", "field_worker"]),
    where("status", "==", "active"),
    where("available", "==", true)
  ];

  if (filters.skill) conditions.push(where("skills", "array-contains", filters.skill));
  if (filters.location) conditions.push(where("location", "==", filters.location));

  const q = query(collection(db, 'Users'), ...conditions);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createTask = async (data) => {
  if (!data.type || !data.location || !data.urgency || !data.people_affected) {
    throw new Error("Missing required task fields");
  }
  const taskData = {
    ...data,
    status: "created",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(collection(db, 'Tasks'), taskData);

  if (data.source === 'nlp_report' && data.created_by && data.created_by !== 'unknown') {
    try {
      await updateDoc(doc(db, 'Users', String(data.created_by)), {
        reportsSubmitted: increment(1),
        lastReportAt: serverTimestamp()
      });
    } catch (e) { console.error("Error updating field worker report stats:", e); }
  }

  if (Number(data.urgency) >= 4) {
    try {
      await notifyUrgentAlert(docRef.id, data.type, data.location);
    } catch(e) { console.error("Error triggering urgent alert:", e); }
  }

  return docRef.id;
};

export const assignTask = async (taskId, volunteerId, ngoId, volName) => {
  try {
    await updateDoc(doc(db, 'Tasks', String(taskId)), { 
      status: 'assigned', 
      assigned_to: volunteerId,
      assigned_by: ngoId,
      updatedAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'Users', String(volunteerId)), { 
      status: 'assigned',
      available: false 
    });
    
    const assignmentId = String(Date.now());
    await setDoc(doc(db, 'Assignments', assignmentId), {
      task_id: taskId,
      volunteer_id: volunteerId,
      ngo_id: ngoId,
      status: 'assigned',
      assignedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await notifyTaskAssigned(taskId, volunteerId, ngoId, "new");
    return assignmentId;
  } catch (err) {
    console.error("Assign task failed:", err);
    throw err;
  }
};

export const updateTaskStatus = async (taskId, newStatus) => {
  try {
    await updateDoc(doc(db, 'Tasks', String(taskId)), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Update task status failed:", err);
    throw err;
  }
};

export const acceptTask = async (taskId, assignmentId) => {
  try {
    await updateDoc(doc(db, 'Tasks', String(taskId)), { status: 'in_progress', updatedAt: serverTimestamp() });
    if (assignmentId) {
      await updateDoc(doc(db, 'Assignments', String(assignmentId)), { status: 'accepted', updatedAt: serverTimestamp() });
      const assignmentSnap = await getDoc(doc(db, 'Assignments', String(assignmentId)));
      if (assignmentSnap.exists()) {
         await notifyAssignmentAccepted(taskId, assignmentSnap.data().ngo_id, "Volunteer");
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const completeTask = async (taskId, assignmentId, volunteerId) => {
  try {
    await updateDoc(doc(db, 'Tasks', String(taskId)), { status: 'completed', updatedAt: serverTimestamp() });
    if (assignmentId) {
      await updateDoc(doc(db, 'Assignments', String(assignmentId)), { status: 'completed', updatedAt: serverTimestamp() });
      const assignmentSnap = await getDoc(doc(db, 'Assignments', String(assignmentId)));
      if (assignmentSnap.exists()) {
         await notifyTaskCompleted(taskId, assignmentSnap.data().ngo_id, "Volunteer");
      }
    }
    if (volunteerId) {
      await updateDoc(doc(db, 'Users', String(volunteerId)), { status: 'active', available: true });
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const approveNGO = async (ngoId) => {
  await updateDoc(doc(db, 'Users', String(ngoId)), { status: 'approved', verifiedAt: serverTimestamp() });
};

export const rejectNGO = async (ngoId) => {
  await updateDoc(doc(db, 'Users', String(ngoId)), { status: 'rejected' });
};

export const updateVolunteerAvailability = async (userId, isAvailable) => {
  await updateDoc(doc(db, 'Users', String(userId)), { 
    available: isAvailable,
    status: isAvailable ? 'active' : 'unavailable'
  });
};

export const promoteToFieldWorker = async (userId, ngoId) => {
  const taskRef = await addDoc(collection(db, 'Tasks'), {
    type: 'field_report',
    status: 'assigned',
    assigned_to: userId,
    assigned_by: ngoId,
    description: 'Field Operations Directive. Submit tactical reports to HQ.',
    urgency: 3,
    location: 'Deployed Zone',
    people_affected: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  await updateDoc(doc(db, 'Users', String(userId)), {
    role: 'field_worker',
    status: 'assigned',
    assigned_by: ngoId,
    field_assignment_active: true,
    assignedAt: serverTimestamp()
  });

  await setDoc(doc(db, 'Assignments', String(Date.now())), {
    task_id: taskRef.id,
    volunteer_id: userId,
    ngo_id: ngoId,
    status: 'assigned',
    assignedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const demoteFieldWorker = async (userId) => {
  await updateDoc(doc(db, 'Users', String(userId)), {
    role: 'volunteer',
    status: 'active',
    field_assignment_active: false,
    assigned_by: deleteField(),
    assignedAt: deleteField()
  });
};

// Seeding function to populate Firebase with mock data on first run
export const seedDatabase = async () => {
  try {
    // Create admin user silently if needed for demo purposes (requires email/password)
    // Normally handled via Firebase Console.
    console.log("Seed database logic triggered. Note: Mock data seeding is disabled to enforce real data usage as requested.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
// === NOTIFICATIONS SYSTEM ===

export const createNotification = async (data) => {
  try {
    const notificationObject = {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'Notifications'), notificationObject);
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
};

export const notifyTaskAssigned = async (taskId, volunteerId, ngoId, taskType) => {
  await createNotification({
    user_id: volunteerId,
    type: 'task_assigned',
    title: 'New Mission Directive',
    message: `You have been assigned to a ${taskType} task. Acknowledge ASAP.`,
    related_task_id: taskId,
    priority: 'high',
    sender_id: ngoId
  });
};

export const notifyTaskCompleted = async (taskId, ngoId, volunteerName) => {
  await createNotification({
    user_id: ngoId,
    type: 'task_completed',
    title: 'Mission Accomplished',
    message: `${volunteerName} has successfully completed the assigned task.`,
    related_task_id: taskId,
    priority: 'medium'
  });
};

export const notifyTaskDeclined = async (taskId, ngoId, volunteerName, taskType) => {
  if (!ngoId) return;
  await createNotification({
    user_id: ngoId,
    type: 'system',
    title: 'Task Declined',
    message: `${volunteerName} declined the ${taskType} task. It has been unassigned.`,
    related_task_id: taskId,
    priority: 'high'
  });
};

export const notifyAssignmentAccepted = async (taskId, ngoId, volunteerName) => {
  if (!ngoId) return;
  await createNotification({
    user_id: ngoId,
    type: 'assignment_accepted',
    title: 'Operative En Route',
    message: `${volunteerName} has accepted the assignment and is in progress.`,
    related_task_id: taskId,
    priority: 'medium'
  });
};

export const notifyUrgentAlert = async (taskId, taskType, location) => {
  const q = query(collection(db, 'Users'), where("role", "==", "volunteer"), where("status", "==", "active"));
  const snap = await getDocs(q);
  const promises = snap.docs.map(docSnap => {
    return createNotification({
      user_id: docSnap.id,
      type: 'urgent_alert',
      title: 'CRITICAL ALERT',
      message: `Urgent ${taskType} assistance required at ${location}. Respond if nearby.`,
      related_task_id: taskId,
      priority: 'high'
    });
  });
  await Promise.all(promises);
};

export const markNotificationAsRead = async (notificationId) => {
  await updateDoc(doc(db, 'Notifications', String(notificationId)), { read: true });
};
