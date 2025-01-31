<!--
  ChatComponent.vue

  This component is responsible for displaying the chat messages and sending new messages. It also contains the navigation drawer for selecting chats.

-->

<script setup lang="ts">

import { ChatChannel } from '~/server/chat/chatChannel';
import { useConnectionStore } from '~/stores/clientSocketStore';
const ConnectionStore = useConnectionStore();

const { data } = useAuth()

let tempChannel: ChatChannel = {
  name: "No chat selected",
  messages: [],
  synched: false
};

let activeChat = ref(tempChannel);

let showChats = ref(true);


function selectChat(chat: ChatChannel) {
  activeChat.value = chat;
  if (!activeChat.value.synched) ConnectionStore.getChatMessages(chat.name);

  showChats.value = false; //disable the overlay 

  ConnectionStore.newChatMessages = 0;
  console.log(activeChat.value.messages)
}

let currentMsg = ref("");

const messagesContainer = ref();
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.$el.scrollTop = messagesContainer.value.$el.scrollHeight;
    }
  });
};


// Watch for changes in activeChat.messages and scroll to bottom
watch(() => activeChat.value.messages, (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages.length) {
    scrollToBottom();
  }
}, { deep: true });

</script>

<template>
  <!-- Chat navigation-->

  <v-navigation-drawer v-model="showChats" temporary>
    <v-list v-model="activeChat" lines="one">
      <v-list-item>Select a chat below:</v-list-item>
      <v-list-item v-for="(chat, index) in ConnectionStore.chats" :key="index" :title="chat.name" :value="chat"
        @click="selectChat(chat)"></v-list-item>
      <v-card class="mt-2 py-2 text-center">
        <v-card-text>
          <v-icon>mdi-information-outline</v-icon>
          Chat messages won't be analyzed as part of the study. Please be respectful towards your fellow gardeners and
          be careful when sharing personal information.
        </v-card-text>
      </v-card>
    </v-list>
  </v-navigation-drawer>
    <v-card flat class="d-flex flex-column fill-height" color="background">
      <div>
        <v-chip rounded="xl" variant="tonal" class="py-7 w-100" prepend-icon="mdi-chevron-left" @click="showChats = !showChats">
          <v-card-title style="font-weight: 400" >
            {{ activeChat.name || "Select a Chat"}}
          </v-card-title>

        </v-chip>
      </div>

      <v-card-text ref="messagesContainer" class="flex-grow-1 overflow-auto fill-height">
        <template v-for="(msg, i) in activeChat.messages">
          <div :class="{ 'd-flex flex-row-reverse': msg.to != data?.user?.name }">
            <div offset-y>
                <v-chip :color="msg.to != data?.user?.name ? 'primary' : ''" dark
                  style="height:auto;white-space: normal; border-radius:25px" class="pa-4 mb-2" >
                  {{ msg.message }}
                  <sub class="ml-2" style="font-size: 0.5rem;">{{ new Date(msg.time).toLocaleString('de-de', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</sub>
                </v-chip>

            </div>
          </div>
         
        </template>
      </v-card-text>
      <v-card-text class="flex-shrink-1 pa-0 pt-2">
        <v-text-field v-model="currentMsg" label="Message" type="text" no-details outlined
          append-icon="mdi-send-outline"
          @click:append="ConnectionStore.sendChatMessage(activeChat.name, currentMsg); currentMsg = '';" hide-details />
      </v-card-text>
    </v-card>
</template>
