<template>
    <ion-app>
        <headerTop :title="titleName"></headerTop>
        <ion-router-outlet style="margin-top: 55px;"></ion-router-outlet>
    </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import headerTop from '@/components/headerTop.vue'
export default defineComponent({
    name: 'App',
    components: {
        headerTop,
        IonApp,
        IonRouterOutlet,
    },
    data() {
        return {
            titleName: 'Home'
        }
    },
    watch: {
        $route(to, from){
            this.titleName = to.name
        }
    }
});
</script>