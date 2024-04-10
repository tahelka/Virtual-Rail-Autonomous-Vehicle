import { useQueryClient, useMutation } from "@tanstack/react-query";
import { login as loginApi } from "../services/apiAuth";

export function useLogin() {
  const queryClient = useQueryClient();

  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ username, password }) => loginApi({ username, password }),
    onSuccess: (user) => {
      queryClient.setQueriesData(["user"], user.username);
      console.log("user", user);
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  return { login, isLoading };
}
