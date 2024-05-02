import { WebSocketServer } from "ws";
import { GameManger } from "./game/GameManger";

const wss = new WebSocketServer({ port: 9090 });

const gameManger = new GameManger();

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  

  gameManger.addUser(ws);
  ws.on("disconnect", () => gameManger.removeUser(ws));
});
console.log("ready");
