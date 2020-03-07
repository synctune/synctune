module.exports = {
    devServer: {
        // These flags allow for the dev server to accept the requests routed through the reverse proxy
        disableHostCheck: true,
        watchOptions: {
            poll: true
        },
        // This flag stops the terminal from being flooding with build messages
        progress: false 
    },
    // Source: https://github.com/vuejs/vue-cli/issues/3603#issuecomment-483913563
    chainWebpack: config => {
        // remove vue-cli-service's progress output
        config.plugins.delete('progress');
        // optionally replace with another progress output plugin
        config.plugin('simple-progress-webpack-plugin').use(require.resolve('simple-progress-webpack-plugin'), [
            {
            format: 'minimal', // options are minimal, compact, expanded, verbose
            },
       ]);
    }
}