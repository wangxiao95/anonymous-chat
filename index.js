// Setup basic express server
const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3000
const _ = require('lodash')

server.listen(port, () => {
  console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

const allSockets = {}
const pendingUsers = []

io.on('connection', socket => {
  socket.on('init', userId => {
    let user = allSockets[userId]
    // console.log('init', _.omit(user, ['socket']))

    if (user) {
      user.socket = socket
      user.socketId = socket.id
    } else {
      user = {
        state: 'pending',
        id: userId,
        socketId: socket.id,
        socket,
        targetSocket: null,
        targetUser: null,
      }
    }
    allSockets[userId] = user
    match(user)

    // console.log(_.map(allSockets, item => _.omit(item, ['socket'])))
  })
})

function bindEvent(user) {
  const socket = user.socket
  const chatEventCallBack = (to, msg) => {
    user.targetSocket && socket.to(user.targetSocket).emit('chat', msg)
  }
  const momentLeaveEventCallBack = () => {
    user.targetSocket && socket.to(user.targetSocket).emit('moment-leave', new Date().getTime())
    // leave(user)
  }
  const leaveEventCallBack = () => {
    user.targetSocket && socket.to(user.targetSocket).emit('leave', new Date().getTime())
    leave(user)
  }
  const matchEventCallBack = () => {
    match(user)
  }
  // const deleteEventCallBack = (flag) => {
  //   console.log(111, flag)
  //   if (!flag) {
  //     return false
  //   }
  //   _.remove(pendingUsers, item => item.id === user.id)
  // }
  socket.off('chat', chatEventCallBack).on('chat', chatEventCallBack)
  socket.off('disconnect', momentLeaveEventCallBack).on('disconnect', momentLeaveEventCallBack)
  socket.off('leave', leaveEventCallBack).on('leave', leaveEventCallBack)
  socket.off('match', matchEventCallBack).on('match', matchEventCallBack)
  socket.on('del', flag => {
    if (!flag) return
    _.remove(pendingUsers, item => item.id === user.id)
  })
  console.log(socket.eventNames())
}

function leave(user) {
  const targetUser = allSockets[user.targetUser]
  user.targetSocket = null
  user.targetUser = null
  user.state = 'waiting'
  if (targetUser) {
    targetUser.targetSocket = null
    targetUser.targetUser = null
    targetUser.state = 'waiting'
  }
}

function match(user) {
  if (user.targetUser && user.targetSocket) {
    const targetUser = allSockets[user.targetUser]
    targetUser.targetUser = user.id
    targetUser.targetSocket = user.socket.id
    user.socket.emit('relation', _.omit(targetUser, ['socket']))
    targetUser.socket.emit('back', _.omit(user, ['socket']))
    bindEvent(user)
    bindEvent(targetUser)
    return
  }
  console.log(_.map(pendingUsers, item => _.pick(item, ['id'])))
  const matchUser = _.findLast(pendingUsers, item => item.id !== user.id && item.state === 'pending')
  console.log('matchUser', matchUser && matchUser.id)
  if (matchUser) {
    matchUser.targetUser = user.id
    matchUser.targetSocket = user.socket.id
    matchUser.state = 'done'
    user.targetUser = matchUser.id
    user.targetSocket = matchUser.socket.id
    user.state = 'done'
    bindEvent(user)
    bindEvent(matchUser)
    user.socket.emit('relation', _.omit(matchUser, ['socket']))
    matchUser.socket.emit('relation', _.omit(user, ['socket']))
    _.remove(pendingUsers, item => item.id === matchUser.id || item.id === user.id)
  } else {
    _.remove(pendingUsers, item => item.id === user.id)
    user.state = 'pending'
    pendingUsers.unshift(user)
    console.log(_.map(pendingUsers, item => _.omit(item, ['socket'])))
  }


  // user.state = 'pending'
  // const targetUser = user.targetUser
  // let matchUser = null
  // if (targetUser) {
  //   allSockets[targetUser].targetSocket = user.socket.id
  //   matchUser = allSockets[targetUser]
  //   user.state = 'done'
  // } else {
  //   // _.each(allSockets, item => {
  //   //   if (!item.targetUser && item.id !== user.id) {
  //   //     matchUser = item
  //   //     return false
  //   //   }
  //   // })
  //   matchUser = pendingUsers.shift()
  //   if (matchUser && matchUser.id !== user.id) {
  //     matchUser.targetUser = user.id
  //     matchUser.targetSocket = user.socket.id
  //     matchUser.state = 'done'
  //     user.targetUser = matchUser.id
  //     user.targetSocket = matchUser.socket.id
  //     user.state = 'done'
  //   } else {
  //     matchUser = null
  //     _.remove(pendingUsers, item => item.id === user.id)
  //     pendingUsers.push(user)
  //   }
  // }
  // if (matchUser) {
  //   bindEvent(user)
  //   user.socket.emit('relation', _.omit(matchUser, ['socket']))
  //   matchUser.socket.emit('relation', _.omit(user, ['socket']))
  // }
}
