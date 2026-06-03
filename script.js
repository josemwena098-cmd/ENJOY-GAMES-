// ========== LOCK YA SITE YOTE ==========
function checkLock() {
  if(localStorage.getItem('siteAccess') === 'true') {
    document.getElementById('codeLock').style.display = 'none'
    document.getElementById('siteContent').classList.remove('hidden')
    initSite()
  }
}

checkLock()

if(document.getElementById('unlockBtn')) {
  document.getElementById('unlockBtn').addEventListener('click', () => {
    let code = document.getElementById('siteCode').value.trim()
    let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
    
    let codeIndex = codes.indexOf(code)
    
    if(codeIndex !== -1) {
      codes.splice(codeIndex, 1)
      localStorage.setItem('siteCodes', JSON.stringify(codes))
      localStorage.setItem('siteAccess', 'true')
      document.getElementById('codeLock').style.display = 'none'
      document.getElementById('siteContent').classList.remove('hidden')
      initSite()
    } else {
      document.getElementById('lockError').classList.remove('hidden')
      document.getElementById('siteCode').value = ''
      setTimeout(() => document.getElementById('lockError').classList.add('hidden'), 3000)
    }
  })
}

function initSite() {
  loadGames()
  loadVideos()
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

// ========== GAMES NA MAELEZO ==========
function loadGames() {
  let games = JSON.parse(localStorage.getItem('games') || '[]')
  const grid = document.getElementById('gamesGrid')
  
  if(games.length === 0) {
    grid.innerHTML = '<p class="no-games">Bado hakuna games. Admin atapandisha hivi karibuni.</p>'
    return
  }
  
  grid.innerHTML = games.map(game => `
    <div class="game-card">
      <img src="${game.image}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/280x180?text=Game'">
      <div class="game-info">
        <h3>${game.name}</h3>
        <span class="category">${game.category}</span>
        <p class="game-desc">${game.desc || 'Hakuna maelezo'}</p>
        <button class="play-btn" onclick="window.open('${game.url}', '_blank')">▶ CHEZA SASA</button>
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

// ========== ADMIN DASHBOARD ==========
if(document.getElementById('uploadForm')) {
  localStorage.setItem('isAdmin', 'true')
  loadAdminGames()
  loadAdminVideos()
  loadCodes()
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('siteAccess')
    window.location.href = 'index.html'
  })
  
  // Tengeneza code
  document.getElementById('genCodeBtn').addEventListener('click', () => {
    let newCode = document.getElementById('newCode').value.trim()
    if(newCode === '') return alert('Andika code kwanza!')
    
    let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
    if(codes.includes(newCode)) return alert('Code ipo tayari!')
    
    codes.push(newCode)
    localStorage.setItem('siteCodes', JSON.stringify(codes))
    document.getElementById('newCode').value = ''
    loadCodes()
    alert('✅ Code imetengenezwa: ' + newCode + '\n\nCode hii inatumiwa mara 1 tu!')
  })
  
  // Upload game + maelezo
  document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault()
    let games = JSON.parse(localStorage.getItem('games') || '[]')
    games.unshift({
      id: Date.now(),
      name: document.getElementById('gameName').value,
      url: document.getElementById('gameUrl').value,
      image: document.getElementById('gameImage').value,
      category: document.getElementById('gameCategory').value,
      desc: document.getElementById('gameDesc').value
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
  let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
  document.getElementById('activeCodes').textContent = codes.length
  
  const list = document.getElementById('codesList')
  if(codes.length === 0) {
    list.innerHTML = '<p style="color:#666;font-size:13px;margin-top:15px">Hakuna codes active</p>'
    return
  }
  
  list.innerHTML = '<h4 style="margin-top:20px;color:var(--neon)">Codes Active:</h4>' + 
    codes.map(code => `
      <div class="code-item">
        <span><b>${code}</b></span>
        <button class="delete-btn" onclick="deleteCode('${code}')">🗑️ Futa</button>
      </div>
    `).join('')
}

window.deleteCode = (code) => {
  if(confirm('Una uhakika kufuta code hii?')) {
    let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
    localStorage.setItem('siteCodes', JSON.stringify(codes.filter(c => c !== code)))
    loadCodes()
  }
}

function loadAdminGames() {
  let games = JSON.parse(localStorage.getItem('games') || '[]')
  document.getElementById('totalGames').textContent = games.length
  
  const list = document.getElementById('adminGamesList')
  if(games.length === 0) {
    list.innerHTML = '<p class="no-games">Hakuna games bado</p>'
    return
  }
  
  list.innerHTML = games.map(game => `
    <div class="admin-game">
      <div>
        <b>${game.name}</b> - ${game.category}<br>
        <small style="color:#aaa">${game.desc ? game.desc.substring(0,60)+'...' : 'Hakuna maelezo'}</small>
      </div>
      <button class="delete-btn" onclick="deleteGameWithCode(${game.id})">🗑️ Futa</button>
    </div>
  `).join('')
}

// KUFUTA GAME KWA CODE YA UTHIBITISHO
window.deleteGameWithCode = (id) => {
  let code = prompt('⚠️ Weka CODE ya uthibitisho ili ufute game hii:\n\nCode lazima iwe active!')
  if(code === null) return
  
  let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
  if(!codes.includes(code)) {
    alert('❌ Code si sahihi! Game haijafutwa.')
    return
  }
  
  codes = codes.filter(c => c !== code)
  localStorage.setItem('siteCodes', JSON.stringify(codes))
  
  let games = JSON.parse(localStorage.getItem('games') || '[]')
  games = games.filter(g => g.id !== id)
  localStorage.setItem('games', JSON.stringify(games))
  
  alert('✅ Game imefutwa na code imetumika!')
  loadAdminGames()
  loadCodes()
}

function loadAdminVideos() {
  let videos = JSON.parse(localStorage.getItem('videos') || '[]')
  document.getElementById('totalVideos').textContent = videos.length
  document.getElementById('adminVideosList').innerHTML = videos.length === 0 ? 
    '<p class="no-games">Hakuna videos</p>' :
    videos.map(v => `<div class="admin-game"><div><b>${v.title}</b><br><small style="color:#aaa">${v.desc.substring(0,50)}...</small></div><button class="delete-btn" onclick="deleteVideo(${v.id})">🗑️</button></div>`).join('')
}

window.deleteVideo = (id) => {
  if(confirm('Futa video hii?')) {
    let videos = JSON.parse(localStorage.getItem('videos') || '[]')
    localStorage.setItem('videos', JSON.stringify(videos.filter(v => v.id !== id)))
    loadAdminVideos()
  }
}