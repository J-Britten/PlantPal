// middleware/checkIndexVisit.ts
//ensures that when the page is opened for the first time

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const hasVisitedIndex = sessionStorage.getItem('hasVisitedIndex');

    if (!hasVisitedIndex) {
      sessionStorage.setItem('hasVisitedIndex', 'true');

      if (to.path !== '/') {
        window.location.href= '/'; //Ideally we would use navigateTo here but it causes issues with the system so we're doing it this way
        //return navigateTo('/');
        return false;
      }
    }
  }
});