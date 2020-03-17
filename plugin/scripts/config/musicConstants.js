(function () {
    'use strict';

    angular.module('ariaNg').constant('pluginMusicConstants', {
        configStorageKey: 'Music',
        apiTypes: {
            'qq': {name: "QQ Music", id: 'qq'}, 
            'migu': {name: "MiGu Music", id: 'migu'}
        }
    }).constant('musicDefaultOptions', {
        qqMusicApi: 'http://home.hanxi.info:2000/qq',
        miguMusicApi: 'http://home.hanxi.info:2000/migu',
        apiType: 'qq',
        downloadDir: '/music',
        lastSearchText: ''
    });
}());
