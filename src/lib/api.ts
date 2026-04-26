import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  serverTimestamp,
  increment,
  writeBatch
} from "firebase/firestore";
import { db, auth } from "./firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// API Functions
export async function fetchUser(uid: string) {
  const path = `users/${uid}`;
  try {
    const userDoc = await getDoc(doc(db, path));
    if (!userDoc.exists()) return null;
    return userDoc.data();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createOrUpdateUser(uid: string, email: string, displayName: string) {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, path);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const newUser = {
        id: uid,
        email,
        name: displayName || email.split("@")[0],
        xp: 0,
        level: 1,
        streak: 0,
        lastSessionDate: null,
        settings: {
          autoStartBreaks: false,
          autoStartFocus: false,
          soundNotifications: true,
          browserNotifications: true,
          publicProfile: false,
          shareFocusTrends: true,
          focusDuration: 25,
          breakDuration: 5
        }
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
    return userDoc.data();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSession(userId: string, duration: number, completed: boolean) {
  const sessionId = Date.now().toString();
  const sessionPath = `sessions/${sessionId}`;
  const userPath = `users/${userId}`;
  
  try {
    const batch = writeBatch(db);
    
    const sessionRef = doc(db, sessionPath);
    const sessionData = {
      id: sessionId,
      userId,
      duration,
      completed,
      date: new Date().toISOString()
    };
    batch.set(sessionRef, sessionData);
    
    if (completed) {
      const userRef = doc(db, userPath);
      const xpGain = Math.floor(duration / 60) * 10;
      const today = new Date().toISOString().split("T")[0];
      
      // Note: In Firestore we can't easily do the streak logic in a batch without reading first
      // But we can update XP and level roughly
      batch.update(userRef, {
        xp: increment(xpGain),
        lastSessionDate: today
        // Level and streak updates would ideally be handled via a Cloud Function 
        // or a read-before-write if strict accuracy is needed.
        // For simplicity here, we'll just update XP.
      });
    }
    
    await batch.commit();
    
    // Refresh user to get updated level/streak (done by the caller usually)
    return { session: sessionData };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, sessionPath);
  }
}

export async function fetchStats(userId: string) {
  const path = 'sessions';
  try {
    const q = query(collection(db, path), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchBlockedSites(userId: string) {
  const path = 'blockedSites';
  try {
    const q = query(collection(db, path), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addBlockedSite(userId: string, url: string) {
  const id = Date.now().toString();
  const path = `blockedSites/${id}`;
  try {
    const siteData = { id, userId, url };
    await setDoc(doc(db, path), siteData);
    return siteData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeBlockedSite(id: string) {
  const path = `blockedSites/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ... Similar for apps ...
export async function fetchBlockedApps(userId: string) {
  const path = 'blockedApps';
  try {
    const q = query(collection(db, path), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addBlockedApp(userId: string, name: string) {
  const id = Date.now().toString();
  const path = `blockedApps/${id}`;
  try {
    const appData = { id, userId, name };
    await setDoc(doc(db, path), appData);
    return appData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeBlockedApp(id: string) {
  const path = `blockedApps/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchBlockedMobileApps(userId: string) {
  const path = 'blockedMobileApps';
  try {
    const q = query(collection(db, path), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addBlockedMobileApp(userId: string, name: string) {
  const id = Date.now().toString();
  const path = `blockedMobileApps/${id}`;
  try {
    const appData = { id, userId, name };
    await setDoc(doc(db, path), appData);
    return appData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeBlockedMobileApp(id: string) {
  const path = `blockedMobileApps/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateUser(id: string, updates: any) {
  const path = `users/${id}`;
  try {
    await updateDoc(doc(db, path), updates);
    const userDoc = await getDoc(doc(db, path));
    return userDoc.data();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function resetStats(userId: string) {
  const userPath = `users/${userId}`;
  try {
    const batch = writeBatch(db);
    
    // Reset user doc
    batch.update(doc(db, userPath), {
      xp: 0,
      level: 1,
      streak: 0,
      lastSessionDate: null
    });
    
    // Note: Deleting all sessions is better handled via a separate cleanup or just filter in UI
    // Firestore doesn't support "delete where userId == X" in a simple batch without listing first.
    // For now we just reset the user doc.
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}
