// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
  devtools: { enabled: false },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@pinia/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@sidebase/nuxt-auth',
    'nuxt-scheduler',
    ['nuxt-mail', {
      message: {
        to: ['e-mail'],
      },
      smtp: {
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        }
      },
    }],
    //...
  ],

  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      isEnabled: true
    }
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    farmbotApi: process.env.FARMBOT_API_KEY,
    authSecret: process.env.AUTH_TOKEN,
    photoGridPath: path.join(process.cwd(), process.env.PHOTO_GRID_PATH),
    /*socket: {
      // JSON serializable options only.
      // options object to pass when instantiating socket server.
      serverOptions: {}
    }*/
   public: {
   
   }
  },

  compatibilityDate: '2024-07-08'
})