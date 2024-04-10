/* eslint-disable no-unused-vars */
import { useLogin } from "../hooks/useLogin";
import { useUser } from "../hooks/useUser";

function General() {
  const { login, isLoading } = useLogin();
  const { user } = useUser();

  console.log(user);

  return (
    <div>
      <h1>General</h1>
      <p>hello, {user?.username}</p>
      <button onClick={() => login({ username: "admin", password: "admin" })}>
        Login
      </button>
    </div>
  );
}

export default General;
