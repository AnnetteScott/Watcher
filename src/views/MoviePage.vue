<template>
    <ion-page>
        <ion-content :fullscreen="true">
        
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
export default  defineComponent({
    name: 'MoviePage',
    components: { IonContent, IonPage }
});
</script>
