import { GameRecordUpdate, GetGamePayload } from '../../common/games/games'
import { GameClientPlayerResult } from '../../common/games/results'

export type GamesActions = DeliverLocalResults | GetGameRecord | GameUpdate

export interface DeliverLocalResults {
  type: '@games/deliverLocalResults'
  payload: {
    gameId: string
    result: Record<string, GameClientPlayerResult>
    time: number
  }
  error?: false
}

export interface GetGameRecord {
  type: '@games/getGameRecord'
  payload: GetGamePayload
}

export interface GameUpdate {
  type: '@games/gameUpdate'
  payload: GameRecordUpdate
}
