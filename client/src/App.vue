<template>
    <div id="app">
        <div id="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/room">Room</router-link> |
            <router-link to="/test-rtc-camera-local">Test RTC Camera Local</router-link> |
            <router-link to="/test-rtc-audio-file-local">Test RTC Audio File Local</router-link> |
            <router-link to="/test-rtc-signalling-server">Test RTC Signalling Server</router-link>
        </div>
        <router-view />
    </div>
</template>

<style lang="scss">
// #app {
//     font-family: Avenir, Helvetica, Arial, sans-serif;
//     -webkit-font-smoothing: antialiased;
//     -moz-osx-font-smoothing: grayscale;
//     text-align: center;
//     color: #2c3e50;
// }

// #nav {
//     padding: 30px;

//     a {
//         font-weight: bold;
//         color: #2c3e50;

//         &.router-link-exact-active {
//             color: #42b983;
//         }
//     }
// }
</style>
