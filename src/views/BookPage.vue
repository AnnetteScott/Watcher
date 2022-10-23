<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div v-if="!showSearch" style="height: calc(100% - 44px);overflow: scroll;margin-top: 4px;">
                Library:
                <div class="book_item_list">
                    <template v-for="(INFO, ISBN) of dataBase.books" :key="ISBN">
                        <img 
                            v-if="dataBase.books[ISBN].bookShelf == ''"
                            :src="INFO.thumbnail"
                            :style="{border: `7px solid ${INFO.read ? 'green' : INFO.reading ? 'orange' : 'red'}`}"
                            @click="showBookInfo(`${ISBN}`)"
                        >
                    </template>
                </div>
                <p class="bookShelf_top_label">BookShelves:</p>
                <div class="bookShelf_item" v-for="shelf in dataBase.bookShelf" :key="shelf">
                    <p class="shelf_item">{{shelf}}</p>
                    <div class="book_item_list">
                        <template v-for="(INFO, ISBN) of dataBase.books" :key="ISBN">
                            <img 
                                v-if="dataBase.books[ISBN].bookShelf == shelf"
                                :src="INFO.thumbnail"
                                :style="{border: `7px solid ${INFO.read ? 'green' : INFO.reading ? 'orange' : 'red'}`}"
                                @click="showBookInfo(`${ISBN}`)"
                            >
                        </template>
                    </div>
                </div>
                <ion-button expand="block" style="position: absolute; bottom: 55px; width: calc(100% - 4px);" @click="showSearch = !showSearch">Add Book</ion-button>
            </div>
            <div v-if="showSearch">
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
            <div class="book_pop_up_container" v-if="showBookPopUp">
                <div class="book_pop_up" >
                    <ion-icon :icon="close" style="position: absolute; right: -4px; top: -2px; color: red; width: 32px; height: 32px;" @click="showBookPopUp = false"></ion-icon>
                    <div class="book_pop_inner">
                        <p>{{bookTitle}}</p>
                        <div class="input_item">
                            <label>Read:</label>
                            <input type="checkbox" v-model="read">
                        </div>
                        <div class="input_item">
                            <label>Reading:</label>
                            <input type="checkbox" v-model="reading">
                        </div>
                        
                        <div class="input_item">
                            <label>Bookshelf:</label>
                            <select  v-model="bookShelfSelect">
                                <option value=""></option>
                                <template v-if="dataBase.bookShelf.length > 0">
                                    <option v-for="shelf in dataBase.bookShelf" :value="shelf" :key="shelf">{{shelf}}</option>
                                </template>
                            </select>
                        </div>
                        <div style="margin-top: 15px;">
                            <ion-button expand="block" style="height: 20px;" @click="showAddShelf = true">Add BookShelf</ion-button>
                        </div>
                        <ion-button expand="block" @click="saveBookToDB()" style="position: absolute; bottom: 50px; width: 90%;">Save</ion-button>
                        <ion-button expand="block" color="danger" @click="deleteBookFromDB()" style="position: absolute; bottom: 4px;">Delete</ion-button>
                    </div>
                </div>
            </div>
            <div class="book_pop_up_container" v-if="showAddShelf">
                <div class="book_pop_up" >
                    <ion-icon :icon="close" style="position: absolute; right: -4px; top: -2px; color: red; width: 32px; height: 32px;" @click="showAddShelf = false"></ion-icon>
                    <div class="book_pop_inner">
                        <div class="input_item">
                            <label>BookShelf Name:</label>
                            <input v-model="bookShelf" style="width: 140px; aspect-ratio: 0;">
                        </div>
                        <ion-button expand="block" @click="createBookShelf()" style="position: absolute; bottom: 50px; width: 90%;">Create</ion-button>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { addBook, returnAuth, returnDataBase, deleteBook, addBookShelf, updateBook } from '@/firebase'
import { Unsubscribe } from "firebase/auth";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { IonPage, IonContent, IonButton, IonIcon, IonInput, IonSearchbar } from '@ionic/vue';
import { close } from 'ionicons/icons';
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
            close,
            dataBase: {} as DocumentData as UserData,
            isbnNum: '9781250027436',
            rawData: {} as BookVolume,
            results: {} as BookInfo,
            unsub: {} as Unsubscribe,
            showResults: false,
            showSearch: false,
            showAddShelf: false,
            showBookPopUp: false,
            read: false,
            reading: false,
            bookShelf: '',
            bookShelfSelect: 'None',
            bookTitle: ''
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
            this.showResults = false
            this.results = {} as BookInfo
        },
        async deleteBookFromDB(){
            if(Object.keys(this.dataBase).length != 0){
                let title = this.dataBase.books[this.isbnNum].title
                if(confirm(`Are you sure you want to delete ${title}`) == true) {
                    deleteBook(this.isbnNum)
                    this.showBookPopUp = false
                }
            }
        },
        async saveBookToDB(){
            if(this.read){
                this.reading = false
            }
            await updateBook(this.isbnNum, this.read, this.reading, this.bookShelfSelect)
            this.showBookPopUp = false
        },
        async createBookShelf(){
            await addBookShelf(this.bookShelf)
            this.showAddShelf = false
            this.bookShelf = ''
        },
        showBookInfo(ISBN: string){
            this.isbnNum = ISBN
            this.showBookPopUp = true
            this.bookTitle = this.dataBase.books[ISBN].title
            this.read = this.dataBase.books[ISBN].read
            this.reading = this.dataBase.books[ISBN].reading
            this.bookShelfSelect = this.dataBase.books[ISBN].bookShelf
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

<style scoped>
p{
    margin: 0;
}
.book_item_list{
    margin-top: 5px;
    margin-bottom: 10px;
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

.book_pop_up_container{
    backdrop-filter: blur(8px);
    position: absolute;
    top: 0px;
    bottom: 55px;
    left: 0px;
    right: 0px;
}
.book_pop_up{
    position: absolute;
    top: 7px;
    bottom: 7px;
    left: 10%;
    right: 10%;
    z-index: 50;
    border: 1px solid black;
    background-color: white;
    border-radius: 10px;
    padding: 10px;
}

.book_pop_inner{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 30px 0px;
}

input{
    width: 30px;
    aspect-ratio: 1;
}
.input_item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 10px;
    width: 100%;
}
select{
    width: 20ch;
}
.bookShelf_top_label{
    border-bottom: 2px solid black; 
    margin: 5px 0px 20px;
    text-align: center;
    font-size: xx-large;
}
.shelf_item{
    border-bottom: 1px solid grey; 
}
</style>