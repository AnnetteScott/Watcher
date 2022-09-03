<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="Home" href="/tabs/Home">
          <ion-icon :icon="home" />
          <ion-label>Home</ion-label>
        </ion-tab-button>
          
        <ion-tab-button tab="TV" href="/tabs/TV">
          <ion-icon :icon="tv" />
          <ion-label>TV Shows</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="Movie" href="/tabs/Movie">
          <ion-icon :icon="videocam" />
          <ion-label>Movies</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { home, videocam, tv } from 'ionicons/icons';

export default defineComponent({
    name: 'TabsPage',
    components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet },
    setup() {
        return {
        home, 
        videocam, 
        tv,
        }
    }
});
</script>
