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
const sessions = []

io.on('connection', socket => {
  socket.on('init', userId => {
    let user = allSockets[userId]
    console.log('init', _.omit(user, ['socket']))

    if (user) {
      user.socket = socket
      user.socketId = socket.id
    } else {
      user = {
        id: userId,
        socketId: socket.id,
        socket,
        targetSocket: null,
        targetUser: null,
      }
      allSockets[userId] = user
    }

    bindEvent(user)
    match(user)

    console.log(_.map(allSockets, item => _.omit(item, ['socket'])))
  })
})

function bindEvent(user) {
  const socket = user.socket
  socket.on('chat', (to, msg) => {
    user.targetSocket && socket.to(user.targetSocket).emit('chat', msg)
  })
  socket.on('disconnect', () => {
    user.targetSocket && socket.to(user.targetSocket).emit('moment-leave')
    // leave(user)
  })
  socket.on('leave', () => {
    user.targetSocket && socket.to(user.targetSocket).emit('leave')
    leave(user)
  })
  socket.on('match', () => {
    match(user)
  })
}

function leave(user) {
  const targetUser = allSockets[user.targetUser]
  user.targetSocket = null
  user.targetUser = null
  if (targetUser) {
    targetUser.targetSocket = null
    targetUser.targetUser = null
  }
}

function match(user) {
  const targetUser = user.targetUser
  let matchUser = null
  if (targetUser) {
    allSockets[targetUser].targetSocket = user.socket.id
    matchUser = allSockets[targetUser]
  } else {
    _.each(allSockets, item => {
      if (!item.targetUser && item.id !== user.id) {
        matchUser = item
        return
      }
    })
    if (matchUser) {
      matchUser.targetUser = user.id
      matchUser.targetSocket = user.socket.id
      user.targetUser = matchUser.id
      user.targetSocket = matchUser.socket.id
    }
  }
  if (matchUser) {
    user.socket.emit('relation', _.omit(matchUser, ['socket']))
    matchUser.socket.emit('relation', _.omit(user, ['socket']))
  }
}
