// ========== CHECK ACCESS + KUFUTA CODE UKITUMIKA ==========
function checkLock() {
  let userCode = localStorage.getItem('myAccessCode')
  let usedCodes = JSON.parse(localStorage.getItem('usedCodes') || '[]')
  
  // Kama code ya user imetumika na admin kaifuta, mtoe site
  if(userCode && usedCodes.includes(userCode) === false) {
    localStorage.removeItem('siteAccess')
    localStorage.removeItem('myAccessCode')
    alert('⚠️ Code yako imefutwa na admin. Weka code mpya.')
  }
  
  if(localStorage.getItem('siteAccess') === 'true' && userCode) {
    document.getElementById('codeLock').style.display = 'none'
    document.getElementById('siteContent').classList.remove('hidden')
    initSite()
  }
}
checkLock()

// User akitoka mwenyewe
if(document.getElementById('logoutUserBtn')) {
  document.getElementById('logoutUserBtn').addEventListener('click', () => {
    localStorage.removeItem('siteAccess')
    localStorage.removeItem('myAccessCode')
    location.reload()
  })
}

// Unlock na code 1-time
if(document.getElementById('unlockBtn')) {
  document.getElementById('unlockBtn').addEventListener('click', () => {
    let code = document.getElementById('siteCode').value.trim()
    let availableCodes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
    let usedCodes = JSON.parse(localStorage.getItem('usedCodes') || '[]')
    
    if(availableCodes.includes(code)) {
      // Futa code kwenye available, ihamie kwenye used
      availableCodes = availableCodes.filter(c => c !== code)
      usedCodes.push(code)
      localStorage.setItem('siteCodes', JSON.stringify(availableCodes))
      localStorage.setItem('usedCodes', JSON.stringify(usedCodes))
      
      // Hifadhi code ya huyu user
      localStorage.setItem('myAccessCode', code)
      localStorage.setItem('siteAccess', 'true')
      
      document.getElementById('codeLock').style.display = 'none'
      document.getElementById('siteContent').classList.remove('hidden')
      initSite()
      alert('✅ Umeingia! Code yako imetumika. Ukitoa site utahitaji code mpya.')
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
  document.getElementById('tutorialsTab').style.display = 'block'
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
    loadVideos()
  }
}

function loadGames() {
  let games = JSON.parse(localStorage.getItem('games') || '[]')
  const grid = document.getElementById('gamesGrid')
  if(games.length === 0) {
    grid.innerHTML = '<p class="no-games">Bado hakuna games.</p>'
    return
  }
  grid.innerHTML = games.map(game => {
    let buttons = game.links.map(link => `<button class="play-btn" onclick="window.open('${link.url}', '_blank')">${link.label}</button>`).join('')
    return `<div class="game-card"><img src="${game.image}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/280x180?text=Game'"><div class="game-info"><h3>${game.name}</h3><span class="category ${game.category}">${game.category}</span><p class="game-desc">${game.desc || 'Hakuna maelezo'}</p>${buttons}</div></div>`
  }).join('')
}

function loadVideos() {
  let videos = JSON.parse(localStorage.getItem('videos') || '[]')
  const grid = document.getElementById('tutorialsGrid')
  if(videos.length === 0) {
    grid.innerHTML = '<p class="no-games">Bado hakuna video za mafunzo.</p>'
    return
  }
  grid.innerHTML = videos.map(video => {
    let player = ''
    if(video.type === 'youtube') {
      let embedUrl = video.url
      if(video.url.includes('watch?v=')) embedUrl = video.url.replace('watch?v=', 'embed/')
      else if(video.url.includes('youtu.be/')) embedUrl = video.url.replace('youtu.be/', 'youtube.com/embed/')
      player = `<div class="video-wrapper"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`
    } else if(video.type === 'upload') {
      player = `<div class="video-wrapper"><video controls><source src="${video.data}" type="${video.filetype}"></video></div>`
    }
    return `<div class="video-card">${player}<div class="video-info"><h3>${video.title}</h3><p>${video.desc}</p></div></div>`
  }).join('')
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
  
  document.getElementById('genCodeBtn').addEventListener('click', () => {
    let newCode = document.getElementById('newCode').value.trim()
    if(newCode === '') return alert('Andika code kwanza!')
    let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
    let used = JSON.parse(localStorage.getItem('usedCodes') || '[]')
    if(codes.includes(newCode) || used.includes(newCode)) return alert('Code ipo tayari!')
    codes.push(newCode)
    localStorage.setItem('siteCodes', JSON.stringify(codes))
    document.getElementById('newCode').value = ''
    loadCodes()
    alert('✅ Code imetengenezwa: ' + newCode + '\nMtu 1 tu atatumia!')
  })
  
  document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault()
    let cat = document.getElementById('gameCategory').value
    let games = JSON.parse(localStorage.getItem('games') || '[]')
    let newGame = {id: Date.now(), name: document.getElementById('gameName').value, image: document.getElementById('gameImage').value, category: cat, desc: document.getElementById('gameDesc').value, links: []}
    if(cat === 'PPSSPP' || cat === 'PS2') {
      let l1 = document.getElementById('gameUrl1').value.trim()
      let l2 = document.getElementById('gameUrl2').value.trim()
      let l3 = document.getElementById('gameUrl3').value.trim()
      if(l1) newGame.links.push({url: l1, label: 'Download 1'})
      if(l2) newGame.links.push({url: l2, label: 'Download 2'})
      if(l3) newGame.links.push({url: l3, label: 'Download 3'})
    } else {
      newGame.links.push({url: document.getElementById('gameUrl').value, label: 'Cheza Sasa'})
    }
    if(newGame.links.length === 0) return alert('❌ Weka angalau link 1!')
    games.unshift(newGame)
    localStorage.setItem('games', JSON.stringify(games))
    alert('✅ Game imepandishwa!')
    document.getElementById('uploadForm').reset()
    toggleLinks()
    loadAdminGames()
  })
  
  document.getElementById('uploadVideoForm').addEventListener('submit', (e) => {
    e.preventDefault()
    let type = document.getElementById('videoType').value
    let title = document.getElementById('videoTitle').value
    let desc = document.getElementById('videoDesc').value
    if(type === 'youtube') {
      let url = document.getElementById('videoUrl').value
      if(!url) return alert('Weka link ya YouTube!')
      let videos = JSON.parse(localStorage.getItem('videos') || '[]')
      videos.unshift({id: Date.now(), title, desc, type: 'youtube', url})
      localStorage.setItem('videos', JSON.stringify(videos))
      alert('✅ Video ya YouTube imepandishwa!')
      document.getElementById('uploadVideoForm').reset()
      toggleVideoType()
      loadAdminVideos()
    }
    else if(type === 'upload') {
      let file = document.getElementById('videoFile').files[0]
      if(!file) return alert('Chagua video kwanza!')
      if(file.size > 10 * 1024 * 1024) return alert('❌ Max 10MB!')
      let reader = new FileReader()
      reader.onload = function(e) {
        let videos = JSON.parse(localStorage.getItem('videos') || '[]')
        videos.unshift({id: Date.now(), title, desc, type: 'upload', data: e.target.result, filetype: file.type})
        localStorage.setItem('videos', JSON.stringify(videos))
        alert('✅ Video imepandishwa!')
        document.getElementById('uploadVideoForm').reset()
        toggleVideoType()
        loadAdminVideos()
      }
      reader.readAsDataURL(file)
    }
  })
}

