<script lang="ts" setup>
import { useFarmbotStore } from '../stores/farmbotStore';
import { useConnectionStore } from '../stores/clientSocketStore';
import watering from '@/assets/watering.png';
import weeding from '@/assets/weeding.png';
const farmbotStore = useFarmbotStore();
// let waterTodo = farmbotStore.waterTodo;
// let weedTodo = farmbotStore.weedTodo;
const ConnectionStore = useConnectionStore();
farmbotStore.fetchToDos();

// watch(() => farmbotStore.waterTodo, (newValue, oldValue) => {
//   console.log(`waterTodo changed from ${oldValue} to ${newValue}`);
// //   waterTodo = newValue;
// });

// watch(() => farmbotStore.weedTodo, (newValue, oldValue) => {
//   console.log(`weedTodo changed from ${oldValue} to ${newValue}`);
// //   weedTodo = newValue;
//   // Add your custom logic here
// });

</script>

<template>
    <v-row>
        <v-col cols="12" class="ml-3 pr-6">
            <v-card-title class="mb-0 text-left ml-n4">TODO's</v-card-title>
            <v-card>
                <v-row>
                    <!-- icon -->
                    <v-col cols="3" class="pt-8 text-center">
                        <v-icon size="36">
                            <img :src="watering" alt="water-icon" width="48" height="36">
                        </v-icon>
                    </v-col>
                    <!-- text -->
                    <v-col cols="6" class="pt-6 pl-0 text-left">
                        <v-card-text>Water plants: {{farmbotStore.waterTodo}}</v-card-text>
                    </v-col>

                    <!-- checkmark -->
                    <v-col v-if="farmbotStore.waterTodo === 0" cols="3" class="pt-8">
                        <v-scale-transition>
                            <v-icon size="36" color="success" icon="mdi-check"></v-icon>
                        </v-scale-transition>
                    </v-col>
                </v-row>
                <v-row>
                    <!-- icon -->
                    <v-col cols="3" class="mb-5 text-center">
                        <v-icon size="36">
                            <img :src="weeding" alt="water-icon" width="48" height="36">
                        </v-icon>
                    </v-col>
                    <!-- text -->
                    <v-col cols="6" class="pt-1 pl-0 text-left">
                        <v-card-text>Inspect weeds:{{farmbotStore.weedTodo}}</v-card-text>
                    </v-col>
                    <!-- checkmark -->
                    <v-col v-if="farmbotStore.weedTodo === 0" cols="3">
                        <v-scale-transition>
                            <v-icon size="36" color="success" icon="mdi-check"></v-icon>
                        </v-scale-transition>
                    </v-col>
                </v-row>
            </v-card>
        </v-col>
    </v-row>
</template>

<style>
.move-up{
    z-index: 1;
}
</style>