import { Player, User } from "./GameManger";
import { randomUUID } from "crypto";

class SocketManger {
  private roomId: string;
  private userToRoomMap: Map<string, string>;

  private players: Map<string, Player[]>;
  private spectators: Map<string, User[]>;

  constructor() {
    this.roomId = randomUUID();

    this.userToRoomMap = new Map<string, string>();

    this.players = new Map<string, Player[]>();
    this.spectators = new Map<string, User[]>();
  }

  addPlayers(roomId: string, player: Player) {
    this.players.set(roomId, [...(this.players.get(roomId) || []), player]);

    this.userToRoomMap.set(player.user._id, roomId);
  }
}
