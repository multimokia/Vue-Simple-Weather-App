<script lang="ts">
    import { Album } from './types/Album';
    import { Photo } from './types/Photo';
    import { User } from './types/User';

    export default {
        data() {
            return {
                msg: 'Hello Vite + Vue!',
                albums: [] as Album[],
                images: [] as Photo[],
                users: [] as User[],
            }
        },
        methods: {
            async fetchAlbums() {
                const res = await fetch('https://jsonplaceholder.typicode.com/albums');
                const data = await res.json();
                this.albums = data;
            },
            async fetchImages() {
                const res = await fetch('https://jsonplaceholder.typicode.com/photos');
                const data = await res.json();
                this.images = data;
            },
            async fetchUsers() {
                const res = await fetch('https://jsonplaceholder.typicode.com/users');
                const data = await res.json();
                this.users = data;
            }
        },
        mounted() {
            this.fetchAlbums();
            this.fetchImages();
            this.fetchUsers();
        }
    }
</script>

<template>
    <div class="place-items-center min-h-screen space-y-5 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 ">
        <div
            v-for="album in albums"
            :key="album.id"
            class="rounded-lg drop-shadow-lg animate-fade-up logo hover:animate-shake"
        >
            <img
                class="w-full h-full rounded-t-lg"
                src="https://picsum.photos/200"
            />
            <div class="bg-zinc-800 p-4 rounded-b-lg">
                <h1 class="font-bold text-lg text-left whitespace-nowrap w-fit">{{ album.title }}</h1>
                <hr class="bg-gray-500"/>
                <h3 class="text-right text-zinc-500">{{ users.find(u => u.id === album.userId)?.name }}</h3>
            </div>
        </div>
    </div>
</template>

<style scoped>
.logo {
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 1em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 1em #42b883aa);
}
</style>
