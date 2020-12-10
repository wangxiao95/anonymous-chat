var targetUser = null
var $messageBox = null
var messageId = null
var socket = io()
var userId = null
var momentId = null
var backId = null

var socketMixin = {
  methods: {
    init() {
      $messageBox = $('#messageBox')
      userId = this.getUserId()

      socket.on('connect', () => {

        socket.emit('init', userId)

        socket.on('relation', user => {
          // console.log('relation', user)
          targetUser = user
          // $messageBox.html('')

          var targetUserName = this.getUserName(targetUser.id)
          var toast = `<li class="toast">
            <div class="toast-inner">恭喜您匹配到：${targetUserName}</div>
          </li>`
          var toastWarn = `<li class="toast is-warn">
            <div class="toast-inner">以下是和 ${targetUserName} 的聊天</div>
          </li>`
          this.addMsg(toast)
          this.addMsg(toastWarn)
          this.state = 'done'
        })

        socket.on('moment-leave', (time) => {
          if (momentId === time) {
            return
          }
          momentId = time
          // this.disconnect()
          var targetUserName = this.getUserName(targetUser.id)
          var toast = `<li class="toast">
            <div class="toast-inner">${targetUserName} 有可能去厕所了, 您可以选择等他一会儿</div>
          </li>`
          this.addMsg(toast)
        })

        socket.on('back', (time) => {
          if (backId === time) {
            return
          }
          backId = time
          var targetUserName = this.getUserName(targetUser.id)
          var toast = `<li class="toast">
            <div class="toast-inner">${targetUserName} 回来了</div>
          </li>`
          this.addMsg(toast)
        })

        socket.on('leave', () => {
          var targetUserName = this.getUserName(targetUser.id)
          var toast = `<li class="toast">
            <div class="toast-inner">${targetUserName} 离开了</div>
          </li>`
          this.addMsg(toast)
          this.disconnect()
        })


        socket.on('chat', (msg) => {
          if (messageId === msg.messageId) {
            return
          }
          messageId = msg.messageId
          var text = this.getHasEmojiText(msg.text)
          var message = `<li class="message-item">
            <div>
              <div class="user">
                <div class="user-avatar">
                  <img src="images/avatar.jpg" alt="">
                </div>
                <div class="message">${text}</div>
              </div>
            </div>
          </li>`
          this.addMsg(message)
        })

        $(document).on('keyup', '#input', e => {
          if (e.keyCode === 13) {
            this.sendText()
          }
        })

        $(document).on('click', '#send', this.sendText)
      })
    },
    disconnect() {
      targetUser = null
      this.state = 'waiting'
    },
    sendText() {
      if (!targetUser) {
        alert('还没有匹配到好友哦，请耐心等待')
        // this.$alert('还没有匹配到好友哦，请耐心等待', '提示', {
        //   confirmButtonText: '确定',
        //   callback: action => {
        //     this.$message({
        //       type: 'info',
        //       message: `action: ${action}`,
        //     })
        //   },
        // })
        return
      }
      var val = this.inputMsg
      if (!val) {
        return
      }
      socket.emit('chat', targetUser.socketId, {
        text: val,
        messageId: new Date().getTime(),
      })
      var text = this.getHasEmojiText(val)
      var message = `<li class="message-item is-me">
        <div>
          <div class="user">
            <div class="message">${text}</div>
            <div class="user-avatar">
              <img src="images/me.jpg" alt="">
            </div>
          </div>
        </div>
      </li>`
      this.addMsg(message)
      // $('#input').val('')
      this.inputMsg = ''
    },
    getUserName(userId) {
      return userId.slice(0, -13)
    },
    addMsg(node) {
      $messageBox.append(node).children(':last').hide().fadeIn()
      this.scroll2Bottom()
    },
    scroll2Bottom() {
      const messageBox = $('#messageBox')[0]
      messageBox.scrollTo(0, messageBox.scrollHeight)
    },
    getUserId() {
      var userId = localStorage.getItem('user')

      if (!userId || !userId.slice(0, -13)) {
        var userName = this.writeNickName()
        // var userName = prompt('输入昵称')
        var newUser = userName + '' + new Date().getTime()
        localStorage.setItem('user', newUser)
        return newUser
      }
      return userId
    },
    writeNickName() {
      var userName = prompt('输入昵称')
      if (userName) {
        return userName
      }
      return this.writeNickName()
    },
    getHasEmojiText(text) {
      return text.replace(/\[\S+?\]/g, '<img class="emoji-msg" src="./emojis/$&.png" />')
    }
  },
}
