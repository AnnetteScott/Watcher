<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div v-if="!showSearch" class="page_container">
				<p class="page_title">BookShelves:</p>
				<div class="shelf" v-for="shelfName in dataBase.shelfNames" :key="shelfName">
					<p class="shelf_title" @click="showMoveShelf = !showMoveShelf, bookShelfSelect = shelfName">{{shelfName}}</p>
					<div class="book_list">
						<template v-for="ISBN of dataBase.bookShelf[shelfName]" :key="ISBN">
							<div class="book">
								<img 
									:src="dataBase.books[ISBN].thumbnail"
									@click="showBookInfo(`${ISBN}`)"
								>
								<div class="bookmark" :style="{color: `${dataBase.books[ISBN].read ? 'green' : dataBase.books[ISBN].reading ? 'orange' : 'red'}`}" :title="dataBase.books[ISBN].read ? 'Read' : dataBase.books[ISBN].reading ? 'Reading' : 'Not Read'"></div>
                                
                                <div class="page_count_display" :style="{background: `${dataBase.books[ISBN].read ? 'green' : dataBase.books[ISBN].reading ? 'orange' : 'red'}`}" v-if="dataBase.books[ISBN].reading">{{dataBase.books[ISBN].currentPage}}</div>
							</div>
						</template>
					</div>
				</div>
				<ion-button expand="block" style="position: absolute; bottom: 55px; width: calc(100% - 4px);" @click="showSearch = !showSearch">Add Book</ion-button>
			</div>
			<div v-if="showSearch" style="height: calc(100% - 40px);">
				<ion-searchbar placeholder="Enter ISBN Number" v-model="isbnNum"></ion-searchbar>
				<ion-searchbar placeholder="Enter Book Name" v-model="searchBookName"></ion-searchbar>
				<ion-button expand="block" @click="searchBookISBN()">Search</ion-button>
                <div v-if="showResults" style="display: flex;flex-direction: column;height: calc(100% - 162px);overflow: scroll">
                    <div class="book_search_item" v-for="bookInfo in results" :key="bookInfo.ISBN">
                        <div>
                            <div class="book">
                                <img :src="bookInfo.thumbnail">
                                <div class="bookmark" 
                                    v-if="bookInfo.ISBN in dataBase.books"
                                    :style="{color: `${dataBase.books[bookInfo.ISBN].read ? 'green' : dataBase.books[bookInfo.ISBN].reading ? 'orange' : 'red'}`}">
                                </div>
                            </div>
                            <div>
                                <h1>{{bookInfo.title}}</h1>
                                <p>{{bookInfo.authors[0]}}</p>
                                <p>{{bookInfo.pageCount}} pages</p>
                            </div>
                        </div>
                        <ion-button expand="block" style="margin-top: 15px" @click="addBookToDB(bookInfo.title, bookInfo.authors, bookInfo.publisher, bookInfo.ISBN, bookInfo.thumbnail)">Add</ion-button>
                    </div>
                </div>
				<ion-button expand="block" style="position: absolute; bottom: 55px; width: calc(100% - 4px);" @click="showSearch = !showSearch">Back</ion-button>
			</div>
			<div class="book_pop_up_container" v-if="showBookPopUp">
				<div class="book_pop_up" >
					<ion-icon :icon="close" class="icon_close" @click="showBookPopUp = false"></ion-icon>
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
							<label>Current Page:</label>
							<input v-model="currentPage" style="width: 10ch; aspect-ratio: 0;">
						</div>
						<div class="input_item">
							<label>Bookshelf:</label>
							<select  v-model="bookShelfSelect">
								<option v-for="shelf, shelfName in dataBase.bookShelf" :value="shelfName" :key="shelfName">{{shelfName}}</option>
							</select>
						</div>
						<div style="margin-top: 15px;">
							<ion-button expand="block" style="height: 20px;" @click="showAddShelf = true">Add BookShelf</ion-button>
						</div>
                        
                        <div style="margin-top: 15px;" class="input_item">
							<label>Position:</label>
							<select  v-model="bookShelfPosSelect">
                                <template v-if="Object.keys(dataBase.bookShelf[bookShelfSelect]).length != 0">
                                    <option v-for="pos in Object.keys(dataBase.bookShelf[bookShelfSelect])" :value="pos" :key="pos">{{parseInt(pos) + 1}}</option>
                                    <option :value="Object.keys(dataBase.bookShelf[bookShelfSelect]).length">{{Object.keys(dataBase.bookShelf[bookShelfSelect]).length + 1}}</option>
                                </template>
                               <template v-else>
                                    <option value="0">1</option>
                               </template>
							</select>
						</div>
						<ion-button expand="block" @click="saveBookToDB()" style="position: absolute; bottom: 0px; width: 90%; min-height: 25px;">Save</ion-button>
						<ion-button expand="block" @click="deleteBookFromDB()" style="position: absolute; bottom: 60px; width: 90%; min-height: 25px;"  color="danger">Delete</ion-button>
					</div>
				</div>
			</div>
			<div class="book_pop_up_container" v-if="showAddShelf">
				<div class="book_pop_up">
					<ion-icon :icon="close" class="icon_close" @click="showAddShelf = false"></ion-icon>
					<div class="book_pop_inner" style="min-height: 175px;">
                        <label style="min-width:15ch">Bookshelf Name:</label>
                        <input v-model="bookShelf" style="width: 100%; aspect-ratio: 0;">
						<ion-button expand="block" @click="createBookShelf()" style="position: absolute; bottom: 10px; width: 90%;">Create</ion-button>
					</div>
				</div>
			</div>
            <div class="book_pop_up_container" v-if="showMoveShelf">
                <div class="book_pop_up">
                    <ion-icon :icon="close" class="icon_close" @click="showMoveShelf = false"></ion-icon>
                    <div class="book_pop_inner">
                        <label>Bookshelf Position:</label>
                        <select  v-model="shelfPos">
                            <option v-for="pos in Object.keys(dataBase.shelfNames)" :value="pos" :key="pos">{{parseInt(pos) + 1}}</option>
                        </select>
                        <ion-button expand="block" @click="changeShelf()" style="position: absolute; bottom: 50px; width: 90%;">Save</ion-button>
                    </div>
                </div>
            </div>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { addBook, returnAuth, returnDataBase, deleteBook, addBookShelf, updateBook, moveShelf } from '@/firebase'
