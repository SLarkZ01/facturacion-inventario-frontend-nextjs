// Client-side auth helpers (demo)
export function logout() {
  try {
    // remove the demo auth cookie
    document.cookie = `auth=; Path=/; max-age=0`
  } catch (e) {
    // ignore
  }
  // redirect to root (login)
  if (typeof window !== "undefined") {
    window.location.href = "/"
  }
}

export default logout
