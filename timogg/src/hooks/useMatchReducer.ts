import { useReducer } from 'react';

interface MatchDuoOptionsSeclected {
  queueType: string;
  myPosition: string;
  playStyle: string;
  gameStatus: string;
  mic: string;
  duoPosition: string;
  duoStyle: string;
}
const initialState = {
  queueType: '',
  myPosition: '',
  playStyle: '',
  gameStatus: '',
  mic: '',
  duoPosition: '',
  duoStyle: '',
};
type Action =
  | { type: 'queueType'; value: string }
  | { type: 'myPosition'; value: string }
  | { type: 'playStyle'; value: string }
  | { type: 'gameStatus'; value: string }
  | { type: 'mic'; value: string }
  | { type: 'duoPosition'; value: string }
  | { type: 'duoStyle'; value: string };
const reducer = (state: MatchDuoOptionsSeclected, action: Action) => {
  return { ...state, [action.type]: action.value };
};
export default function useMatchReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return [state, dispatch];
}
