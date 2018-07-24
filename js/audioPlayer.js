var log = console.log.bind(console)

var e = selector => document.querySelector(selector)

var es = selector => document.querySelectorAll(selector)

var removeClassAll = function(className) {
    var selector = '.' + className
    var elements = es(selector)
    for (var i = 0; i < elements.length; i++) {
        var e = elements[i]
        e.classList.remove(className)
    }
}

var nextSong = function(audios, audio, offset) {
    var index = Number(audio.dataset.index)
    var random = e('.fa-random')
    var nextIndex
    if (random.classList.contains('hidden')) {
        nextIndex = (audios.length + index + Number(offset)) % audios.length
    } else {
        nextIndex = parseInt((Math.random()) * audios.length)
    }
    audio.dataset.index = nextIndex
    return nextIndex
}

var insertAudioList = (audios) => {
    var list = e('#audio-list')
    for (var i = 0; i < audios.length; i++) {
        var song = audios[i].path.slice(4, -4)
        var s = i === 0 ? 'selected' : ''
        list.insertAdjacentHTML('beforeend', `<li id="id-list-${i}" class=${s}>${song}</li>`)
    }
}


var loadLrc = (audios, audio) => {
    insertLrc(audios, audio, 0)
}

var insertLrc = (audios, audio, index) => {
    var lrc = audios[index]['lrc']
    var playerLrc = e('.player-lrc')
    playerLrc.innerHTML = `<div id="id-lrc"></div>`
    var a = lrc.split('[')
    var b = a.map(k => k.split(']'))
    b.map(m => {
        var time = m[0].split(':')
        var s = Number(time[0]) * 60 + parseInt(time[1])
        if (!isNaN(s)) {
            var id = `id=${s}`
            var lrcs = m[1]
            var t = `
                <p ${id}>${lrcs}</p>
            `
            var playerLrc = e('#id-lrc')
            playerLrc.insertAdjacentHTML('beforeend', t)
        }
    })
}

var bindEventCanplay = function(audio, callback) {
    var a = audio
    a.addEventListener('canplay', callback)
}

var bindEventEnded = function(audio, callback) {
    var a = audio
    a.addEventListener('ended', callback)
}

var bindEventSwitch = () => {
    var header = e('#id-player-container>header')
    var pg1 = e('.audio-play-pg1')
    var pg2 = e('.audio-play-pg2')
    header.addEventListener('click', (event) => {
        var self = event.target
        if (self.classList.contains('pg1')) {
            var t1 = e('.show')
            var t2 = e('.hidden')
            t1.classList.remove('show')
            t2.classList.remove('hidden')
            self.classList.add('show')
            pg2.classList.add('hidden')
        } else if (self.classList.contains('pg2')) {
            var t1 = e('.show')
            var t2 = e('.hidden')
            t1.classList.remove('show')
            t2.classList.remove('hidden')
            self.classList.add('show')
            pg1.classList.add('hidden')
        }
    })
}

var bindEventAudioSwitch = (audios, a) => {
    var audioList = e('#audio-list')
    audioList.addEventListener('click', (event) => {
        var self = event.target
        if (self.tagName = 'LI') {
            var index = self.id.slice(8)
            audioIndex(audios, a, index)
            a.dataset.index = index
        }
    })
}

var bindEventVolumeInput = (a) => {
    var control = e('.volume-control')
    var volume = e('.fa-volume-up')
    control.addEventListener('input', (event) => {
        var value = event.target.value
        a.volume = value / 100
    })
}

var audioCurrentTime = function(audio) {
    var c = e('.current-time')
    var clockId = setInterval(function() {
        var ct = parseInt(audio.currentTime)
        var m = parseInt(ct / 60)
        var s = ct % 60
        if (m < 10) {
            m = `0${m}`
        }
        if (s < 10) {
            s = `0${s}`
        }
        c.innerHTML = `${m}:${s}`
    }, 1000)
}

var audioTotalTime = function(audio) {
    var t = e('.total-time')
    bindEventCanplay(audio, function() {
        var time = parseInt(audio.duration)
        var m = parseInt(time / 60)
        var s = time % 60
        if (m < 10) {
            m = `0${m}`
        }
        if (s < 10) {
            s = `0${s}`
        }
        t.innerHTML = `${m}:${s}`
    })
}

