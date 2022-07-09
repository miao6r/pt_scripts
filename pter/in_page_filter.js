// ==UserScript==
// @name         Pter torrent filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://pterclub.com/torrents.php*
// @match        https://pterclub.com/music.php*
// @icon         https://pterclub.com/favicon.ico
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_log
// ==/UserScript==

(function() {
    'use strict';
    const sizeDownLimit = -1
    const sizeUpperLimit = -1
    const seederLimit = -1
    const notRunningTorrent = -1
    var torrentsBuffer = []
    function parseNumber(obj) {
       var regex = /[+-]?\d+(\.\d+)?/g;
       var text = obj
       if (typeof obj === "object") {
           text = $(obj).text()
       }
       return  parseInt(text.match(regex).map(function(v) { return parseInt(v); }));
    }
    function toReadableSize(sizeByte) {
       var s = sizeByte
        if(s<1024) {
              return s
           }
            s=s/1024
           if(s<1024) {
              return (s+"KB")
           }
             s=s/1024
            if(s<1024) {
              return (s+"MB")
           }
            s=s/1024
            if(s<1024) {
              return (s+"GB")
           }
            s=s/1024
            return (s+"TB")

    }
    function parseSize(obj) {
        var regex = /[+-]?\d+(\.\d+)?/g;
        var text = obj
       if (typeof obj === "object") {
           text = $(obj).text()
       }
        var floats = text.match(regex).map(function(v) { return parseFloat(v); });
        if(text.includes('K')) {
           return parseInt(floats*1024)
        }
        if(text.includes('M')) {
           return parseInt(floats*1024*1024)
        }
        if(text.includes('G')) {
           return parseInt(floats*1024*1024*1024)
        }
        if(text.includes('T')) {
           return parseInt(floats*1024*1024*1024*1024)
        }
       return parseInt(floats)
    }

    function restoreTorrents(){
         var torrentsTable = $('table#torrenttable>tbody')
        $.each(torrentsBuffer,function(idx,ele){
           torrentsTable.append(ele)
        })
        torrentsBuffer = []
        $('td#filteredTorrentCount').html(torrentsBuffer.length)
        GM_log('restored torrents')
    }

    function applyFilters(){
       var torrents = $('table#torrenttable>tbody>tr')
       var sizeMin = GM_getValue('sizeDownLimit', sizeDownLimit)
       var sizeMax = GM_getValue('sizeUpperLimit', sizeUpperLimit)
       var seederMax = GM_getValue('seederLimit', seederLimit)
       var notRunningTorrent = GM_getValue('notRunningTorrent', notRunningTorrent)
       if(sizeMin>-1){
          $('input#sizedownlimitinput').val(toReadableSize(sizeMin))
       }
        if(sizeMax>-1){
           $('input#sizeupperlimitinput').val(toReadableSize(sizeMax))
        }
        if(seederMax>-1) {
           $('input#seederlimitinput').val(seederMax)
        }
        if(notRunningTorrent>0) {
           $('input#notrunningtorrentinput').prop('checked', true);
        }else{
             $('input#notrunningtorrentinput').prop('checked', false);
        }
        torrents.each(function(idx) {
            if(idx==0) {
              return
            }
            var cols = $(this).find('>td')
            if (cols<7) {
               return
            }
            var tsize = parseSize(cols[4])
            var seeders = parseNumber(cols[5])
            if(sizeMin>-1 && tsize<sizeMin) {
                torrentsBuffer.push(this)
                $(this).remove()
                return
            }
           if(sizeMax>-1 && tsize>sizeMax) {
               torrentsBuffer.push(this)
                $(this).remove()
                return
            }
           if(seederMax>0 && seeders>seederMax) {
               torrentsBuffer.push(this)
                $(this).remove()
                return
            }
            var imgCompleted =  $(cols[1]).find(`img.progbargreen`)
            var imgRest =  $(cols[1]).find(`img.progbarrest`)
            if(notRunningTorrent==1 && (imgCompleted.length+imgRest.length>0)) {
               torrentsBuffer.push(this)
                $(this).remove()
                return
            }
        });
        $('td#filteredTorrentCount').html(torrentsBuffer.length)
    }


     function saveFilters() {
         GM_log($('input#sizedownlimitinput').val())
         GM_log($('input#sizeupperlimitinput').val())
         GM_log($('input#seederlimitinput').val())
         GM_log($('input#notrunningtorrentinput').val())
         GM_setValue('sizeDownLimit', parseSize($('input#sizedownlimitinput').val()))
         GM_setValue('sizeUpperLimit', parseSize($('input#sizeupperlimitinput').val()))
         GM_setValue('seederLimit', parseNumber($('input#seederlimitinput').val()))
         if($('input#notrunningtorrentinput').prop("checked")) {
           GM_setValue('notRunningTorrent', 1)
         } else {
           GM_setValue('notRunningTorrent', -1)
         }
         GM_log('filters saved')
         restoreTorrents()
         applyFilters()
     }

    function clearFilters() {
       GM_setValue('sizeDownLimit', -1)
       GM_setValue('sizeUpperLimit', -1)
       GM_setValue('seederLimit', -1)
       GM_setValue('notRunningTorrent', -1)
       GM_log('filters cleared')
       restoreTorrents()
    }

    function addSearchBox(){
        var torrents = $('table#torrenttable>tbody>tr')
        if (torrents.length <= 1) {
          setTimeout(function() {
              addSearchBox();
         }, 500);
            return
        }
        $('table.searchbox').append(`<tbody>
        <tr><td class="rowfollow" align="center">
        <table><tbody><tr>
       <td class="embedded">
                           <table>
                                <tbody><tr>
                                    <td class="embedded">种子大小:&nbsp;&nbsp;</td>
                                    <td class="embedded">
                                        <input id="sizedownlimitinput" name="sizedownlimitinput" type="text" value="0.0" autocomplete="off" style="width: 80px">
                                    </td>
                                    <td class="embedded">
                                    &nbsp&nbsp;to&nbsp;
                                    </td>
                                    <td class="embedded">
                                        <input id="sizeupperlimitinput" name="sizeupperlimitinput" type="text" value="1.0GB" autocomplete="off" style="width: 80px">
                                    </td>
                                    <td class="embedded">
                                    &nbsp;&nbsp&nbsp; &nbsp&nbsp;
                                    </td>
                                </tr>
                            </tbody>
                            </table>
        </td>
       <td class="embedded">
                           <table>
                                <tbody><tr>
                                    <td class="embedded">做种人数小于:&nbsp;&nbsp;</td>
                                    <td class="embedded">
                                        <input id="seederlimitinput" name="seederlimitinput" type="text" value="5" autocomplete="off" style="width: 40px">
                                    </td>
                                </tr>
                            </tbody>
                            </table>
        </td>
       <td class="embedded">
                           <table>
                                <tbody><tr>
                                    <td class="embedded"> &nbsp&nbsp; &nbsp&nbsp; &nbsp&nbsp;未下载或做种:&nbsp;&nbsp;</td>
                                    <td class="embedded"><input type="checkbox" id="notrunningtorrentinput" value="false"></td>
                                </tr>
                            </tbody>
                            </table>
        </td>
       <td class="embedded">
                           <table>
                                <tbody><tr>
                                    <td class="embedded"> &nbsp&nbsp; &nbsp&nbsp; &nbsp&nbsp;当前已过滤:&nbsp;&nbsp;</td>
                                    <td id="filteredTorrentCount" class="embedded">0</td>
                                    <td class="embedded"> &nbsp&nbsp; &nbsp&nbsp;</td>
                                    <td class="rowfollow" align="center">
               <input id="saveFiltersBtn" type="button" class="btn" value="保存">
            </td>
                                </tr>
                            </tbody>
                            </table>
        </td>
                    </tr>
                 </tbody></table>
            </td>
             <td class="rowfollow" align="center">
              <input id="clearFiltersBtn" type="button" class="btn" value="清除">
            </td>
        </tr>

    </tbody>`)
        $('input#saveFiltersBtn').click(saveFilters)
         $('input#clearFiltersBtn').click(clearFilters)
      applyFilters()
    }
    $(document).ready(function () {
        GM_log('hello');
        addSearchBox()
    })
})();
