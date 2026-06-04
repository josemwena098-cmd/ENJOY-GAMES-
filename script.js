// LOCK + TABS + GAMES zibaki vile kama code ya mwisho...
// Hapa naweka sehemu ya Video tu ili isiwe ndefu sana

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
      player = `<div class="video-wrapper"><video controls style="width:100%;height:100%;object-fit:cover"><source src="${video.data}" type="${video.filetype}"></video></div>`
    }

    return `
      <div class="video-card">
        ${player}
        <div class="video-info">
          <h3>${video.title}</h3>
          <p>${video.desc}</p>
        </div>
      </div>
    `
  }).join('')
}

// ADMIN VIDEO UPLOAD
if(document.getElementById('uploadVideoForm')) {
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

      if(file.size > 10 * 1024 * 1024) {
        return alert('❌ Video ni kubwa sana! Max 10MB. Tumia YouTube link kwa video kubwa.')
      }

      let reader = new FileReader()
      reader.onload = function(e) {
        let videos = JSON.parse(localStorage.getItem('videos') || '[]')
        videos.unshift({
          id: Date.now(),
          title,
          desc,
          type: 'upload',
          data: e.target.result,
          filetype: file.type
        })
        localStorage.setItem('videos', JSON.stringify(videos))
        alert('✅ Video imepandishwa kutoka simu!')
        document.getElementById('uploadVideoForm').reset()
        toggleVideoType()
        loadAdminVideos()
      }
      reader.readAsDataURL(file)
    }
  })
}

// loadAdminVideos - onyesha aina ya video
function loadAdminVideos() {
  let videos = JSON.parse(localStorage.getItem('videos') || '[]')
  document.getElementById('totalVideos').textContent = videos.length
  document.getElementById('adminVideosList').innerHTML = videos.length === 0?
    '<p class="no-games">Hakuna videos bado</p>' :
    videos.map(v => `<div class="admin-game"><div><b>${v.title}</b> - ${v.type === 'youtube'? '🔗 YouTube' : '📤 Uploaded'}<br><small style="color:#aaa">${v.desc.substring(0,50)}...</small></div><button class="delete-btn" onclick="deleteVideo(${v.id})">🗑️</button></div>`).join('')
}

window.deleteVideo = (id) => {
  if(confirm('Futa video hii?')) {
    let videos = JSON.parse(localStorage.getItem('videos') || '[]')
    localStorage.setItem('videos', JSON.stringify(videos.filter(v => v.id!== id)))
    loadAdminVideos()
  }
}

// SEHEMU NYINGINE ZOTE ZA LOCK + GAMES + CODES ZIBAKI VILE VILE KAMA CODE YA MWISHO