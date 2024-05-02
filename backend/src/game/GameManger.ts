import { WebSocket } from "ws";
import { Game } from "./Game";
import { messages } from "./messages";

export type User = { _id: string; name: string; color: string };
export type Player = {
  socket: WebSocket;
  user: User;
};

export class GameManger {
  private games: Game[];
  private pendingUser: Player | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    console.log("new user connected!");
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (event) => {
      const data = JSON.parse(event.toString());

      if (data.type === messages.INIT_GAME) {
        if (this.pendingUser) {
          // already a waiting player
          const new_game = new Game(this.pendingUser, {
            socket,
            user: { ...data.user, color: "b" },
          });

          this.games.push(new_game);
          this.pendingUser = null;
        } else {
          // wait for the second user
          this.pendingUser = {
            socket,
            user: {
              name: data.user.name,
              _id: data.user._id,
              color: "w",
            },
          };

          socket.send(
            JSON.stringify({
              type: "waiting",
            })
          );
        }
      }

      // find the game
      const game = this.games.find(
        (game) => game.player1.socket == socket || game.player2.socket == socket
      );
      if (!game) return;

      if (data.type === messages.MOVE) {
        // make the move
        // broadcast the move
        game.makeMove(socket, data.payload.move);
      }

      if (data.type === messages.PRINT_BOARD) {
        game.printBoard();
      }
    });
  }
}
