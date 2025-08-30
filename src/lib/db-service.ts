import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { 
  UserProfile, 
  DiaryEntry, 
  SongRecommendation, 
  Playlist, 
  GenreProgress, 
  UserStats 
} from '../types/database'

export class DatabaseService {
  // ユーザープロファイル管理
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  static async createUserProfile(profile: Omit<UserProfile, 'createdAt'>): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.id)
      await setDoc(docRef, {
        ...profile,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  // 日記エントリー管理
  static async getDiaryEntries(userId: string, limitCount = 50): Promise<DiaryEntry[]> {
    try {
      const q = query(
        collection(db, 'diaryEntries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DiaryEntry[]
    } catch (error) {
      console.error('Error getting diary entries:', error)
      return []
    }
  }

  static async getDiaryEntry(entryId: string): Promise<DiaryEntry | null> {
    try {
      const docRef = doc(db, 'diaryEntries', entryId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as DiaryEntry
      }
      
      return null
    } catch (error) {
      console.error('Error getting diary entry:', error)
      return null
    }
  }

  static async createDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'diaryEntries'), {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating diary entry:', error)
      throw error
    }
  }

  static async updateDiaryEntry(entryId: string, updates: Partial<DiaryEntry>): Promise<void> {
    try {
      const docRef = doc(db, 'diaryEntries', entryId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating diary entry:', error)
      throw error
    }
  }

  static async deleteDiaryEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'diaryEntries', entryId))
    } catch (error) {
      console.error('Error deleting diary entry:', error)
      throw error
    }
  }

  // 音楽推薦管理
  static async getSongRecommendations(userId: string, limitCount = 50): Promise<SongRecommendation[]> {
    try {
      const q = query(
        collection(db, 'songRecommendations'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as SongRecommendation[]
    } catch (error) {
      console.error('Error getting song recommendations:', error)
      return []
    }
  }

  static async createSongRecommendation(recommendation: Omit<SongRecommendation, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'songRecommendations'), {
        ...recommendation,
        createdAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating song recommendation:', error)
      throw error
    }
  }

  static async updateSongRecommendation(recommendationId: string, updates: Partial<SongRecommendation>): Promise<void> {
    try {
      const docRef = doc(db, 'songRecommendations', recommendationId)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('Error updating song recommendation:', error)
      throw error
    }
  }

  // プレイリスト管理
  static async getPlaylists(userId: string): Promise<Playlist[]> {
    try {
      const q = query(
        collection(db, 'playlists'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Playlist[]
    } catch (error) {
      console.error('Error getting playlists:', error)
      return []
    }
  }

  static async createPlaylist(playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'playlists'), {
        ...playlist,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating playlist:', error)
      throw error
    }
  }

  static async updatePlaylist(playlistId: string, updates: Partial<Playlist>): Promise<void> {
    try {
      const docRef = doc(db, 'playlists', playlistId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating playlist:', error)
      throw error
    }
  }

  static async deletePlaylist(playlistId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'playlists', playlistId))
    } catch (error) {
      console.error('Error deleting playlist:', error)
      throw error
    }
  }

  // 写真アップロード
  static async uploadPhoto(file: File, userId: string): Promise<string> {
    try {
      const filename = `${Date.now()}-${file.name}`
      const storageRef = ref(storage, `users/${userId}/photos/${filename}`)
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  }

  // 統計データ取得
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const docRef = doc(db, 'userStats', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          ...data,
          lastActive: data.lastActive?.toDate() || new Date()
        } as UserStats
      }
      
      return null
    } catch (error) {
      console.error('Error getting user stats:', error)
      return null
    }
  }

  static async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    try {
      const docRef = doc(db, 'userStats', userId)
      await updateDoc(docRef, {
        ...updates,
        lastActive: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating user stats:', error)
      throw error
    }
  }
}