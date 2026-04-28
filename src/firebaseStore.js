import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, addDoc, serverTimestamp, query, where, orderBy, increment, deleteField } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { useState, useEffect } from 'react';
import { initialData as demoData } from './mockData';

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

const demoUsers = demoData.users || [];
const demoTasks = demoData.tasks || [];
const demoAssignments = demoData.assignments || [];
const demoNotifications = demoData.notifications || [];
const DEMO_SESSION_KEY = 'cb_demo_session';

export const getDemoSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

export const setDemoSession = (session) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
};

export const clearDemoSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
};

const inferRoleFromEmail = (email = '') => {
  const normalized = String(email).toLowerCase();
  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('field')) return 'field_worker';
  if (normalized.includes('vol')) return 'volunteer';
  if (normalized.includes('ngo') || normalized.includes('foundation') || normalized.includes('trust') || normalized.includes('org')) return 'ngo';
  return 'ngo';
};

const getDemoTemplateUser = (email = '') => {
  const normalized = String(email).toLowerCase();
  const exactMatch = demoUsers.find(user => String(user.email).toLowerCase() === normalized);
  if (exactMatch) return exactMatch;

  const role = inferRoleFromEmail(email);
  const roleMatch = demoUsers.find(user => user.role === role);
  return roleMatch || demoUsers[0] || null;
};

const buildFallbackState = (currentUser) => {
  const templateUser = getDemoTemplateUser(currentUser?.email || '');
  const inferredRole = inferRoleFromEmail(currentUser?.email || '');
  const baseProfile = templateUser ? { ...templateUser } : { name: 'Demo User', role: inferredRole, status: inferredRole === 'ngo' ? 'approved' : 'active', available: inferredRole !== 'ngo' };
  const sourceId = templateUser?.id || baseProfile.id || currentUser?.uid || 'demo-user';

  const profile = {
    ...baseProfile,
    id: currentUser?.uid || sourceId,
    email: currentUser?.email || baseProfile.email || '',
    role: baseProfile.role || inferredRole,
    status: baseProfile.status || (inferredRole === 'ngo' ? 'approved' : 'active'),
    available: typeof baseProfile.available === 'boolean' ? baseProfile.available : inferredRole !== 'ngo'
  };

  const remapId = (value) => (value === sourceId ? profile.id : value);

  const users = demoUsers.map(user => user.id === sourceId ? {
    ...user,
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    available: profile.available
  } : { ...user });

  if (!users.some(user => user.id === profile.id)) {
    users.unshift(profile);
  }

  return {
    profile,
    users,
    tasks: demoTasks.map(task => ({
      ...task,
      created_by: remapId(task.created_by),
      assigned_to: remapId(task.assigned_to),
      assigned_by: remapId(task.assigned_by)
    })),
    assignments: demoAssignments.map(assignment => ({
      ...assignment,
      volunteer_id: remapId(assignment.volunteer_id),
      ngo_id: remapId(assignment.ngo_id)
    })),
    notifications: demoNotifications.map(notification => ({
      ...notification,
      user_id: remapId(notification.user_id)
    }))
  };
};

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
    const demoSession = getDemoSession();

    if (demoSession?.email) {
      const fallbackState = buildFallbackState({ email: demoSession.email, uid: demoSession.uid || `demo-${demoSession.email}` });
      setStore(prev => ({
        ...prev,
        authUser: { uid: fallbackState.profile.id, email: fallbackState.profile.email },
        userRole: fallbackState.profile.role,
        userProfile: fallbackState.profile,
        users: fallbackState.users,
        tasks: fallbackState.tasks,
        assignments: fallbackState.assignments.filter(a => a.volunteer_id === fallbackState.profile.id || a.ngo_id === fallbackState.profile.id || fallbackState.profile.role === 'admin'),
        notifications: fallbackState.notifications.filter(n => n.user_id === fallbackState.profile.id || fallbackState.profile.role === 'admin'),
        usersLoading: false,
        tasksLoading: false,
        assignmentsLoading: false,
        notificationsLoading: false,
        loading: false
      }));
    }

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fallbackState = buildFallbackState(user);
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
              const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, users: users.length ? users : fallbackState.users, usersLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            // Role-based tasks query
            let tasksQuery = query(collection(db, 'Tasks')); // admin gets all
            if (data.role === 'volunteer' || data.role === 'field_worker') {
               tasksQuery = query(collection(db, 'Tasks'), where("status", "in", ["created", "assigned", "in_progress", "completed"])); 
            } else if (data.role === 'ngo') {
               tasksQuery = query(collection(db, 'Tasks'), where("status", "in", ["created", "assigned", "in_progress", "completed"]));
            }
            unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
              const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, tasks: tasks.length ? tasks : fallbackState.tasks, tasksLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            unsubAssignments = onSnapshot(query(collection(db, 'Assignments'), where("volunteer_id", "==", user.uid)), (snapshot) => {
              const assignments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, assignments: assignments.length ? assignments : fallbackState.assignments.filter(a => a.volunteer_id === user.uid), assignmentsLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            unsubNotifications = onSnapshot(query(collection(db, 'Notifications'), where("user_id", "==", user.uid), orderBy("createdAt", "desc")), (snapshot) => {
              const notifications = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, notifications: notifications.length ? notifications : fallbackState.notifications.filter(n => n.user_id === user.uid), notificationsLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

          } else if (user.email === 'admin@communitybridge.org') {
            // Admin fallback
            setStore(prev => ({ ...prev, authUser: user, userProfile: fallbackState.profile, userRole: 'admin' }));
            
            unsubUsers = onSnapshot(collection(db, 'Users'), (snapshot) => {
              const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, users: users.length ? users : fallbackState.users, usersLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));
            unsubTasks = onSnapshot(collection(db, 'Tasks'), (snapshot) => {
              const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, tasks: tasks.length ? tasks : fallbackState.tasks, tasksLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));
            setStore(prev => ({
              ...prev,
              assignments: fallbackState.assignments,
              notifications: fallbackState.notifications.filter(n => n.user_id === user.uid || n.user_id === 'admin-user'),
              assignmentsLoading: false,
              notificationsLoading: false
            }));
          } else {
            // No Firestore profile yet, use the demo state so the app can still render.
            setStore(prev => ({ ...prev, authUser: user, userProfile: fallbackState.profile, userRole: fallbackState.profile.role }));

            unsubUsers = onSnapshot(collection(db, 'Users'), (snapshot) => {
              const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, users: users.length ? users : fallbackState.users, usersLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            unsubTasks = onSnapshot(collection(db, 'Tasks'), (snapshot) => {
              const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, tasks: tasks.length ? tasks : fallbackState.tasks, tasksLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            unsubAssignments = onSnapshot(collection(db, 'Assignments'), (snapshot) => {
              const assignments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, assignments: assignments.length ? assignments : fallbackState.assignments, assignmentsLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));

            unsubNotifications = onSnapshot(collection(db, 'Notifications'), (snapshot) => {
              const notifications = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setStore(prev => ({ ...prev, notifications: notifications.length ? notifications : fallbackState.notifications.filter(n => n.user_id === user.uid), notificationsLoading: false }));
            }, (err) => console.error("Firestore listener error:", err));
          }
        }, (err) => console.error("Firestore listener error:", err));
      } else if (!demoSession?.email) {
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
