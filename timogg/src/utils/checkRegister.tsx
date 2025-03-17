import { myInfo } from '../apis/member';
import useAuthStore from '../storage/useAuthStore';

export async function checkRegister() {
  const { userData, setUserData } = useAuthStore.getState();
  if (!userData.playerName || !userData.playerTag) {
    const newData = await myInfo();

    if (!newData.playerName || !newData.playerTag) {
      return false;
    } else {
      setUserData(newData);
      return true;
    }
  }
  return true;
}
