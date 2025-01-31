<script lang="ts" setup>
import { useConnectionStore } from '~/stores/clientSocketStore';
import { useFarmbotStore } from '~/stores/farmbotStore';




const displayToast = inject('displayToast');
const FarmBotStore = useFarmbotStore();
const { data, signOut } = useAuth()
const ConnectionStore = useConnectionStore();
if (!ConnectionStore.isConnected) { ConnectionStore.bindEvents() }

const mounted = ref(false);
onMounted(async () => {
    console.log("Index mounted");
    FarmBotStore.fetchLatestGridImages();

    await FarmBotStore.initalizeField();
    await FarmBotStore.fetchToDos();
    mounted.value = true;
    //displayToast("Global Notification Test","success")
});


definePageMeta({
    layoutTransition: true,
    layout: "layoutv2",
    title: "The FarmBot Field",
})
/**
 * This page serves as a temporary placeholder for the new app, everything important is inside <MainComponent/>
 
 */
</script>


<template>
    <template v-if="mounted">
        <MainComponent />
    </template>
    <template v-else>
        <v-progress-circular color="primary" indeterminate class="ma-auto"></v-progress-circular>

    </template>
</template>


<style></style>