var $vm = new Vue({
  el: '#app',
  mixins: [socketMixin],
  data() {
    return {
      state: 'pending',
      emojis: emojis,
      emojiVisible: false,
      inputMsg: '',
    }
  },
  computed: {
    targetName() {
      switch (this.state) {
        case 'pending':
          return '匹配中'
        case 'waiting':
          return '匿名聊天'
        case 'done':
          return this.getUserName(targetUser.id)
      }
    },
    showMatch() {
      return this.state !== 'done'
    },
    loading() {
      return this.state === 'pending'
    },
    bodyStyle() {
      return {
        height: this.emojiVisible ? 'calc(100vh - 2.64rem)' : 'calc(100vh - 1rem)',
      }
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    emojiSrc(emoji) {
      return `./emojis/${emoji}.png`
    },
    showEmoji() {
      this.emojiVisible = !this.emojiVisible
    },
    addEmoji(emoji) {
      this.inputMsg += emoji
    },
    match() {
      socket.emit('match')
      this.state = 'pending'
    },
    leave() {
      socket.emit('leave')
      this.state = 'waiting'
    },
    editNickName() {
      var userName = prompt('输入昵称')
      if (!userName) {
        return
      }
      var newUser = userName + '' + new Date().getTime()
      localStorage.setItem('user', newUser)
      socket.emit('del', true)
      location.reload()
    },
  }
})
