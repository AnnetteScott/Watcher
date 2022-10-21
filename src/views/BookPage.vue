<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <ion-button expand="block" style="position: absolute; bottom: 55px; width: calc(100% - 4px);" @click="showSearch = !showSearch">Add Book</ion-button>
            <div v-if="showSearch">
                <ion-searchbar placeholder="Enter ISBN Number"></ion-searchbar>
                <ion-button expand="block">Search</ion-button>
                <div class="book_search_item" v-if="showResults">
                    <div>
                        <img :src="results.thumbnail">
                        <div>
                            <h1>{{results.title}}</h1>
                            <p>{{results.authors[0]}}</p>
                            <p>{{results.pageCount}} pages</p>
                        </div>
                    </div>
                    <ion-button expand="block" @click="addBook()">Add</ion-button>
                </div>
                <ion-button expand="block" style="position: absolute; bottom: 55px; width: calc(100% - 4px);" @click="showSearch = !showSearch">Back</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, IonInput, IonSearchbar } from '@ionic/vue';
import { search } from 'ionicons/icons';
import { BookVolume, BookInfo } from '@/types'
import $ from 'jquery'
export default  defineComponent({
    name: 'BookPage',
    components: { 
        IonButton, 
        IonInput, 
        IonSearchbar, 
        IonContent, 
        IonIcon, 
        IonPage 
    },
    data() {
        return {
            search,
            isbnNum: '9781250027436',
            rawData: {} as BookVolume,
            results: {} as BookInfo,
            showResults: false,
            showSearch: false,
        }
    },
    mounted(){
        this.searchBookISBN()
    },
    methods: {
        searchBookISBN(){
            $.ajax({
                context: this,
                dataType: "json",
                url: `https://www.googleapis.com/books/v1/volumes?q=isbn:${this.isbnNum}`,
                cache: false,
                success: function (data){
                    this.rawData = data
                    this.processSearch()
                },
                error: function (xhr){
                    console.log("Error " + xhr.status + ", could not check for updates.");
                }
            });
        },
        processSearch(){
            this.results.title = this.rawData.items[0].volumeInfo.title
            this.results.authors = this.rawData.items[0].volumeInfo.authors
            this.results.ISBN = this.rawData.items[0].volumeInfo.industryIdentifiers[0].identifier
            this.results.pageCount = this.rawData.items[0].volumeInfo.pageCount
            this.results.publisher = this.rawData.items[0].volumeInfo.publisher
            this.results.thumbnail = this.rawData.items[0].volumeInfo.imageLinks.thumbnail
            this.showResults = true
        },
        addBook(){
            
        }

    }
    
});
</script>

<style>
.book_search_item{
    border: 1px solid black;
    width: 94%;
    border-radius: 10px;
    margin-left: 3%;
    padding: 3px 8px;
    display: flex;
    flex-direction: column;
    
}

.book_search_item > div {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    gap: 10px;
    text-align: center;
}
</style>