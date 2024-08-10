export async function login({ username, password }) {
  if (username === "admin" && password === "admin")
    return { username: "admin" };

  throw new Error("Invalid username or password");
}

export async function getCurrentUser() {
  return { username: "admin", authenticated: true };
}