import { Unsubscribe } from "firebase/auth";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { IonPage, IonContent, IonButton, IonIcon, IonSearchbar } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { BookVolume, BookInfo, UserData } from '@/types'
import $ from 'jquery'
export default  defineComponent({
	name: 'BookPage',
	components: { 
		IonButton,
		IonSearchbar, 
		IonContent, 
		IonIcon, 
		IonPage 
	},
	data() {
		return {
			close,
			dataBase: {} as DocumentData as UserData,
			isbnNum: '',
			rawData: {} as BookVolume,
			results: {} as BookInfo[],
			unsub: {} as Unsubscribe,
			showResults: false,
			showSearch: false,
			showAddShelf: false,
			showBookPopUp: false,
			read: false,
			reading: false,
			bookShelf: '',
			bookShelfSelect: '',
			bookShelfPosSelect: '0',
			bookTitle: '',
            bookChanged: false,
            showMoveShelf: false,
            shelfPos: '',
            currentPage: '',
            searchBookName: '',
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
			this.results = {} as BookInfo[]
            if(this.isbnNum != ''){
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
            } else if(this.searchBookName != ''){
                $.ajax({
                    context: this,
                    dataType: "json",
                    url: `https://www.googleapis.com/books/v1/volumes?q=${this.searchBookName}`,
                    cache: false,
                    success: function (data){
                        this.rawData = data
                        this.processSearch()
                    },
                    error: function (xhr){
                        console.log("Error " + xhr.status + ", could not check for updates.");
                    }
                });
            }
		},
		processSearch(){
            let totalCount = 10
            if(this.rawData.totalItems != 0){
                if(this.rawData.totalItems < totalCount){
                    totalCount = this.rawData.totalItems
                }
                for(let count = 0; count < totalCount; count++){
                    let volumeInfo = this.rawData.items[count].volumeInfo
                    if(
                        volumeInfo.industryIdentifiers != undefined && 
                        volumeInfo.authors != undefined && 
                        volumeInfo.pageCount != undefined && 
                        volumeInfo.publisher != undefined && 
                        volumeInfo.title != undefined
                    )
                        {
                        this.results[count] = {} as BookInfo
                        this.results[count].title = volumeInfo.title
                        this.results[count].authors = volumeInfo.authors
                        let foundISBN = false
                        for(let i = 0; i < volumeInfo.industryIdentifiers.length; i++){
                            if(volumeInfo.industryIdentifiers[i].type == 'ISBN_13'){
                                foundISBN = true
                                this.results[count].ISBN = volumeInfo.industryIdentifiers[i].identifier
                            }
                        }
                        if(!foundISBN){
                            this.results[count].ISBN = volumeInfo.industryIdentifiers[0].identifier
                        }
                        this.results[count].pageCount = volumeInfo.pageCount
                        this.results[count].publisher = volumeInfo.publisher
                        if(volumeInfo.imageLinks != undefined){
                            this.results[count].thumbnail = volumeInfo.imageLinks.thumbnail
                        }else{
                            this.results[count].thumbnail = ''
                        }
                    }
                }
                this.showResults = true
            }
		},
		async addBookToDB(title: string, authors: string[], publisher: string, ISBN: string, thumbnail: string){
			await addBook(title, authors, publisher, ISBN, thumbnail)
			this.showSearch = !this.showSearch
			this.isbnNum = ''
			this.searchBookName = ''
			this.showResults = false
			this.results = {} as BookInfo[]
            this.currentPage = ''
		},
		async deleteBookFromDB(){
			if(Object.keys(this.dataBase).length != 0){
				let title = this.dataBase.books[this.isbnNum].title
				if(confirm(`Are you sure you want to delete ${title}`) == true) {
					deleteBook(this.isbnNum, this.dataBase.books[this.isbnNum].bookShelf)
					this.showBookPopUp = false
				}
			}
		},
		async saveBookToDB(){
            if(this.read){
                this.reading = false
            }
            if(this.currentPage == '' || this.currentPage == null || this.currentPage == undefined){
                this.currentPage = '0'
            }
            let bookArr = this.dataBase.bookShelf[this.bookShelfSelect]
            const index = bookArr.indexOf(this.isbnNum);
            if (index > -1) {
                bookArr.splice(index, 1);
            }
            bookArr.splice(parseInt(this.bookShelfPosSelect), 0, this.isbnNum)
            bookArr.join()
            await updateBook(this.isbnNum, this.read, this.reading, this.bookShelfSelect, bookArr, this.dataBase.books[this.isbnNum].bookShelf, this.currentPage)
            this.showBookPopUp = false
            this.bookChanged = false
            this.isbnNum = ''
		},
		async createBookShelf(){
			await addBookShelf(this.bookShelf)
			this.showAddShelf = false
			this.bookShelf = ''
		},
        async changeShelf(){
            if(this.shelfPos == ''){
                this.shelfPos = '0'
            }
            let bookArr = this.dataBase.shelfNames
            const index = bookArr.indexOf(this.bookShelfSelect);
            if (index > -1) {
                bookArr.splice(index, 1);
            }
            bookArr.splice(parseInt(this.shelfPos), 0, this.bookShelfSelect)
            bookArr.join()
            await moveShelf(bookArr)
            this.showMoveShelf = false
            this.shelfPos = ''
            this.bookShelfSelect = ''
        },
		showBookInfo(ISBN: string){
            this.bookChanged = false
			this.isbnNum = ISBN
			this.showBookPopUp = true
			this.bookTitle = this.dataBase.books[ISBN].title
			this.read = this.dataBase.books[ISBN].read
			this.reading = this.dataBase.books[ISBN].reading
			this.bookShelfSelect = this.dataBase.books[ISBN].bookShelf
            this.bookShelfPosSelect = this.dataBase.bookShelf[this.bookShelfSelect].indexOf(ISBN).toString()
            this.currentPage = this.dataBase.books[ISBN].currentPage
		}
	},
	watch: {
		$route(to){
			if(to.name == "Books"){
				this.watchDataBase()
			}
			else {
				this.unsub()
			}
		},
        showBookPopUp(newVal){
            if(newVal === false){
                this.isbnNum = ''
            }
        }
	}
});
</script>