// ========== ONE-TIME CODE LOGIC ==========
function loadCodes() {
  let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
  let used = JSON.parse(localStorage.getItem('usedCodes') || '[]')
  
  document.getElementById('activeCodes').textContent = codes.length
  document.getElementById('usedCodes').textContent = used.length
  
  // Codes zilizobaki
  const list = document.getElementById('codesList')
  if(codes.length === 0) {
    list.innerHTML = '<p style="color:#666;font-size:13px;margin-top:15px">Hakuna codes active</p>'
  } else {
    list.innerHTML = '<h4 style="margin-top:20px;color:var(--neon)">Codes Active - Zisizotumika:</h4>' + 
      codes.map(code => `<div class="code-item"><span><b>${code}</b> - Hazijatumika</span><button class="delete-btn" onclick="deleteCode('${code}')">🗑️ Futa</button></div>`).join('')
  }
  
  // Codes zilizotumika
  const usedList = document.getElementById('usedCodesList')
  if(used.length === 0) {
    usedList.innerHTML = '<p style="color:#666;font-size:13px">Hakuna mtu ameweka code bado</p>'
  } else {
    usedList.innerHTML = used.map(code => `<div class="code-item" style="border-left-color:var(--pink)"><span><b>${code}</b> - Imeshakamatwa</span></div>`).join('')
  }
}

