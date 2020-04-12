module.exports = {
    devServer: {
        // These flags allow for the dev server to accept the requests routed through the reverse proxy
        disableHostCheck: true,
        watchOptions: {
            poll: true
        },
        progress: false,
    },
    css: {
        loaderOptions: {
            // pass options to sass-loader
            sass: {
                // Make the SCSS functions/mixins imported in main.scss available to all Vue components
                prependData: `@import "@/styling/global.scss";`
            },
        }
    }
}