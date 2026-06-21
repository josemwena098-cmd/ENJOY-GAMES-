// ===== TAB SWITCH =====
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'))
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  document.getElementById(tab).classList.add('active')
  event.target.classList.add('active')
}

// ===== CHECK ACCESS NA FIREBASE =====
function checkLock() {
  let userCode = localStorage.getItem('myAccessCode')
  
  if(localStorage.getItem('siteAccess') === 'true' && userCode) {
    db.ref('usedCodes/' + userCode).once('value', snap => {
      if(!snap.exists()) {
        localStorage.removeItem('siteAccess')
        localStorage.removeItem('myAccessCode')
        alert('⚠️ Code yako imefutwa na admin')
        location.reload()
      } else {
        document.getElementById('codeLock').style.display = 'none'
        document.getElementById('siteContent').classList.remove('hidden')
        initSite()
      }
    })
  }
}
if(document.getElementById('codeLock')) checkLock()

// Unlock na code 1-time
if(document.getElementById('unlockBtn')) {
  document.getElementById('unlockBtn').addEventListener('click', () => {
    let code = document.getElementById('siteCode').value.trim()
    
    db.ref('siteCodes/' + code).once('value', snap => {
      if(snap.exists()) {
        db.ref('siteCodes/' + code).remove()
        db.ref('usedCodes/' + code).set(true)
        
        localStorage.setItem('myAccessCode', code)
        localStorage.setItem('siteAccess', 'true')
        
        document.getElementById('codeLock').style.display = 'none'
        document.getElementById('siteContent').classList.remove('hidden')
        initSite()
        alert('✅ Umeingia! Code imetumika')
      } else {
        document.getElementById('lockError').classList.remove('hidden')
        setTimeout(() => document.getElementById('lockError').classList.add('hidden'), 3000)
      }
    })
  })
}

function initSite() {
  loadGames()
  loadVideos()
}

// LOAD GAMES
function loadGames() {
  if(!document.getElementById('gamesGrid')) return
  
  db.ref('games').on('value', snap => {
    let games = []
    snap.forEach(child => games.push(child.val()))
    const grid = document.getElementById('gamesGrid')
    if(games.length === 0) {
      grid.innerHTML = '<p class="no-games">Bado hakuna games. Admin aongeze.</p>'
      return
    }
    grid.innerHTML = games.reverse().map(game => {
      let categoryBadge = `<span class="category-badge">${game.category}</span>`
      
      // Fix link ya Mediafire i-download direct
      let buttons = game.links.map(link => {
        let downloadLink = link.url.replace('/file?dkey=', '/download?dkey=').replace('/file', '/download')
        return `<a href="${downloadLink}" target="_blank" class="download-btn">⬇️ ${link.label}</a>`
      }).join('')
      
      return `<div class="game-card">
        ${categoryBadge}
        <img src="${game.image}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="game-info">
          <h3>${game.name}</h3>
          <p class="game-desc">${game.desc}</p>
          ${buttons}
        </div>
      </div>`
    }).join('')
  })
}

// LOAD VIDEOS YOUTUBE
function loadVideos() {
  if(!document.getElementById('videosGrid')) return
  
  db.ref('videos').on('value', snap => {
    let videos = []
    snap.forEach(child => videos.push(child.val()))
    const grid = document.getElementById('videosGrid')
    if(videos.length === 0) {
      grid.innerHTML = '<p class="no-games">Bado hakuna videos.</p>'
      return
    }
    grid.innerHTML = videos.reverse().map(video => `
      <div class="video-card">
        <iframe width="100%" height="200" src="https://www.youtube.com/embed/${video.videoId}" 
        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <div class="video-info">
          <h3>${video.title}</h3>
          <p>${video.desc}</p>
        </div>
      </div>
    `).join('')
  })
}

// ===== ADMIN LOGIC =====
if(document.getElementById('uploadForm')) {
  loadCodes()
  
  // Badili form kama ni PPSSPP au PS2
  document.getElementById('gameCategory').addEventListener('change', (e) => {
    if(e.target.value === 'PPSSPP' || e.target.value === 'PS2') {
      document.getElementById('singleLink').classList.add('hidden')
      document.getElementById('multiLinks').classList.remove('hidden')
    } else {
      document.getElementById('singleLink').classList.remove('hidden')
      document.getElementById('multiLinks').classList.add('hidden')
    }
  })
  
  document.getElementById('genCodeBtn').addEventListener('click', () => {
    let newCode = document.getElementById('newCode').value.trim()
    if(newCode === '') return alert('Andika code!')
    db.ref('siteCodes/' + newCode).set(true)
    document.getElementById('newCode').value = ''
    alert('✅ Code imetengenezwa: ' + newCode)
  })
  
  document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault()
    let cat = document.getElementById('gameCategory').value
    let newGame = {
      id: Date.now(), 
      name: document.getElementById('gameName').value, 
      image: document.getElementById('gameImage').value, 
      category: cat, 
      desc: document.getElementById('gameDesc').value, 
      links: []
    }
    if(cat === 'PPSSPP' || cat === 'PS2') {
      let l1 = document.getElementById('gameUrl1').value.trim()
      let l2 = document.getElementById('gameUrl2').value.trim()
      let l3 = document.getElementById('gameUrl3').value.trim()
      if(l1) newGame.links.push({url: l1, label: 'Download 1'})
      if(l2) newGame.links.push({url: l2, label: 'Download 2'})
      if(l3) newGame.links.push({url: l3, label: 'Download 3'})
    } else {
      newGame.links.push({url: document.getElementById('gameUrl').value, label: 'DOWNLOAD'})
    }
    db.ref('games/' + newGame.id).set(newGame)
    alert('✅ Game imepandishwa!')
    document.getElementById('uploadForm').reset()
  })
  
  document.getElementById('videoForm').addEventListener('submit', (e) => {
    e.preventDefault()
    let link = document.getElementById('videoLink').value
    let videoId = link.split('v=')[1]?.split('&')[0] || link.split('youtu.be/')[1]
    
    if(!videoId) return alert('Link ya YouTube si sahihi!')
    
    let newVideo = {
      id: Date.now(),
      title: document.getElementById('videoTitle').value,
      desc: document.getElementById('videoDesc').value,
      videoId: videoId,
      createdAt: Date.now()
    }
    
    db.ref('videos/' + newVideo.id).set(newVideo)
    alert('✅ Video imepandishwa!')
    document.getElementById('videoForm').reset()
  })
}

function loadCodes() {
  db.ref('siteCodes').on('value', snap => {
    let codes = []
    snap.forEach(child => codes.push(child.key))
    document.getElementById('activeCodes').textContent = codes.length
    document.getElementById('codesList').innerHTML = codes.map(c => 
      `<div class="code-item"><span><b>${c}</b></span><button class="delete-btn" onclick="deleteCode('${c}')">🗑️ Futa</button></div>`
    ).join('')
  })
  
  db.ref('usedCodes').on('value', snap => {
    let used = []
    snap.forEach(child => used.push(child.key))
    document.getElementById('usedCodes').textContent = used.length
  })
}

window.deleteCode = (code) => {
  if(confirm('Futa code hii? Mtu aliyetumia atatolewa!')) {
    db.ref('siteCodes/' + code).remove()
    db.ref('usedCodes/' + code).remove()
  }
                                   }
