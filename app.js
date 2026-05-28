import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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
const ADMIN_EMAIL = "josemwena098@gmail.com".toLowerCase();

let currentPage = "home";
let currentUser = null;

setTimeout(() => document.getElementById('loader').style.display = 'none', 1000);

// Login / Register
document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  if(!email ||!password) return alert("Jaza email na password");
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch(e){ alert(e.message) }
};

document.getElementById('registerBtn').onclick = async () => {
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  if(!email ||!password) return alert("Jaza email na password");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch(e){ alert(e.message) }
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);

// Angalia kama mtu ame-login
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if(user){
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    document.getElementById('userEmail').textContent = user.email;
    
    // Onyesha Admin Upload tu kwa admin email
    if(user.email.toLowerCase() === ADMIN_EMAIL){
      document.querySelector('.admin-only').classList.remove('hidden');
    }
    
    renderPage(currentPage);
    setupNav();
  } else {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
  }
});

function setupNav(){
  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      currentPage = link.dataset.page;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      renderPage(currentPage);
    }
  });
}

function renderPage(page){
  const content = document.getElementById('pageContent');
  
  if(page === 'home'){
    content.innerHTML = `<div class="hero"><h1>Karibu ENJOY GAMES</h1><p>Pakua games bora za APK, PPSSPP Gold, na PS2 bure</p></div><div class="games-grid" id="homeGames"></div>`;
    loadGames('all');
  }
  
  if(page === 'apk'){
    content.innerHTML = `<div class="hero"><h1>APK Games</h1></div><div class="games-grid" id="apkGames"></div>`;
    loadGames('apk');
  }
  
  if(page === 'ppsspp'){
    content.innerHTML = `<div class="hero"><h1>PPSSPP Gold Games</h1></div><div class="games-grid" id="ppssppGames"></div>`;
    loadGames('ppsspp');
  }
  
  if(page === 'ps2'){
    content.innerHTML = `<div class="hero"><h1>PS2 Games</h1></div><div class="games-grid" id="ps2Games"></div>`;
    loadGames('ps2');
  }
  
  if(page === 'admin'){
    if(!currentUser || currentUser.email.toLowerCase() !== ADMIN_EMAIL){
      content.innerHTML = `<div class="empty">Huna ruhusa ya kuingia hapa.</div>`;
      return;
    }
    content.innerHTML = `
      <div class="admin-form">
        <h2>Upload Game</h2>
        <select id="gameCategory">
          <option value="apk">APK</option>
          <option value="ppsspp">PPSSPP Gold</option>
          <option value="ps2">PS2</option>
        </select>
        <input type="text" id="gameTitle" placeholder="Jina la game">
        <textarea id="gameDesc" placeholder="Maelezo ya game"></textarea>
        <input type="url" id="gameImg" placeholder="Link ya picha">
        <input type="url" id="gameLink" placeholder="Link ya download">
        <button class="btn-primary" id="uploadBtn">Upload Game</button>
      </div>
    `;
    
    document.getElementById('uploadBtn').onclick = async () => {
      const game = {
        category: document.getElementById('gameCategory').value,
        title: document.getElementById('gameTitle').value,
        desc: document.getElementById('gameDesc').value,
        img: document.getElementById('gameImg').value,
        link: document.getElementById('gameLink').value,
        createdAt: serverTimestamp()
      };
      if(!game.title || !game.link) return alert("Jaza jina na link");
      await addDoc(collection(db, "games"), game);
      alert("Game imeupload!");
      document.querySelectorAll('.admin-form input, .admin-form textarea').forEach(i => i.value = '');
    };
  }
}

function loadGames(category){
  const containerId = category === 'all' ? 'homeGames' : category + 'Games';
  const container = document.getElementById(containerId);
  if(!container) return;
  
  container.innerHTML = '<div class="empty">Inaload games...</div>';
  
  const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
  
  onSnapshot(q, (snapshot) => {
    let games = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    if(category !== 'all'){
      games = games.filter(g => g.category === category);
    }
    
    if(games.length === 0){
      container.innerHTML = '<div class="empty">Hakuna games bado.</div>';
      return;
    }
    
    container.innerHTML = games.map(g => `
      <div class="game-card">
        <img src="${g.img || 'https://via.placeholder.com/400x200'}" class="game-img" alt="${g.title}">
        <div class="game-info">
          <h3>${g.title}</h3>
          <p>${g.desc}</p>
          <a href="${g.link}" target="_blank" class="btn-download">Download</a>
        </div>
      </div>
    `).join('');
  }, (error) => {
    container.innerHTML = `<div class="empty" style="color:red;">ERROR: ${error.message}</div>`;
  });
    }
