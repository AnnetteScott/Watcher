<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div v-if="!showSearch" class="page_container">
				<p class="page_title">BookShelves:</p>
				<div class="shelf" v-for="shelf in dataBase.bookShelf" :key="shelf">
					<p class="shelf_title" v-if="shelf != ''">{{shelf}}</p>
					<p class="shelf_title" v-else>Unsorted</p>
					<div class="book_list">
						<template v-for="(INFO, ISBN) of dataBase.books" :key="ISBN">
							<div class="book" v-if="dataBase.books[ISBN].bookShelf == shelf">
								<img 
									:src="INFO.thumbnail"
									@click="showBookInfo(`${ISBN}`)"
								>
								<div class="bookmark" :style="{color: `${INFO.read ? 'green' : INFO.reading ? 'orange' : 'red'}`}" :title="INFO.read ? 'Read' : INFO.reading ? 'Reading' : 'Not Read'"></div>
							</div>
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
			this.results = {} as BookInfo
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
		$route(to){
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
	gap: 10px;
	min-height: 196px;
	margin: 5px 0px;
	padding: 10px 15px 32px;
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
	right: -5px;
	bottom: -4px;
	display: block;
	width: 1px;
	height: 6px;
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
</style>