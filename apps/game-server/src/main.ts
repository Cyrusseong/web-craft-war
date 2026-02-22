import { Server } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { createServer } from 'http'
import { GameRoom } from './rooms/GameRoom'

const port = Number(process.env.PORT) || 2567

const server = new Server({
  transport: new WebSocketTransport({
    server: createServer(),
  }),
})

server.define('game_room', GameRoom)

server.listen(port).then(() => {
  console.log(`[GameServer] Listening on ws://localhost:${port}`)
})
