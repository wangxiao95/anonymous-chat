function init(vm) {
  var $vm = vm
  var socket = io()
  var userId = getUserId()

  var msgs = []
  var targetUser = null
  var $messageBox = $('#messageBox')
  var messageId = null

  socket.on('connect', () => {

    socket.emit('init', userId)

    socket.on('relation', user => {
      console.log('relation', user)
      targetUser = user
      var targetUserName = getUserName(targetUser.id)
      var toast = `<li class="toast">
        <div class="toast-inner">恭喜您匹配到：${targetUserName}</div>
      </li>`
      addMsg(toast)
      $vm.targetName = targetUserName
      $vm.state = 'chat'
    })

    socket.on('disconnect', () => {
      targetUser = null
    })


    socket.on('chat', (msg) => {
      if (messageId === msg.messageId) {
        return
      }
      messageId = msg.messageId
      msgs.push(msg)
      var message = `<li class="message-item">
        <div>
          <div class="user">
            <div class="user-avatar">
              <img src="images/avatar.jpg" alt="">
            </div>
            <div class="user-name">${getUserName(targetUser.id)}</div>
          </div>
          <div class="message">${msg.text}</div>
        </div>
      </li>`
      addMsg(message)
    })

    $(document).on('keyup', '#input', e => {
      if (e.keyCode === 13) {
        sendText()
      }
    })

    $(document).on('click', '#send', sendText)
  })

  function sendText() {
    if (!targetUser) {
      $vm.$alert('还没有匹配到好友哦，请耐心等待', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          this.$message({
            type: 'info',
            message: `action: ${action}`,
          })
        },
      })
      return
    }
    var val = $('#input').val()
    if (!val) {
      return
    }
    socket.emit('chat', targetUser.socketId, {
      text: val,
      messageId: new Date().getTime(),
    })
    var message = `<li class="message-item is-me">
        <div>
          <div class="user">
            <div class="user-name">${getUserName(userId)}</div>

            <div class="user-avatar">
              <img src="images/me.jpg" alt="">
            </div>
          </div>
          <div class="message">${val}</div>
        </div>
      </li>`
    addMsg(message)
    $('#input').val('')
  }

  function getUserName(userId) {
    return userId.slice(0, -13)
  }

  function addMsg(node) {
    $messageBox.append(node).children(':last').hide().fadeIn()
    scroll2Bottom()
  }

  function scroll2Bottom() {
    const messageBox = $('#messageBox')[0]
    messageBox.scrollTo(0, messageBox.scrollHeight)
  }

  function getUserId() {
    var userId = localStorage.getItem('user')
    if (!userId) {
      var userName = prompt('输入昵称')
      var newUser = userName + '' + new Date().getTime()
      localStorage.setItem('user', newUser)
      return newUser
    }
    return userId
  }
}