window.deleteCode = (code) => {
  if(confirm('Una uhakika kufuta code hii?\nMtu aliyetumia code hii atatolewa site mara moja!')) {
    let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
    let used = JSON.parse(localStorage.getItem('usedCodes') || '[]')
    
    // Futa code kwenye available
    codes = codes.filter(c => c !== code)
    localStorage.setItem('siteCodes', JSON.stringify(codes))
    
    // Kama code imetumika, ifute kwenye used pia ili watu wote waliotumia watoke
    if(used.includes(code)) {
      used = used.filter(c => c !== code)
      localStorage.setItem('usedCodes', JSON.stringify(used))
    }
    
    loadCodes()
    alert('✅ Code imefutwa! Mtu aliyetumia code hii atatolewa akirefresh site.')
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
  list.innerHTML = games.map(game => `<div class="admin-game"><div><b>${game.name}</b> - <span class="category ${game.category}">${game.category}</span><br><small style="color:#aaa">${game.desc ? game.desc.substring(0,60)+'...' : 'Hakuna maelezo'}</small><br><small style="color:var(--neon)">${game.links.length} link(s)</small></div><button class="delete-btn" onclick="deleteGameWithCode(${game.id})">🗑️ Futa</button></div>`).join('')
}

window.deleteGameWithCode = (id) => {
  let code = prompt('⚠️ Weka CODE ya uthibitisho:')
  if(code === null) return
  let codes = JSON.parse(localStorage.getItem('siteCodes') || '[]')
  if(!codes.includes(code)) return alert('❌ Code si sahihi!')
  codes = codes.filter(c => c !== code)
  localStorage.setItem('siteCodes', JSON.stringify(codes))
  let games = JSON.parse(localStorage.getItem('games') || '[]')
  games = games.filter(g => g.id !== id)
  localStorage.setItem('games', JSON.stringify(games))
  alert('✅ Game imefutwa!')
  loadAdminGames()
  loadCodes()
}

function loadAdminVideos() {
  let videos = JSON.parse(localStorage.getItem('videos') || '[]')
  document.getElementById('totalVideos').textContent = videos.length
  document.getElementById('adminVideosList').innerHTML = videos.length === 0? '<p class="no-games">Hakuna videos</p>' : videos.map(v => `<div class="admin-game"><div><b>${v.title}</b> - ${v.type === 'youtube'? '🔗 YouTube' : '📤 Uploaded'}<br><small style="color:#aaa">${v.desc.substring(0,50)}...</small></div><button class="delete-btn" onclick="deleteVideo(${v.id})">🗑️</button></div>`).join('')
}

window.deleteVideo = (id) => {
  if(confirm('Futa video hii?')) {
    let videos = JSON.parse(localStorage.getItem('videos') || '[]')
    localStorage.setItem('videos', JSON.stringify(videos.filter(v => v.id!== id)))
    loadAdminVideos()
  }
}