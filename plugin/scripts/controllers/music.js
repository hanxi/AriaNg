(function () {
    'use strict';

    angular.module('ariaNg').controller('PluginMusicController', ['$rootScope', '$scope', '$timeout', 'pluginMusicConstants', 'pluginMusicService', function ($rootScope, $scope, $timeout, pluginMusicConstants, pluginMusicService) {

        $scope.context = {
            currentTab: 'main',
            searchResultList: [],
            searchPageNo: 0,
            searchTotalPage: 0,
            apiTypes: pluginMusicConstants.apiTypes,
            isLoadMoreHide: true
        };

        var doCheckLoadMoreHide = function () {
            if ($scope.context.searchResultList.length <= 0) {
                console.log("fuck1");
                $scope.context.isLoadMoreHide = true;
                return
            }
            if ($scope.context.searchPageNo >= $scope.context.searchTotalPage) {
                console.log("fuck2");
                $scope.context.isLoadMoreHide = true;
                return;
            }
            $scope.context.isLoadMoreHide = false;
        }

        $scope.context.onSearchSuccessCallback = function (result) {
            console.log(result);
            for (var i=0; i<result.list.length; i++) {
                $scope.context.searchResultList.push(result.list[i]);
            }
            $scope.context.searchTotalPage = result.totalPage;
            doCheckLoadMoreHide();
        }

        $scope.context.onSearchErrorCallback = function (result) {
            console.log(result);
        }

        $scope.changeMainTab = function () {
            $scope.context.currentTab = 'main';
        };

        $scope.isMainTab = function () {
            return $scope.context.currentTab === 'main';
        };

        $scope.changeConfigTab = function () {
            $scope.context.currentTab = 'config';
        };

        $scope.isConfigTab = function () {
            return $scope.context.currentTab === 'config';
        };

        $scope.updateSearch = function () {
            if (!$scope.context.searchText) {
                return;
            }
            var searchText = $scope.context.searchText;
            console.log(searchText);
            $scope.context.searchPageNo = 1;
            $scope.context.searchTotalPage = 0;
            $scope.context.searchResultList = [];
            pluginMusicService.search($scope.context);

            $scope.setting.lastSearchText = searchText;
            pluginMusicService.setOptions($scope.setting);
        }

        $scope.downloadOne = function (index) {
            var item = $scope.context.searchResultList[index];
            pluginMusicService.download(item);
        }

        $scope.downloadAll = function () {
            var list = $scope.context.searchResultList;
            var i = 0;

            doNextDownload();
            function doNextDownload() {
                if (i >= list.length) {
                    console.log("end download");
                    return;
                }

                console.log("will second to download " + i);
                let item = list[i];
                $timeout(function() {
                    pluginMusicService.download(item, function () {
                        console.log("do second to download " + i);
                        doNextDownload();
                    });
                }, 1000);

                i++;
            };
        }

        var options = pluginMusicService.getOptions();
        $scope.context.searchText = options.lastSearchText;
        $scope.setting = options;
        $scope.saveSetting = function () {
            console.log($scope.setting);
            pluginMusicService.setOptions($scope.setting);
        }

        var apiType = options.apiType;
        $scope.context.apiTypeObj = pluginMusicConstants.apiTypes[apiType];
        $scope.saveApiType = function () {
            $scope.setting.apiType = $scope.context.apiTypeObj.id;
            $scope.saveSetting();
        }

        $scope.loadMore = function() {
            console.log("loadMore");
            $scope.context.searchPageNo += 1;
            pluginMusicService.search($scope.context);
        }
    }]);
}());
