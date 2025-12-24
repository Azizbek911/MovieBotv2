export function removeAt(username: string): string {
  return username.startsWith("@") ? username.slice(1) : username;
}