<script setup lang="ts">
import type { UserSettings } from '@prisma/client';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AboutComponent from '~/components/AboutComponent.vue';
import { useFarmbotStore } from '~/stores/farmbotStore';
const { data } = useAuth();

const FarmBotStore = useFarmbotStore()

let step = ref(1)
let currentTitle = computed(() => {
  switch (step.value) {
    case 1: return 'Welcome To Our Study!'
    case 2: return 'Settings'
    case 3: return 'About & Consent'
  }
})

const router = useRouter();

let interactionLevel = ref(FarmBotStore.userSettings.interactionLevel || 0)

async function endAbout() {
  //TODO: First, we need to save the settings using an API call
  //Then we can navigate to the next page

  let settings = await $fetch('api/prisma/user/' + data.value?.user?.name + '/settings', {
    method: 'PUT',
    body: {
      interactionLevel: interactionLevel.value,
      accountActivated: true,
    }
  })
  //console.log('reference', 'api/prisma/user/'+data.value?.user?.name+'/settings');
  FarmBotStore.userSettings = settings
  console.log('Settings saved', settings);
  router.push('/');
}



onMounted(() => {
  console.log("About");
});

definePageMeta({
  layoutTransition: true,
  layout: "layoutv2",
  //middleware: "check-index-visit"
})


</script>


<template>
  <v-app-bar color="primary" prominent rounded="xl" density="comfortable"
    style="width: calc(100% - 16px); left: 8px; top: 8px;">

    <v-toolbar-title class="text-center">Getting Started</v-toolbar-title>
  </v-app-bar>
  <v-container class="pt-16 pb-14 overflow-y-auto" style="height: 100vh; margin: 0; max-height: 100vh;">
    <v-row>
      <v-col cols="12">
        <v-card color="background" variant="flat" class="py-2">
          <v-card-title class="text-h6 font-weight-regular justify-space-between">
            <v-avatar class="mb-1" color="primary" size="24" v-text="step"></v-avatar>
            <span class="pl-2">{{ currentTitle }}</span>
          </v-card-title>

          <v-window v-model="step">
            <v-window-item :value="1">
              <v-card-text>
                <span class="text-grey-darken-1">
                  Welcome to the PlantPaling App. With this app you will remotely plant and take care of plants on
                  your very own gardening space. The gardening tasks themselves will be carried out by a farming robot
                  that can sow, water, and weed for you. Your task will be to plant a minimum of 6 crops on your
                  assigned field. You can plant more than one of each crop if you wish but your participation will be
                  voided if you do not plant the initial 6 crops described earlier.

                </span>
              </v-card-text>
            </v-window-item>
            <v-window-item :value="2">
             <div class="pa-4">
                <span class="text-grey-darken-1">
                  Before we start, we need you to set some preferences for your experience. You can change these at any
                  point in the settings.
                </span>
                <h3 class="text-h6 font-weight-light mb-2">
                  Level of Involvement
                </h3>
                <span class="text-grey-darken-1">
                  How much control do you want over your garden?
                </span>
              </div>
              <v-radio-group v-model="interactionLevel" label="FarmBot Interaction Level">
                <v-radio label="Fully Automated" :value=0></v-radio>
                <v-radio label="Semi-Automated" :value=1></v-radio>
                <v-radio label="Manual Control" :value=2></v-radio>
              </v-radio-group>
              <v-card v-if="interactionLevel == 0" class="pa-4">
                You decide what to plant, but the farming robot takes care of all the sowing, watering, weeding and any
                other planting tasks.
              </v-card>
              <v-card v-if="interactionLevel == 1" class=" pa-4">
                You decide what to plant, where to plant it, when to water it, and when weeds should be removed. The
                farming robot will review your actions and may stop you from making decisions that could negatively
                impact your field.
              </v-card>
              <v-card v-if="interactionLevel == 2" class=" pa-4">
                You decide what to plant, where to plant it, when to water it, and when weeds should be removed. The
                farming robot will review your actions and may warn you if your decisions could negatively impact your
                field but it will not be able to stop you.
              </v-card>
            
            </v-window-item>


            <v-window-item :value="3">
              <v-card-text>
                <span class="text-grey-darken-1">
                  Please note: Your participation is entirely voluntary. You can withdraw at any time without any
                  consequences. Your compensation will be calculated based on full weeks participated starting today.
                  The rate of compensation is going to be 10€ per 7 days participated (i.e. participating for 13 days =
                  10€, participating for 14 days = 20€). The maximum compensation is 30€ if you take part in this study
                  for 3 weeks. Compensation will be done via PayPal or Amazon Gift Cards. At the end of your
                  participation, you will receive a link to a post study survey and be invited to a short final
                  interview. After the interview the compensation will be sent to you.
                  Over the course of this study, we will be collecting data on your gardening habits, preferences, and
                  how you use the app. The data will be fully anonymized and used for research purposes only. We will
                  never share your data with third parties. The application includes a chat feature, where you are able
                  to chat to other users of the app who are currently taking part in the study as well. We will not log
                  or analyze the messages sent between participants in this study. We will not tolerate any form of
                  abuse, harassment, or inappropriate behavior in the chat. If you experience any issues, please report
                  them to the study administrators. We reserve the right to remove any user from the study who does not
                  adhere to the code of conduct. By continuing, you agree to these terms.
                  If you run into technical issues at any point during the study, please use the report feature to
                  contact the study administrators. We will do our best to resolve any issues you may have.
                  Alternatively you can contact albin.zeqiri@uni-ulm.de for further troubleshooting or administrative
                  questions (compensation, ending your participation early, and other questions).
                </span>
                <v-btn rounded="xl" variant="flat" :ripple="false" @click="endAbout()" color="primary" class="mt-2"
                  block>I understand & agree 
                </v-btn>
              </v-card-text>
            </v-window-item>
          </v-window>
          <!--<v-bottom-navigation color="primary" horizontal grow rounded="xl" density="comfortable" class="pa-1"
            style="width: calc(100% - 16px); left: 8px; bottom: 12px; position: fixed; z-index: 1000;">


            <v-btn v-if="step > 1" rounded="xl" style="width:100%" variant="flat" :ripple="false" @click="step--">
              Back
            </v-btn>

            <v-btn v-if="step < 3" rounded="xl" variant="flat" style="width:100%" :ripple="false" @click="step++">
              Next
            </v-btn>

          </v-bottom-navigation>-->
          <v-card-text>
            <v-btn v-if="step > 1" rounded="xl" style="float:left" variant="flat" :ripple="false" @click="step--">
              Back
            </v-btn>

            <v-btn v-if="step < 3" rounded="xl" variant="flat" style="float:right" :ripple="false" @click="step++">
              Next
            </v-btn>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>


<style></style>