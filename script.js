// ========== LOCK YA SITE YOTE ==========
if(document.getElementById('siteCode')) {
  // Angalia kama tayari amefungua
  if(localStorage.getItem('siteAccess') === 'true') {
    document.getElementById('codeLock').style.display = 'none'
    document.getElementById('siteContent').classList.remove('hidden')
    initSite()
  }
  
  document.getElementById('unlockBtn').addEventListener('click', () => {
    let code = document.getElementById('siteCode').value.trim()
    let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
    
    let codeIndex = codes.indexOf(code)
    
    if(codeIndex !== -1) {
      // Code sahihi - futa code
      codes.splice(codeIndex, 1)
      localStorage.setItem('siteCodes', JSON.stringify(codes))
      
      localStorage.setItem('siteAccess', 'true')
      document.getElementById('codeLock').style.display = 'none'
      document.getElementById('siteContent').classList.remove('hidden')
      initSite()
    } else {
      document.getElementById('lockError').classList.remove('hidden')
      document.getElementById('siteCode').value = ''
    }
  })
}

// Initialize site baada ya kufunguliwa
function initSite() {
  loadGames()
  loadVideos()
  
  // Angalia kama ni admin - onyesha tab ya tutorials
  if(localStorage.getItem('isAdmin') === 'true') {
    document.getElementById('tutorialsTab').style.display = 'block'
  }
}

function showTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  event.target.classList.add('active')
  
  if(tab === 'games') {
    document.getElementById('gamesGrid').classList.remove('hidden')
    document.getElementById('tutorialsGrid').classList.add('hidden')
  } else {
    document.getElementById('gamesGrid').classList.add('hidden')
    document.getElementById('tutorialsGrid').classList.remove('hidden')
  }
}

// ========== CODES MFUMO ==========
function getCodes() {
  return JSON.parse(localStorage.getItem('siteCodes') || '[]')
}

function saveCodes(codes) {
  localStorage.setItem('siteCodes', JSON.stringify(codes))
}

// ========== GAMES ==========
function loadGames() {
  let games = JSON.parse(localStorage.getItem('games') || '[]')
  const grid = document.getElementById('gamesGrid')
  
  if(games.length === 0) {
    grid.innerHTML = '<p class="no-games">Bado hakuna games</p>'
    return
  }
  
  grid.innerHTML = games.map(game => `
    <div class="game-card" onclick="window.open('${game.url}', '_blank')">
      <img src="${game.image}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/250x180?text=No+Image'">
      <div class="game-info">
        <h3>${game.name}</h3>
        <span class="category">${game.category}</span>
      </div>
    </div>
  `).join('')
}

// ========== VIDEOS ==========
function loadVideos() {
  let videos = JSON.parse(localStorage.getItem('videos') || '[]')
  const grid = document.getElementById('tutorialsGrid')
  
  if(videos.length === 0) {
    grid.innerHTML = '<p class="no-games">Bado hakuna video za mafunzo</p>'
    return
  }
  
  grid.innerHTML = videos.map(video => `
    <div class="video-card">
      <div class="video-wrapper">
        <iframe src="${video.url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe>
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.desc}</p>
      </div>
    </div>
  `).join('')
}

// ========== ADMIN ==========
if(document.getElementById('uploadForm')) {
  localStorage.setItem('isAdmin', 'true') // Mark kama ni admin
  
  loadAdminGames()
  loadAdminVideos()
  loadCodes()
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('isAdmin')
    window.location.href = 'index.html'
  })
  
  // Tengeneza code
  document.getElementById('genCodeBtn').addEventListener('click', () => {
    let newCode = document.getElementById('newCode').value.trim()
    if(newCode === '') return alert('Andika code!')
    
    let codes = getCodes()
    if(codes.includes(newCode)) return alert('Code ipo tayari!')
    
    codes.push(newCode)
    saveCodes(codes)
    document.getElementById('newCode').value = ''
    loadCodes()
    alert('✅ Code: ' + newCode)
  })
  
  // Upload game
  document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault()
    let games = JSON.parse(localStorage.getItem('games') || '[]')
    games.unshift({
      id: Date.now(),
      name: document.getElementById('gameName').value,
      url: document.getElementById('gameUrl').value,
      image: document.getElementById('gameImage').value,
      category: document.getElementById('gameCategory').value
    })
    localStorage.setItem('games', JSON.stringify(games))
    alert('✅ Game imepandishwa!')
    document.getElementById('uploadForm').reset()
    loadAdminGames()
  })
  
  // Upload video
  document.getElementById('uploadVideoForm').addEventListener('submit', (e) => {
    e.preventDefault()
    let videos = JSON.parse(localStorage.getItem('videos') || '[]')
    videos.unshift({
      id: Date.now(),
      title: document.getElementById('videoTitle').value,
      url: document.getElementById('videoUrl').value,
      desc: document.getElementById('videoDesc').value
    })
    localStorage.setItem('videos', JSON.stringify(videos))
    alert('✅ Video imepandishwa!')
    document.getElementById('uploadVideoForm').reset()
    loadAdminVideos()
  })
}

function loadCodes() {
  let codes = getCodes()
  document.getElementById('codesList').innerHTML = codes.length === 0 ? 
    '<p style="color:#666;font-size:13px;margin-top:15px">Hakuna codes</p>' :
    '<h4 style="margin-top:20px;color:var(--neon)">Codes Active:</h4>' + 
    codes.map(code => `<div class="admin-game"><span><b>${code}</b></span><button onclick="deleteCode('${code}')">🗑️</button></div>`).join('')
}

window.deleteCode = (code) => {
  let codes = getCodes()
  saveCodes(codes.filter(c => c !== code))
  loadCodes()
}

function loadAdminGames() {
  let games = JSON.parse(localStorage.getItem('games') || '[]')
  document.getElementById('totalGames').textContent = games.length
  document.getElementById('adminGamesList').innerHTML = games.length === 0 ? 
    '<p class="no-games">Hakuna games</p>' :
    games.map(g => `<div class="admin-game"><span><b>${g.name}</b> - ${g.category}</span><button onclick="deleteGame(${g.id})">🗑️</button></div>`).join('')
}

window.deleteGame = (id) => {
  if(confirm('Futa?')) {
    let games = JSON.parse(localStorage.getItem('games') || '[]')
    localStorage.setItem('games', JSON.stringify(games.filter(g => g.id !== id)))
    loadAdminGames()
  }
}

function loadAdminVideos() {
  let videos = JSON.parse(localStorage.getItem('videos') || '[]')
  document.getElementById('totalVideos').textContent = videos.length
  document.getElementById('adminVideosList').innerHTML = videos.length === 0 ? 
    '<p class="no-games">Hakuna videos</p>' :
    videos.map(v => `<div class="admin-game"><span><b>${v.title}</b></span><button onclick="deleteVideo(${v.id})">🗑️</button></div>`).join('')
}

window.deleteVideo = (id) => {
  if(confirm('Futa video?')) {
    let videos = JSON.parse(localStorage.getItem('videos') || '[]')
    localStorage.setItem('videos', JSON.stringify(videos.filter(v => v.id !== id)))
    loadAdminVideos()
  }
}