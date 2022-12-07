// ==UserScript==
// @name         qBittorrentShowSize
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  display size of selected, filtered, total torrents in the footer
// @author       You
// @match        https://192.168.10.63:82*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=10.80
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_log
// ==/UserScript==
(function() {
    'use strict';
     var totalSize = 0;
     var totalRows = 0;
     var filteredSize = 0;
     var filteredRows =0;
     var selectedSize = 0;
     var selectedRows = 0;
    // Your code here...
     function toReabledSize(size, num) {
         var rsize = size
         rsize = rsize / 1024
         if(rsize < 1000) {
            return rsize.toFixed(2)+"KiB(" + num + ")";
         }
         rsize = rsize / 1024
         if(rsize < 1000) {
            return rsize.toFixed(2)+"MiB(" + num + ")";
         }
         rsize = rsize / 1024
         if(rsize < 1000) {
            return rsize.toFixed(2)+"GiB(" + num + ")";
         }
         rsize = rsize / 1024
         if(rsize < 1000) {
            return rsize.toFixed(2)+"TiB(" + num + ")";
         }
         rsize = rsize / 1024
         return rsize.toFixed(2)+"PiB(" + num + ")";

     }
     function calcTotalSize() {
         try {
             if (torrentsTable.rows.getLength() != totalRows) {
                 totalSize = 0
                 $.each(torrentsTable.rows, function(hash, data) {
                     if (typeof data.full_data !== 'undefined') {
                         totalSize += data.full_data.total_size
                     }
                 });
                 totalRows = torrentsTable.rows.getLength()
                 $('td#totalSize').html(toReabledSize(totalSize,totalRows))
             }

             if (torrentsTable.selectedRows.length != selectedRows) {
                 selectedSize = 0
                 $.each(torrentsTable.selectedRows, function(index, hash) {
                     var data =  torrentsTable.rows[hash]
                     if (typeof data !== 'undefined' && typeof data.full_data !== 'undefined') {
                         selectedSize += data.full_data.total_size
                     }
                 });
                 selectedRows = torrentsTable.selectedRows.length
                 $('td#selectedSize').html(toReabledSize(selectedSize, selectedRows))
             }
         } catch (error) {
         }
         try {
             if (torrentsTable.getFilteredAndSortedRows().length != filteredRows) {
                 filteredSize = 0
                 $.each(torrentsTable.getFilteredAndSortedRows(), function(hash, data) {
                     if (typeof data.full_data !== 'undefined') {
                         filteredSize += data.full_data.total_size
                     }
                 });
                 filteredRows = torrentsTable.getFilteredAndSortedRows().length
                 $('td#filteredSize').html(toReabledSize(filteredSize, filteredRows))
             }
         } catch (error) {
         }
         setTimeout(function() {
              calcTotalSize();
         }, 10000);
     }


    function calcFilteredSize() {
         try {
             if (torrentsTable.getFilteredAndSortedRows().length != filteredRows) {
                 filteredSize = 0
                 $.each(torrentsTable.getFilteredAndSortedRows(), function(hash, data) {
                     if (typeof data.full_data !== 'undefined') {
                         filteredSize += data.full_data.total_size
                     }
                 });
                 filteredRows = torrentsTable.getFilteredAndSortedRows().length
                 $('td#filteredSize').html(toReabledSize(filteredSize,filteredRows))
             }
         } catch (error) {
         }
         setTimeout(function() {
              calcFilteredSize();
         }, 3000);
     }


    function calcSelectedSize() {
         try {
             selectedRows = torrentsTable.selectedRows.length
             if (torrentsTable.selectedRows.length >0) {
                 selectedSize = 0
                 $.each(torrentsTable.selectedRows, function(index, hash) {
                     var data =  torrentsTable.rows[hash]
                     if (typeof data !== 'undefined' && typeof data.full_data !== 'undefined') {
                         selectedSize += data.full_data.total_size
                     }
                 });
                 $('td#selectedSize').html(toReabledSize(selectedSize, selectedRows))
             }
         } catch (error) {
         }
         setTimeout(function() {
              calcSelectedSize();
         }, 1000);
     }


     function addSizeBanner() {
        $('div#desktopFooter tr').prepend('<td id="selectedSizeLabel">Size: </td><td id="selectedSize">--</td><td id="filteredSizeLabel"> </td><td id="filteredSize">--</td><td id="filteredSizeLabel"> </td><td id="totalSize">--</td><td class="statusBarSeparator"></td>')
        calcTotalSize();
        calcSelectedSize();
        calcFilteredSize();
    }

    $(document).ready(function () {
        if ($(document).attr('title').includes('qBittorrent')){
            addSizeBanner();
        }

    })
})();
