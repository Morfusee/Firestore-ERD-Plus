import { useUserStore } from "../../store/useUserStore";
import { getUserApi, updateUserApi } from "../api/userApi";



const useUserRepo = () => {
  const user = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);


  const loginUser = async (userId: string) => {
    try {
      // Get user from api base on id
      const res = await getUserApi(userId)

      // Set the current user to the user response from api
      setCurrentUser(res.data.user)

    } catch (err) {
      console.log("Error logging in the user", err)
    }
  }

  const changeUserDisplayname = async (userId: string, displayName: string) => {
    try {
      const res = await updateUserApi(userId, displayName)

      setCurrentUser(res.data.updatedUser)
    } catch (err) {
      console.log("Error updating the user", err)
    }
  }

  const logoutUser = () => {

  }

  return {
    user,
    loginUser,
    logoutUser,
    changeUserDisplayname,
  }
}


export default useUserRepo