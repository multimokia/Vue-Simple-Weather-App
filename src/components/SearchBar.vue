<script lang="ts">
import { PropType } from 'vue';

export default {
    name: 'SearchBar',
    props: {
        onSubmit: {
            type: Function as PropType<(payload: Event) => void>,
            required: true
        },
        searchQuery: {
            type: String,
            required: true
        }
    },
    methods: {
        updateSearchQuery(event: Event) {
            this.$emit("update:searchQuery", (event.target as HTMLInputElement).value);
        }
    }
}
</script>
<template>
    <div class="w-3/4">
        <form class="flex flex-row w-full " v-on:submit.prevent="onSubmit">
            <input
                type="text"
                placeholder="Search..."
                class="flex-grow p-2 text-lg text-left rounded-l-lg focus:bg-zinc-700 transition-colors"
                v-on:change="updateSearchQuery"
            />
            <button
                type="submit"
                class="p-2 text-lg text-white bg-green-600 rounded-r-lg rounded-l-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 drop-shadow-md">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </button>
        </form>
    </div>
</template>
