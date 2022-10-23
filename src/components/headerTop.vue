<template>
    <ion-header :translucent="true">
        <ion-toolbar>
            <ion-title>{{ title }}</ion-title>
            <ion-buttons slot="end" @click="showUserBox = !showUserBox">
                <ion-icon :icon="person" style="color: green;" v-if="userSignIn" />
                <ion-icon :icon="person" style="color: red;" v-if="!userSignIn" />
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <div v-if="showUserBox || !userSignIn" class="user_box">
        <div id="snackbar">The passwords don't match</div>
        <!-- User is not signed in -->
        <template v-if="!userSignIn"> 
            <form @submit.prevent="userAction()">
                <div class="signing_page" v-if="SignType == 'SignIn'">
                    <p style="font-size: 1.5rem">Sign In</p>
                    <div class="signing_page">
                        <input type="email" placeholder="Email" required v-model="userEmail">
                        <input :type="passwordSetting" placeholder="Password" required id="password" v-model="userPassword" minlength="8">
                        <p style="color: #00F9FF;cursor: pointer">Forgot Your Password?</p>
                    </div>
                    <input class="class_button" type="submit" value="Sign In" style="padding: 0px;height: 50px;">
                    <div>Don't have an account? <span style="color: #00F9FF;cursor: pointer" @click="SignType='CreateUser'">Create One!</span></div>
                </div>
                <div class="signing_page" v-if="SignType == 'CreateUser'">
                    <p style="font-size: 1.5rem">Create User</p>
                    <div class="signing_page">
                        <input type="text" placeholder="Name" required v-model="userName" minlength="3">
                        <input type="email" placeholder="Email" required v-model="userEmail">
                        <input :type="passwordSetting" placeholder="Password" required id="password" v-model="userPassword" minlength="8">
                        <input :type="passwordSetting" placeholder="Confirm Password" required id="confirm_password" v-model="userPasswordConfirm" minlength="8">
                    </div>
                    <input class="class_button" type="submit" value="Create User" style="padding: 0px;height: 50px;">
                    <div>Already have an account? <span style="color: #00F9FF;cursor: pointer;" @click="SignType='SignIn'">Sign In!</span></div>
                </div>
            </form>
        </template>
        <template v-else>
            <div class="profile_page">
                <div class="top_section">
                    <div class="class_button" @click="signOutUser()">Sign Out</div>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonButtons, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/vue';
import { person } from 'ionicons/icons';
import { onAuthStateChanged, Unsubscribe, User } from "firebase/auth";
import { signInUser, createNewUser, returnAuth, signOutUser } from '@/firebase'
export default defineComponent({
    name: 'headerTop',
    components: {
        IonButtons,
        IonHeader,
        IonTitle,
        IonIcon,
        IonToolbar
    },
    data() {
        return {
            person,
            showUserBox: false,
            SignType: 'SignIn',
            userSignIn: false,
            passwordSetting: 'password',
            unsubscribe: {} as Unsubscribe,
            userName: '',
            userEmail: '',
            userPassword: '',
            userPasswordConfirm: '',
            User: {displayName: ''} as User,
            signOutUser
        }
    },
    props: {
        title: String
    },
    mounted(){
        this.authListener()
    },
    methods: {
        authListener(){
            const auth = returnAuth()
            this.unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    this.userSignIn = true
                    this.showUserBox = false
                    this.SignType = ''
                    this.User = user
                } else {
                    // User is signed out
                    this.userSignIn = false
                    this.showUserBox = true
                    this.SignType = 'SignIn'
                }
            });
        },
        async userAction(){
            if(this.SignType == 'SignIn'){
                await signInUser(this.userEmail, this.userPassword);
                this.showUserBox = false
            }
            if(this.SignType == 'CreateUser'){
                if(this.userPassword == this.userPasswordConfirm){
                    await createNewUser(this.userEmail, this.userPassword, this.userName);
                    this.showUserBox = false
                }else {
                    let x = document.getElementById("snackbar");
                    if(x != null)
                    x.className = "show";
                    setTimeout(function(){ 
                        if(x != null)
                        x.className = x.className.replace("show", ""); 
                    }, 3000);
                }   
            }
        }
    },
    watch: {
        showUserBox(newVal){
            if(newVal == false){
                if(this.userSignIn == false){
                    this.showUserBox = true
                }
            }
        }
    }
});
</script>

<style scoped>
ion-icon {
  font-size: 35px;
}
.user_box{
    position: absolute;
    z-index: 100;
    overflow: scroll;
    top: 68px;
    left: 2px;
    right: 2px;
    bottom: 10px;
}
form {
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle, #880097, #470055);
    border-radius: 15px;
    border: 1px solid black;
    padding: 20px;
    color: white;
}
.signing_page{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
}

input{
    font-size: 17px;
    padding-left: 15px;
    border: 1px solid lightgrey;
    width: 30ch;
    height: 35px;
    border-radius: 25px;
    outline: none;
}

.class_button{
    border: 1px solid black;
    border-radius: 20px;
    padding: 10px;
    width: 20ch;
    background-color: white;
    color: black;
    cursor: pointer;
    user-select: none;
}

#snackbar {
    visibility: hidden;
    min-width: 250px;
    margin-left: -125px;
    background-color: #770000;
    color: #fff;
    text-align: center;
    border-radius: 2px;
    padding: 16px;
    position: fixed;
    z-index: 1;
    left: 50%;
    bottom: 30px;
    font-size: 17px;
}

#snackbar.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

@-webkit-keyframes fadein {
    from {bottom: 0; opacity: 0;} 
    to {bottom: 30px; opacity: 1;}
}

@keyframes fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
}

@-webkit-keyframes fadeout {
    from {bottom: 30px; opacity: 1;} 
    to {bottom: 0; opacity: 0;}
}

@keyframes fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
    }

.profile_page{
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle, #880097, #470055);
    border-radius: 15px;
    border: 1px solid black;
}

.top_section{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
}
</style>