<style scoped>
p{
	margin: 0;
}

.icon_close{
    position: absolute; 
    right: 0px; 
    top: 0px; 
    color: red; 
    width: 32px; 
    height: 32px;
    z-index: 100;
}

.page_container{
	height: calc(100% - 44px);
	overflow: scroll;
	margin-top: 0px;
	padding: 2% 0px;
	box-shadow: 0px -10px 30px -10px #0008 inset;
}
.page_title{
	border-bottom: 2px solid #0000003b; 
	margin: 5px 0px 20px;
	text-align: center;
	font-size: xx-large;
}
.shelf{
	position: relative;
	margin-top: -75px;
	padding: 40px 0px;
	overflow: hidden;
}
.shelf_title{
	width: 120%;
	margin-left: -10%;
	padding: 15px calc(10% + 20px) 10px;
	background: linear-gradient(180deg, #bbb4, #0024);
	box-shadow: 0px 0px 30px -5px #110c2e56;
}
.shelf_title::after{
	content: '▼';
	position: absolute;
	right: 15px;
}
.shelf:first-of-type .shelf_title{
	padding-top: 25px;
	background: linear-gradient(180deg, #bbb2, #0023);
	clip-path: polygon(
		0% 14px,
		100% 14px,
		100% 1000%,
		0% 1000%
	);
}
.book_list{
	position: relative;
	display: flex;
	justify-content: flex-start;
	gap: 18px;
	margin: 5px 0px;
	padding: 10px 20px 32px 15px;
	overflow-x: scroll;
	overflow-y: hidden;
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

.book{
	position: relative;
	width: 128px;
	min-width: 128px;
	height: 192px;
	min-height: 192px;
	text-align: center;
	color: white;
}
.book::after{
	content: '';
	position: absolute;
	z-index: 1;
	right: -7px;
	bottom: -7px;
	display: block;
	width: 1px;
	height: 10px;
	background-color: #000;
	transform: rotate(-45deg);
	transform-origin: 50% 100%;
	opacity: 0.2;
}
.book img{
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;
	color: #aaa;
	border-radius: 3px 0px 0px 3px;
	box-shadow:
		1px 1px 0px currentColor,
		2px 2px 0px currentColor,
		3px 3px 0px currentColor,
		4px 4px 0px currentColor,
		5px 5px 0px currentColor,
		6px 6px 0px currentColor,
		7px 7px 0px currentColor,
		5px 5px 12px -2px #0008,
		3px 3px 18px -4px #0002;
}

.bookmark {
	position: absolute;
	z-index: 2;
    top: -1px;
    right: 5px;
    font-size: 0.0rem;
    padding: 3px;
	width: 20px;
	height: 35px;
	background-color: #fff;
	clip-path: polygon(
		0% 0%,
		100% 0%,
		100% 100%,
		50% 80%,
		0% 100%
	);
}
.bookmark::before {
	content: '';
	position: absolute;
	inset: 0px 2px 4px;
	color: inherit;
	background-color: currentColor;
	clip-path: inherit;
}

.book_search_item > div {
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 100%;
	gap: 10px;
	text-align: center;
}

.page_count_display {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 10;
    padding: 3px;
    font-size: 0.7rem;
    max-width: 32px;
}

.book_pop_up_container{
	backdrop-filter: blur(8px);
	position: absolute;
	z-index: 50;
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
    overflow-y: scroll;
    overflow-x: none;
}

.book_pop_inner{
    position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15px;
	padding: 30px 0px;
    height: 100%;
    min-height: 480px;
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
</style>