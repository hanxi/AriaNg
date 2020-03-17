(function () {
    'use strict';

    angular.module('ariaNg').factory('pluginMusicService', ['$http', 'pluginMusicConstants', 'musicDefaultOptions', 'aria2TaskService', 'ariaNgStorageService', function ($http, pluginMusicConstants, musicDefaultOptions, aria2TaskService, ariaNgStorageService) {
        var setOptions = function (options) {
            return ariaNgStorageService.set(pluginMusicConstants.configStorageKey, options);
        };

        var getOptions = function () {
            var options = ariaNgStorageService.get(pluginMusicConstants.configStorageKey);

            if (!options) {
                options = angular.extend({}, musicDefaultOptions);
                setOptions(options);
            }
            return options;
        };

        var qqDownload = function (item, callback) {
            var options = getOptions();
            var qqMusicApi = options.qqMusicApi;
            var type = "320";
            // download file type order
            var typeOrders = ["320", "128", "m4a", "ape", "flac", "ogg"];
            for (var i = 0; i < typeOrders.length; i++) {
                var _type = typeOrders[i];
                if (item[_type]) {
                    type = _type;
                    break;
                }
            }
            var suffixs = {
                "128": ".mp3",
                "320": ".mp3",
                "m4a": ".m4a",
                "ape": ".ape",
                "flac": ".flac",
                "ogg": ".ogg"
            };
            var suffix = suffixs[type];
            let saveFileName = item.songName + '-' + item.singerName + suffix;
            let downloadDir = options.downloadDir;
            console.log(downloadDir);
            var url = qqMusicApi + '/song/url?id=' + item.id + '&type=' + type + '&mediaId=' + item.mediaId;
            $http.get(url).then(function onSuccess(response) {
                let downloadUrl = response.data.data;
                if (downloadUrl && downloadUrl.length > 0) {
                    var task = {
                        urls: [downloadUrl],
                        options: {
                            dir: options.downloadDir,
                            out: saveFileName,
                        },
                    };
                    aria2TaskService.newUriTask(task, false, function (response) {
                        if (!response.hasSuccess && !response.success) {
                            return;
                        }
                        console.log("downloading... " + saveFileName + " from " + downloadUrl);
                        callback(response);
                    });
                }
            },function onError(response) {
                console.log("can't get download url",response);
            });
              
        };

        var qqSearch = function (context) {
            var options = getOptions();
            var qqMusicApi = options.qqMusicApi;
            var pageNo = context.searchPageNo;
            var url = qqMusicApi + '/search?key=' + context.searchText + '&pageNo=' + pageNo;
            $http.get(url).then(function onSuccess(response) {
                if (context.onSearchSuccessCallback) {
                    var data = response.data.data;
                    if (data.list.length <= 0) {
                        if (context.onSearchErrorCallback) {
                            context.onSearchErrorCallback(response);
                        }
                        return;
                    }

                    var typeKeys = {
                        "size128": "128",
                        "size320": "320",
                        "sizem4a": "m4a",
                        "sizeape": "ape",
                        "sizeflac": "flac",
                        "sizeogg": "ogg"
                    };
                    var list = [];
                    for (var i = 0; i < data.list.length; i++) {
                        var item = data.list[i];
                        var types = [];
                        for (var key in typeKeys) {
                            if (item[key] && item[key] > 0) {
                                types.push(typeKeys[key]);
                            }
                        }

                        var singerName = "";
                        if (item.singer.length > 0) {
                            singerName = item.singer[0].name;
                        }
                        list.push({
                            id: item.songmid,
                            mediaId: item.strMediaMid,
                            types: types,
                            songName: item.songname,
                            singerName: singerName
                        });
                    }

                    var totalPage = Math.floor(data.total/data.pageSize);
                    var result = {
                        list: list,
                        totalPage: totalPage
                    };
                    context.onSearchSuccessCallback(result);
                }
            },function onError(response) {
                if (context.onSearchErrorCallback) {
                    context.onSearchErrorCallback(response);
                }
            });
        };

        var miguDownload = function (item, callback) {
            var options = getOptions();
            var miguMusicApi = options.miguMusicApi;
            let saveFileName = item.songName + '-' + item.singerName;
            let downloadDir = options.downloadDir;
            console.log(downloadDir);
            var url = miguMusicApi + '/song/url?id=' + item.id + '&cid=' + item.cid;
            $http.get(url).then(function onSuccess(response) {
                let songData = response.data.data;
                // download file type order
                let type = "320k";
                var typeOrders = ["320k", "128k", "m4a", "ape", "flac", "ogg"];
                for (var i = 0; i < typeOrders.length; i++) {
                    var _type = typeOrders[i];
                    if (songData[_type] && songData[_type].length > 0) {
                        type = _type;
                        break;
                    }
                }
                var suffixs = {
                    "128k": ".mp3",
                    "320k": ".mp3",
                    "m4a": ".m4a",
                    "ape": ".ape",
                    "flac": ".flac",
                    "ogg": ".ogg"
                };
                var suffix = suffixs[type];
                saveFileName += suffix;
                let downloadUrl = songData[type];
                if (downloadUrl && downloadUrl.length > 0) {
                    var task = {
                        urls: [downloadUrl],
                        options: {
                            dir: options.downloadDir,
                            out: saveFileName,
                        },
                    };
                    aria2TaskService.newUriTask(task, false, function (response) {
                        if (!response.hasSuccess && !response.success) {
                            return;
                        }
                        console.log("downloading... " + saveFileName + " from " + downloadUrl);
                        callback(response);
                    });
                }
            },function onError(response) {
                console.log("can't get download url",response);
            });
              
        };
        var miguSearch = function (context) {
            var options = getOptions();
            var miguMusicApi = options.miguMusicApi;
            var pageNo = context.searchPageNo;
            var url = miguMusicApi + '/search?keyword=' + context.searchText + '&pageNo=' + pageNo;
            $http.get(url).then(function onSuccess(response) {
                if (context.onSearchSuccessCallback) {
                    var data = response.data.data;
                    if (data.list.length <= 0) {
                        if (context.onSearchErrorCallback) {
                            context.onSearchErrorCallback(response);
                        }
                        return;
                    }
                    
                    var list = [];
                    for (var i = 0; i < data.list.length; i++) {
                        var item = data.list[i];
                        var singerName = "";
                        if (item.artists.length > 0) {
                            singerName = item.artists[0].name;
                        }
                        list.push({
                            id: item.id,
                            cid: item.cid,
                            songName: item.name,
                            singerName: singerName
                        });
                    }
                    var result = {
                        list: list,
                        totalPage: data.total
                    };
                    context.onSearchSuccessCallback(result);
                }
            },function onError(response) {
                if (context.onSearchErrorCallback) {
                    context.onSearchErrorCallback(response);
                }
            });
        };

        return {
            search: function (context) {
                var options = getOptions();
                if (options.apiType == 'qq') {
                    qqSearch(context);
                } else {
                    miguSearch(context);
                }
            },
            setOptions: setOptions,
            getOptions: getOptions,
            download: function (item, callback) {
                var options = getOptions();
                if (options.apiType == 'qq') {
                    qqDownload(item, callback);
                } else {
                    miguDownload(item, callback);
                }
            }
        };
    }]);
}());
 
