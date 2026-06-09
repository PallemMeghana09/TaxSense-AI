import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

export const isFirebasePlaceholder = !firebaseConfig ||
                                     !firebaseConfig.apiKey ||
                                     firebaseConfig.apiKey === "YOUR_API_KEY" ||
                                     firebaseConfig.apiKey === "remixed-api-key" ||
                                     firebaseConfig.apiKey.includes("your-") ||
                                     firebaseConfig.projectId.includes("remixed-") ||
                                     firebaseConfig.projectId === "YOUR_PROJECT_ID";

// Initialize the clients using the specific applet configurations
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test Connection to Firestore (Skill Requirement)
async function testConnection() {
  if (isFirebasePlaceholder) {
    console.log("Firebase initialized in local sandbox fallback mode. Connection handshake skipped.");
    return;
  }
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Database connection handshake verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Database initialized (handshake logged):", error);
    }
  }
}
testConnection();

// Operational and Auth Info schema for reporting
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  };
  console.error("Firestore error context matched: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
