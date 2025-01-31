// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

//the general theme and colors, any general styling rules should go here
const fbotTheme = {
  dark: false,
  colors: {
    primary: '#88b56e',
    secondary: '#9C27b0',
    surface: 'ece7e7',
    background: '#ffffff'
  }
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    // ... your configuration
    theme: {
      defaultTheme: 'fbotTheme',
      themes: {
        fbotTheme,
      }
    }
  })
  app.vueApp.use(vuetify)
})