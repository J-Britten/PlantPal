<template>
    <v-dialog v-model="isVisible" max-width="600">
      <v-card>
        <v-card-title class="headline">FarmBot Message</v-card-title>
        <v-card-text v-html="message" class="message-text"></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1"  @click="confirm">{{ confirmButtonText }}</v-btn>
          <v-btn v-if="showCancelButton" color="red darken-1"  @click="cancel">{{ cancelButtonText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits, ref } from 'vue';
  
  const props = defineProps({
    message: {
      type: String,
      required: true,
    },
    confirmButtonText: {
      type: String,
      default: 'Ok',
    },
    cancelButtonText: {
      type: String,
      default: 'Cancel',
    },
    showCancelButton: {
      type: Boolean,
      default: true,
    },
  });
  
  const emit = defineEmits(['Ok', 'cancel']);
  const isVisible = ref(true);
  
  const confirm = () => {
    emit('Ok');
    isVisible.value = false;
  };
  
  const cancel = () => {
    emit('cancel');
    isVisible.value = false;
  };
  </script>
  
  <style scoped>
  .message-text {
    font-size: 16px;
  }
  </style>
  