var audioCurrentBar = function(audio) {
    var c = e('.bar')
    var co = e('.controller')
    var clockId = setInterval(function() {
        var ct = parseInt(audio.currentTime)
        var time = parseInt(audio.duration)
        var n = ct / time
        c.style.width = `${200 * n}px`
        co.style.left = `${200 * n}px`
    }, 1000)
}

var bindEventController = (audio) => {
    var c = e('.bar-container')
    c.addEventListener('click', (event) => {
        var self = event.target
        var x0 = self.offsetLeft

        var x = event.clientX
        var n = (x - x0) / 200
        var time = parseInt(audio.duration)
        audio.currentTime = parseInt(time * n)
    })
}

var audioPlay = function(audios, audio) {
    var playerContainer = e('#id-player-container')
    var playButton = e('.player-img>img')
    var play = e('.fa-play')
    var pause = e('.fa-pause')
    var random = e('.fa-random')
    var refresh = e('.fa-refresh')
    playerContainer.addEventListener('click', function(event){
        var self = event.target
        var c = self.classList
        if (c.contains('cover') || c.contains('fa-play') || c.contains('fa-pause')) {
            if (audio.paused) {
                audio.play()
                playButton.classList.add('rotate')
                pause.classList.remove('hidden')
                play.classList.add('hidden')
            } else {
                audio.pause()
                playButton.classList.remove('rotate')
                play.classList.remove('hidden')
                pause.classList.add('hidden')
            }
        } else if (c.contains('fa-backward') || c.contains('fa-forward')) {
            var offset = self.dataset.offset
            var index = nextSong(audios, audio, offset)
            audioIndex(audios, audio, index)
        } else if (c.contains('fa-random')) {
            refresh.classList.remove('hidden')
            random.classList.add('hidden')
        } else if (c.contains('fa-refresh')) {
            random.classList.remove('hidden')
            refresh.classList.add('hidden')
        }
    })
}


var audioIndex = (audios, a, index) => {
    var song = audios[index].path
    var img = audios[index].img
    var cover = e('.cover')
    cover.src = img
    a.src = song
    a.play()
    var playButton = e('.player-img>img')
    playButton.classList.add('rotate')

    var play = e('.fa-play')
    var pause = e('.fa-pause')
    pause.classList.remove('hidden')
    play.classList.add('hidden')

    var header = e('section>header')
    header.innerHTML = song.slice(4, -4)
    insertLrc(audios, a, index)
    clearInterval(clockId_1)
    audioCurrentLrc(a)

    var li = e(`#id-list-${index}`)
    var s = e('.selected')
    s.classList.remove('selected')
    li.classList.add('selected')
}

var clockId_1

var audioCurrentLrc = function(audio) {
    var lrc = es('#id-lrc>p')
    var lrcContainer = e('#id-lrc')
    clockId_1 = setInterval(function() {
        var ct = parseInt(audio.currentTime)
        for (var i = 0; i < lrc.length; i++) {
            if (Number(lrc[i].id) === ct) {
                var y = -24 * (i - 2)
                removeClassAll('selected-lrc')
                lrc[i].classList.add('selected-lrc')
                if (i > 2) {
                    lrcContainer.style.transform = `translateY(${y}px)`
                }
            }
        }
    }, 1000)
}

var audioEnd = (audios, a) => {
    bindEventEnded(a, () => {
        var index = nextSong(audios, a, 1)
        audioIndex(audios, a, index)
    })
}

var bindEvents = function(audios, a) {
    bindEventController(a)
    bindEventAudioSwitch(audios, a)
    bindEventSwitch()
    bindEventVolumeInput(a)
    audioCurrentLrc(a)
    audioCurrentTime(a)
    audioTotalTime(a)
    audioCurrentBar(a)
    audioPlay(audios, a)
    audioEnd(audios, a)
}

var __main = function() {
    var a = document.querySelector('#id-audio-player')
    var audios = mp3()
    loadLrc(audios, a)
    insertAudioList(audios)
    bindEvents(audios, a)
}

__main()
