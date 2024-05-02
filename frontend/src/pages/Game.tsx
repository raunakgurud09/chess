import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js"
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { messages } from "../utils/messages";
import ProfileDetails from "../components/chessBoard/ProfileDetails";

export type User = {
  _id: string
  color: string
  name: string
}

type GameMetaData = {
  against: User
  me: User
  color: 'w' | 'b'
}

export interface IMove {
  from: Square; to: Square; piece: string
}

export default function Game() {


  const [name, setName] = useState('')

  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board())
  const [started, setStarted] = useState(false)

  const [moves, setMoves] = useState<IMove[]>([])

  const [waitingLoader, setWaitingLoader] = useState<boolean>(false)

  const [metaData, setMetaData] = useState<GameMetaData | null>(null)

  const socket = useSocket()


  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = ((event) => {

      const data = JSON.parse(event.data.toString())

      switch (data.type) {
        case messages.INIT_GAME:
          setBoard(chess.board())
          setWaitingLoader(false)
          setStarted(true)

          // set meta data
          setMetaData(data.payload)

          console.log(data.payload)
          break;

        case messages.WAITING:
          console.log('waiting for other user')
          setWaitingLoader(true)
          break;

        case messages.MOVE:
          // eslint-disable-next-line no-case-declarations
          const { move } = data.payload;
          // eslint-disable-next-line no-case-declarations
          const moves = chess.moves({ verbose: true });

          if (
            moves.map((x) => JSON.stringify(x)).includes(JSON.stringify(move))
          ) {
            return;
          }

          chess.move({ from: move.from, to: move.to });
          setBoard(chess.board());

          // eslint-disable-next-line no-case-declarations
          const piece = chess.get(move.to)?.type
          setMoves(moves => [...moves, { from: move.from, to: move.to, piece }])

          break;

        case messages.GAME_OVER:
          console.log('game over')
          break;

        default:
          break;
      }

    })

  }, [chess, socket])

  if (!socket) return (<div>connecting...</div>);

  const handleClick = () => {
    if (name === '') { alert('enter name'); return; }

    socket.send(JSON.stringify({
      type: messages.INIT_GAME,
      user: {
        name
      }
    }))

    setName('')
  }

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className='grid grid-cols-10 gap-4 w-screen h-screen p-8'>
      <div className='col-span-6'>
        <div className="w-full h-full flex items-center justify-center p-4 flex-col">

          {metaData && <ProfileDetails name={metaData?.against?.name} />}

          <ChessBoard
            board={board}
            setBoard={setBoard}
            chess={chess}
            moves={moves}
            setMoves={setMoves}
            socket={socket}
            myColor={metaData ? metaData.me.color : 'w'}
            started={started}

          />
          {metaData && <ProfileDetails name={metaData?.me?.name} />}
        </div>
      </div>
      <div className='col-span-2 py-16 '>
        {/* play options */}


        <div className="flex flex-col gap-4 items-center" >
          <input
            type="text"
            placeholder="Enter name"
            className="w-full px-4 py-2 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleClick()
              }
            }}
          />
          <button onClick={handleClick} disabled={!!waitingLoader} className="w-full px-4 py-2 bg-green-500 font-semibold text-md">
            {
              waitingLoader ?
                <div className="flex items-center gap-2 justify-center">
                  <div className="loader" />
                  <div> waiting for player...</div>
                </div>
                : <span>PLAY</span>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
