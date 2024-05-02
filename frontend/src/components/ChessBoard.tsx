import { Chess, Color, PieceSymbol, Square } from "chess.js";
import React, { useState } from "react";
import LegalMoveIndicator from "./chessBoard/LegalMoveIndicator";
import ChessSquare from "./chessBoard/ChessSqaure";
import { messages } from "../utils/messages";
import { IMove } from "../pages/Game";
import NumberNotation from "./chessBoard/NumberNotation";
import LetterNotation from "./chessBoard/LetterNotation";

type board = {
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null

const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];


export default function ChessBoard({ board, chess, setBoard, myColor, setMoves, socket }: {
  board: board[][];
  chess: Chess;
  setBoard: React.Dispatch<
    React.SetStateAction<
      ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    >
  >;
  setMoves: React.Dispatch<
    React.SetStateAction<
      IMove[]
    >
  >;
  moves: IMove[]
  myColor: string
  started: boolean
  socket: WebSocket
}) {

  const [moveFrom, setMoveFrom] = useState<Square | null>(null);

  const [legalMoves, setLegalMoves] = useState<Square[]>([])


  const isFlipped = myColor === 'b'
  const isMyTurn = myColor === chess.turn();





  return (
    <div className="">
      {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
        i = isFlipped ? i + 1 : 8 - i;
        return (
          <div key={i} className="flex relative">
            <NumberNotation
              isMainBoxColor={i % 2 === 0}
              label={i.toString()}
            />
            {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
              j = isFlipped ? 7 - (j % 8) : j % 8;


              const isMainBoxColor = (i + j) % 2 === 0

              const squareRepresentation = (String.fromCharCode(97 + j) + '' + i) as Square;

              return (
                <div
                  key={j}
                  className={`w-16 h-16 ${(i + j) % 2 === 0 ? 'bg-green-500' : 'bg-green-100'}`}
                  onClick={() => {

                    if (!isMyTurn) return;


                    if (moveFrom === squareRepresentation) {
                      setMoveFrom(null);
                    }



                    if (!moveFrom) {
                      //-> null
                      setMoveFrom(squareRepresentation)
                      const availableMoves = chess
                        .moves({ verbose: true, square: square?.square })
                        .map((move) => move.to)

                      setLegalMoves(availableMoves);

                    } else {

                      if (legalMoves.includes(squareRepresentation)) {
                        socket.send(JSON.stringify({
                          type: messages.MOVE,
                          payload: {
                            move: {
                              from: moveFrom,
                              to: squareRepresentation
                            }
                          }
                        }))

                        setMoveFrom(null);
                        setLegalMoves([]);
                        setBoard(chess.board());
                        console.log({
                          moveFrom,
                          to: squareRepresentation,
                        });

                        const piece = chess.get(squareRepresentation)?.type
                        setMoves((moves) => [
                          ...moves,
                          { from: moveFrom, to: squareRepresentation, piece },
                        ]);

                      } else {
                        setMoveFrom(squareRepresentation)
                        const availableMoves = chess
                          .moves({ verbose: true, square: square?.square })
                          .map((move) => move.to)

                        setLegalMoves(availableMoves);
                      }


                    }

                  }}
                >
                  <div className="w-full h-full flex justify-center items-center relative">
                    {isFlipped
                      ? i === 8 && (
                        <LetterNotation
                          label={labels[j]}
                          isMainBoxColor={j % 2 !== 0}
                        />
                      )
                      : i === 1 && (
                        <LetterNotation
                          label={labels[j]}
                          isMainBoxColor={j % 2 !== 0}
                        />
                      )}
                    {square && <ChessSquare square={square} />}
                    {!!moveFrom &&
                      legalMoves.includes(squareRepresentation) && (
                        <LegalMoveIndicator
                          isMainBoxColor={isMainBoxColor}
                          isPiece={!!square?.type}
                        />
                      )}

                  </div>
                </div>
              )
            })
            }
          </div>)

      })}
    </div >
  )
}
