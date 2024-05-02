import { Chess, DEFAULT_POSITION } from "chess.js";
import { WebSocket } from "ws";
import { messages } from "./messages";
import { Player } from "./GameManger";

export class Game {
  public player1: Player;
  public player2: Player;
  public board: Chess;

  private startingTime: Date;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startingTime = new Date();

    this.player1.socket.send(
      JSON.stringify({
        type: messages.INIT_GAME,
        payload: {
          me: player1.user,
          against: player2.user,
          color: "white",
        },
      })
    );

    this.player2.socket.send(
      JSON.stringify({
        type: messages.INIT_GAME,
        payload: {
          me: player2.user,
          against: player1.user,
          color: "black",
        },
      })
    );
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    // validation
    // > which user move (w/b)?
    if (this.board.turn() === "w" && socket !== this.player1.socket) {
      return;
    }

    if (this.board.turn() === "b" && socket !== this.player2.socket) {
      return;
    }

    // > is a legal move

    // update the move
    try {
      this.board.move(move);
    } catch (e: any) {
      console.log("board move err", e.message);
      return;
    }

    // check if the game is over

    if (this.board.isGameOver()) {
      this.player1.socket.send(
        JSON.stringify({
          type: messages.GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      this.player2.socket.send(
        JSON.stringify({
          type: messages.GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      return;
    }

    this.player2.socket.send(
      JSON.stringify({
        type: messages.MOVE,
        payload: { move },
      })
    );
    this.player1.socket.send(
      JSON.stringify({
        type: messages.MOVE,
        payload: { move },
      })
    );
    // send result to user
  }

  printBoard() {
    console.log(this.board.ascii());
  }
}
