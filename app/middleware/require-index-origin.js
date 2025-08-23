export default defineNuxtRouteMiddleware((to) => {
  // Client-only guard: allow /play only after explicit intent from index
  if (to.path !== '/play') return
  if (process.server) return
  try {
    const allowed = sessionStorage.getItem('allowPlay') === '1'
    if (allowed) {
      sessionStorage.removeItem('allowPlay')
      return
    }
  } catch (_) {}
  return navigateTo('/')
})


