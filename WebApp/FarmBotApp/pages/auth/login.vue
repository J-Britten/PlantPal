<script setup>



//import { useAuth } from '#auth' // Replace '@/path/to/auth-module' with the actual path to the auth module

const { signIn } = useAuth()
//const showToast = inject('showToast')

const router = useRouter();

const FarmBotStore = await useFarmbotStore();

definePageMeta({
  layoutTransition: true,
  layout: "layoutv2",
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
  title: "FarmBot Login"
})

const username = ref('')
const password = ref('')
const displayToast = inject('displayToast')
const form = ref(false)
const rules = ref({
  required: value => !!value || 'Field is required',
})

const login = async (username, password) => {
  const response = await signIn('credentials', { redirect: false, username, password })

  if (response.error) {
    displayToast(response.error, 'error')
    return
  }
  let userSettings = await $fetch('/api/prisma/user/'+username+'/settings')

  if(!userSettings.accountActivated) {

    console.log('No settings found for user: '+username)
    await navigateTo('/about')
  } else {
    FarmBotStore.userSettings = userSettings

  await navigateTo(/*useRelativeCallbackUrl(*/useRoute().value/*).value*/)
  }
}
</script>

<template>
    <v-app-bar color="primary" prominent rounded="xl" density="comfortable"
    style="width: calc(100% - 16px); left: 8px; top: 8px;">

    <v-toolbar-title class="text-center mr-4" >PlantPal</v-toolbar-title>
  </v-app-bar>

  <div class="d-flex align-center justify-center" style="height: 100vh">
    <v-hover v-slot="{ props }">
      <v-card title="Sign in"  v-bind="props" width="400"
        class="mx-auto pa-10">
        <v-form v-model="form" @submit.prevent="login(username, password)">
          <v-text-field v-model="username" label="Username" :rules="[rules.required]"></v-text-field>

          <v-text-field type="password" v-model="password" label="Password" :rules="[rules.required]"></v-text-field>

          <v-btn :disabled="!form" type="submit" rounded="xl" color="primary" block class="mt-2">Sign In</v-btn>
        </v-form>
      <!--  <v-btn :disabled="true" color="primary" block class="mt-2" to="/auth/register" nuxt>Create new account</v-btn>-->
      </v-card>
    </v-hover>
  </div>
  <v-bottom-navigation color="primary" horizontal grow rounded="xl" density="comfortable" class="pa-1"
            style="width: calc(100% - 16px); left: 8px; bottom: 12px; position: fixed; z-index: 1000;">

          </v-bottom-navigation>
</template>