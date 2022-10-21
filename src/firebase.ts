import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAKOwgpOCgIQviQ7kzNR2XMCXEVjifvS34",
	authDomain: "mediaer-bd094.firebaseapp.com",
	projectId: "mediaer-bd094",
	storageBucket: "mediaer-bd094.appspot.com",
	messagingSenderId: "759740268020",
	appId: "1:759740268020:web:4cf694a74ab25ef7cecda1",
	measurementId: "G-XPK3287B3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export function returnAuth(){
	return auth
}
export function returnDataBase(){
	return db
}

import { userData } from '@/types'

// User profile
export async function createNewUser(email: string, password: string, name: string){
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password)
		const user = userCredential.user;
		await updateDisplayName(name, user)
		const uid = auth.currentUser?.uid
		if(uid != undefined){
			try {
				await setDoc(doc(db, `data/${uid}`), {
					...userData
				});
			} catch (error) {
				console.log(error)    
			}
		}
	} catch (error) {
		console.log(error)
	}
}
export async function signInUser(email: string, password: string){
	signInWithEmailAndPassword(auth, email, password)
	.then((userCredential) => {
		const user = userCredential.user;
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
		console.log(errorMessage)
	});
}
export async function signOutUser(){
	signOut(auth).then(() => {
		// Sign-out successful.
	}).catch((error) => {
		console.log(error)
		// An error happened.
	});
}
export async function updateDisplayName(name: string, user: User){
	updateProfile(user, {
		displayName: name
	}).then(() => {
		// Profile updated!
	}).catch((error) => {
		console.log(error)
	});
}

export async function addBook() {
    
}