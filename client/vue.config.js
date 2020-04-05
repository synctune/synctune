module.exports = {
    devServer: {
        // These flags allow for the dev server to accept the requests routed through the reverse proxy
        disableHostCheck: true,
        watchOptions: {
            poll: true
        },
        progress: false 
    },
    // Source: https://github.com/vuejs/vue-cli/issues/3603#issuecomment-483913563
    chainWebpack: config => {
        // remove vue-cli-service's progress output
        // TODO: put back in
        // config.plugins.delete('progress');
        // // optionally replace with another progress output plugin
        // config.plugin('simple-progress-webpack-plugin').use(require.resolve('simple-progress-webpack-plugin'), [
        //     {
        //     format: 'minimal', // options are minimal, compact, expanded, verbose
        //     },
        // ]);
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