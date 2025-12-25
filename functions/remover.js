export function removeAt(username) {
  return username.startsWith("@") ? username.slice(1) : username;
}