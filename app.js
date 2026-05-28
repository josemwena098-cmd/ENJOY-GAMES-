import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9SvoHhndN-j-Sl59qcdcDwHwB22UupvU",
  authDomain: "nova-ec213.firebaseapp.com",
  projectId: "nova-ec213",
  storageBucket: "nova-ec213.firebasestorage.app",
  messagingSenderId: "978338235926",
  appId: "1:978338235926:web:6193ea73d8fcc8ded89737"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let isLoginMode = true;

// Hide loader after 1s
setTimeout(() => document.getElementById('loader').style.display = 'none', 1000);

// Switch Login/Register
document.getElementById('switchMode').onclick = () => {
  isLoginMode =!isLoginMode;
  document.getElementById('authSub').textContent = isLoginMode? 'Ingia kuendelea' : 'Jisajili sasa';
  document.getElementById('authBtn').textContent = isLoginMode? 'Login' : 'Sign Up';
  document.getElementById('switchMode').textContent = isLoginMode? 'Huna akaunti? Jisajili' : 'Una akaunti? Ingia';
};

// Email/Password Auth
document.getElementById('authBtn').onclick = async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if(!email ||!password) return alert("Jaza email na password");

  try {
    if(isLoginMode){
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
  } catch(e){ alert(e.message) }
};

// Google Auth
document.getElementById('googleBtn').onclick = async () => {
  try { await signInWithPopup(auth, provider); }
  catch(e){ alert(e.message) }
};

// Logout
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
  if(user){
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');

    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];

    // Set online status
    await setDoc(doc(db, "online_users", user.uid), {
      email: user.email,
      lastSeen: serverTimestamp()
    });

    window.addEventListener('beforeunload', () => {
      deleteDoc(doc(db, "online_users", user.uid));
    });

  } else {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
  }
});

// Live Online Counter
onSnapshot(collection(db, "online_users"), (snap) => {
  document.getElementById('onlineCount').textContent = snap.size;
});