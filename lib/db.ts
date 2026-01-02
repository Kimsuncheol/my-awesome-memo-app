import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
} from "firebase/firestore";

export interface Memo {
  id: string;
  title: string;
  content: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
}

export const subscribeToMemos = (userId: string, callback: (memos: Memo[]) => void) => {
  const q = query(
    collection(db, "memos"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const memos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Memo[];
    callback(memos);
  });
};

export const addMemo = async (userId: string, title: string, content: string, color: string) => {
  await addDoc(collection(db, "memos"), {
    userId,
    title,
    content,
    color,
    createdAt: Timestamp.now(),
  });
};

export const updateMemo = async (id: string, title: string, content: string) => {
  const memoRef = doc(db, "memos", id);
  await updateDoc(memoRef, {
    title,
    content,
  });
};

export const deleteMemo = async (id: string) => {
  const memoRef = doc(db, "memos", id);
  await deleteDoc(memoRef);
};
