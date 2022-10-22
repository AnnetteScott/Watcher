<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div v-if="showSearch" style="height: calc(100% - 50px);overflow: scroll;">
                <div class="book_item_list">
                    <img 
                        :src="INFO.thumbnail" 
                        v-for="(INFO, ISBN) of dataBase.books" :key="ISBN" 
                        :style="{border: `5px solid ${INFO.read ? 'green' : 'red'}`}"
                        @click="showBookInfo(`${ISBN}`)"
                    >
                </div>
                <ion-button expand="block" style="height: 22px;" @click="''">Add New Series</ion-button>
                <p>Series:</p>
                <ion-button expand="block" style="position: absolute; bottom: 55px; width: calc(100% - 4px);" @click="showSearch = !showSearch">Add Book</ion-button>
            </div>
            <div v-else>
                <ion-searchbar placeholder="Enter ISBN Number" v-model="isbnNum"></ion-searchbar>
                <ion-button expand="block" @click="searchBookISBN()">Search</ion-button>
                <div class="book_search_item" v-if="showResults">
                    <div>
                        <img :src="results.thumbnail">
                        <div>
                            <h1>{{results.title}}</h1>
                            <p>{{results.authors[0]}}</p>
                            <p>{{results.pageCount}} pages</p>
                        </div>
                    </div>
                    <ion-button expand="block" @click="addBookToDB()">Add</ion-button>
                </div>
                <ion-button expand="block" style="position: absolute; bottom: 55px; width: calc(100% - 4px);" @click="showSearch = !showSearch">Back</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { addBook, returnAuth, returnDataBase, deleteBook, markReadBook } from '@/firebase'
import { Unsubscribe } from "firebase/auth";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { IonPage, IonContent, IonButton, IonIcon, IonInput, IonSearchbar } from '@ionic/vue';
import { search } from 'ionicons/icons';
import { BookVolume, BookInfo, UserData } from '@/types'
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
            dataBase: {} as DocumentData as UserData,
            isbnNum: '9781250027436',
            rawData: {} as BookVolume,
            results: {} as BookInfo,
            unsub: {} as Unsubscribe,
            showResults: false,
            showSearch: true,
        }
    },
    mounted(){
        this.watchDataBase()
    },
    methods: {
        watchDataBase(){
			const db = returnDataBase()
			const auth = returnAuth()
			if(auth.currentUser != null){
				const uid = auth.currentUser.uid
				this.unsub = onSnapshot(doc(db, "data", uid), (doc) => {
					// @ts-expect-error: It's just a thing
					this.dataBase = doc.data()?? {}
                    console.log(doc.data())
				});
			}
		},
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
            for(let i = 0; i < this.rawData.items[0].volumeInfo.industryIdentifiers.length; i++){
                if(this.rawData.items[0].volumeInfo.industryIdentifiers[i].type == 'ISBN_13'){
                    this.results.ISBN = this.rawData.items[0].volumeInfo.industryIdentifiers[i].identifier
                }
            }
            this.results.pageCount = this.rawData.items[0].volumeInfo.pageCount
            this.results.publisher = this.rawData.items[0].volumeInfo.publisher
            this.results.thumbnail = this.rawData.items[0].volumeInfo.imageLinks.thumbnail
            this.showResults = true
        },
        async addBookToDB(){
            await addBook(this.results.title, this.results.authors, this.results.publisher, this.results.ISBN, this.results.pageCount, this.results.thumbnail)
            this.showSearch = !this.showSearch
            this.isbnNum = ''
        },
        async markBookAsRead(ISBN: string){
            await markReadBook(ISBN)
        },
        async deleteBookFromDB(ISBN: string, title: string){
            if(confirm(`Are you sure you want to delete ${title}`) == true) {
                deleteBook(ISBN)
            }
        },
        showBookInfo(ISBN: string){

        }
    },
    watch: {
        $route(to, from){
            if(to.name == "Books"){
                this.watchDataBase()
            }
            else {
                this.unsub()
            }
        }
    }
});
</script>

<style>
.book_item_list{
    margin-top: 10px;
    gap: 10px;
    display: flex;
    justify-content: flex-start;
    overflow: scroll;
}
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