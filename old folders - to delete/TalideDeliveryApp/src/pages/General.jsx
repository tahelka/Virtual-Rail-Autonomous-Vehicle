/* eslint-disable no-unused-vars */
import { useAuth } from "../context/AuthProvider";
import { useLogin } from "../hooks/useLogin";
import { useUser } from "../hooks/useUser";

function General() {
  // const { login, isLoading } = useLogin();
  // const { user } = useUser();
  const { auth } = useAuth();

  console.log(auth.user.username);

  return (
    <div>
      <h1>General</h1>
      <p>hello, {auth.user.username}</p>
    </div>
  );
}

export default General;
