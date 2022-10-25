<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="page_container" v-if="showItems">
                <div class="shelf">
                    <p class="shelf_title">Books</p>
                    <div class="book_list">
                        <template v-for="(bookInfo, ISBN) of dataBase.books" :key="ISBN">
                            <div class="book" v-if="bookInfo.reading">
                                <img 
                                    :src="dataBase.books[ISBN].thumbnail"
                                >
                                <div class="bookmark" :style="{color: `${dataBase.books[ISBN].read ? 'green' : dataBase.books[ISBN].reading ? 'orange' : 'red'}`}" :title="dataBase.books[ISBN].read ? 'Read' : dataBase.books[ISBN].reading ? 'Reading' : 'Not Read'"></div>
                                
                                <div class="page_count_display" :style="{background: `${dataBase.books[ISBN].read ? 'green' : dataBase.books[ISBN].reading ? 'orange' : 'red'}`}" v-if="dataBase.books[ISBN].reading">{{dataBase.books[ISBN].currentPage}}</div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="shelf">
                    <p class="shelf_title">TV Shows</p>
                    <div class="book_list">
                        <template v-for="(bookInfo, ISBN) of dataBase.books" :key="ISBN">
                            
                        </template>
                    </div>
                </div>
                
                <div class="shelf">
                    <p class="shelf_title">Movies</p>
                    <div class="book_list">
                        <template v-for="(bookInfo, ISBN) of dataBase.books" :key="ISBN">
                            
                        </template>
                    </div>
                </div>


            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { returnAuth, returnDataBase } from '@/firebase'
import { Unsubscribe, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { UserData } from '@/types'
export default  defineComponent({
    name: 'HomePage',
    components: { IonContent, IonPage },
    data(){
        return {
            shelfList: ['Books', 'TV Shows', 'Movies'],
            dataBase: {} as DocumentData as UserData,
            unsub: {} as Unsubscribe,
            unsubscribe: {} as Unsubscribe,
            showItems: false
        }
    },
    mounted(){
		this.watchDataBase()
	},
    methods: {
        watchDataBase(){
			const db = returnDataBase()
			const auth = returnAuth()
            this.unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in
                    if(auth.currentUser != null){
                        const uid = auth.currentUser.uid
                        this.unsub = onSnapshot(doc(db, "data", uid), (doc) => {
                            // @ts-expect-error: It's just a thing
                            this.dataBase = doc.data()?? {}
                            console.log(doc.data())
                            this.showItems = true
                        });
                    }
                } else {
                    // User is signed out
                    this.unsub()                    
                }
            });
		},
    },
    watch: {
        $route(to){
			if(to.name == "Home"){
				this.watchDataBase()
			}
			else {
				this.unsub()
				this.unsubscribe()
			}
		},
    }
});
</script>

<style scoped>
p{
    margin: 0px;
}
.page_container{
    height: 100%;
    overflow-y: scroll;
}
.shelf{
	position: relative;
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

.page_count_display {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 10;
    padding: 3px;
    font-size: 0.7rem;
    max-width: 32px;
}
</style>
