
<script lang="ts" setup>
/**
 * This Component allows us to use open-crop-icons with easy
 * 
 * Usage:
 * <v-icon><CustomIcon icon="PLANT_NAME" /></v-icon>
 * 
 * The icon-name prop should be the name of the plant you want to display
 * For a full list of plants, refer to the repository:
 * https://github.com/openfarmcc/open-crop-icons/tree/mainline/icons
 * 
 * We refrained from putting the <v-icon> tag inside the component to allow for more flexibility, e.g. by adding additional
 * parameterse to the <v-icon> tag
 * 
 * Plants consisting of multiple words should be separated by underscores
 * 
 * IMPORTANT: When importing individual items, their identifiers are sometimes different from how they
 * show up in "cropIcons"
 */

import { computed } from 'vue';
//import  cropIcons  from 'open-crop-icons';
import { defineProps } from 'vue';

// Define props to accept the icon name
const props = defineProps<{
  icon: string;
}>();

// Use a computed property to get the corresponding icon path
//const iconPath = cropIcons[props.icon];
</script>

<template>
  <!--<img :src="iconPath" :alt="props.icon" />-->
  ICON
</template>


<style>
/* Your styles here */
</style>