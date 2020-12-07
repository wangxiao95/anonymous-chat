var $vm = new Vue({
  el: '#app',
  mixins: [socketMixin],
  template: `<div>
      <div class="header">
        <span class="match" @click="match"><span v-show="showMatch && !loading">重新匹配</span></span>
        <span id="targetName">{{this.targetName}}</span>
        <span class="leave" @click="leave"><span v-show="!showMatch && !loading">离开</span></span>
      </div>
      <div class="body" v-loading="loading">
        <div v-if="this.state === 'waiting'" class="edit-name">
            <el-button type="primary" plain @click="editNickName">修改昵称</el-button>
        </div>
        <ul id="messageBox">
<!--          <li class="message-item">-->
<!--            <div>-->
<!--              <div class="user">-->
<!--                <div class="user-avatar">-->
<!--                  <img src="./avatar.jpg" alt="">-->
<!--                </div>-->
<!--                <div class="user-name">王晓</div>-->
<!--              </div>-->
<!--              <div class="message">测试消息</div>-->
<!--            </div>-->
<!--          </li>-->
<!--          <li class="message-item is-me">-->
<!--            <div>-->
<!--              <div class="user">-->
<!--                <div class="user-name">王晓</div>-->

<!--                <div class="user-avatar">-->
<!--                  <img src="./me.jpg" alt="">-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="message">测试消息</div>-->
<!--            </div>-->
<!--          </li>-->
        </ul>
      </div>
      <div class="footer">
        <input type="text" id="input" :disabled="this.state !== 'done'" placeholder="enter发送">
        <div id="send">发送</div>
      </div>
    </div>
    `,
  data() {
    return {
      state: 'pending',
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
    }
  },
  mounted() {
    this.init()
  },
  methods: {
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
      var newUser = userName + '' + new Date().getTime()
      localStorage.setItem('user', newUser)
      socket.emit('delete')
      location.reload()
    },
  }
})
