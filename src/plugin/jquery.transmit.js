/**
 * jQuery Transmit plugin (http://code.google.com/p/jquery-transmit)
 *
 * Copyright (c) 2008 Carl Sziebert, Paul Gregoire
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;(function($) {

    $.transmit = {
        defaults: {
            allowedDomain: "localhost",
            swfId: "uploader",
            swfUrl: "uploader.swf"
        },
        files: {},
        isUploading: false,
        numFiles: 0,
        swf: null
    };
    
    /* ----- API functions ----- */

    $.fn.extend({
    
        transmit: function(uploadUrl, settings) {
            var containerId = $(this).attr("id");
            settings = $.extend({}, $.transmit.defaults, settings);
            var attributes = {
                id: settings.swfId,
                data: settings.swfUrl,
                width: "550",
                height: "400"
            };
            var params = {
                allowscriptaccess: "always",
                allowedDomain: settings.allowedDomain,
                flashvars:"elementId=" + containerId + "&eventHandler=$.fn.eventDispatcher"
            };
            $.transmit.swf = swfobject.createSWF(attributes, params, containerId);
            if ($.transmit.swf) {
                $.transmit.swf.owner = this;
            }
            return this.each(function() {
                $.data(this, "transmit", settings);
            });
        },
        
        browse: function() {
            $.transmit.swf.browse(false);
        },
        
        upload: function() {
            $.transmit.isUploading = true;
            var params = {};
            $.transmit.swf.upload(params);
            $("#upload-table div.header div.status").html("");
            var rows = $('#file-list').find('li').get();
            $.each(rows, function(index, row) {
                if (!$(row).is('.hidden')) {
                    $(row).find("div.status").html("");
                }
            });
            $('#uploadBtn').attr('disabled', 'disabled').attr('value', 'Uploading...');
            $('#upload-add-more').hide();
        },
        
        cancel: function(fileId) {
            $.transmit.swf.cancel(fileId);
        },
        
        clearFileList: function() {
            $.transmit.isUploading = false;
            $.transmit.swf.clearFileList();
            $.transmit.fileCount = 0;
            $("div.step1").removeClass("hidden");
            $("div.step2").addClass("hidden");
        },
        
        removeFile: function(fileId) {
            if ($.transmit.files[fileId]) {
                $.transmit.swf.removeFile(fileId);
                $('#'+fileId).remove();
                delete $.transmit.files[fileId];
                $.transmit.numFiles--;
                if ($.transmit.numFiles > 0) {
                    renderFileTotals();
                } else if ($.transmit.isUploading) {
                    $("div.step3").removeClass("hidden");
                    $("div.step2").addClass("hidden");
                } else {
                    $.fn.clearFileList();
                }
            }
        },
        
        eventDispatcher: function(elementId, event) {
            switch(event.type) {
                case "swfReady":
                    onSwfReady(event);
                    break;
                case "fileSelect":
                    onFileSelect(event);
                    break;
                case "uploadStart":
                    onUploadStart(event);
                    break;
                case "uploadProgress":
                    onUploadProgress(event);
                    break;
                case "uploadCancel":
                    onUploadCancel(event);
                    break;
                case "uploadComplete":
                    onUploadComplete(event);
                    break;
                case "uploadCompleteData":
                    onUploadCompleteData(event);
                    break;
                case "uploadError":
                    onUploadError(event);
                    break;
            }
        }
    });
    
    /* ----- Event handlers ----- */
        
    function onSwfReady(event) {
        $("a.upload-add-files, a.upload-add-more").click(function() {
            $.fn.browse();
        });
        $('#uploadBtn').attr('disabled', '').click(function() {
            $.fn.upload();
        });
    }
    
    function onFileSelect(event) {
        $.each(event.fileList, function(id, file) {
            $.transmit.files[id] = file;
            $.transmit.numFiles++;
        });
        renderFileList();
    }
    
    function onUploadStart(event) {
        // Do nothing...
    }

    function onUploadProgress(event) {
        var percent = Math.round((event.bytesLoaded / event.bytesTotal * 100));
        $("#" + event.id).find("div.status").html(percent + "%");
    }

    function onUploadCancel(event) {
        // Do nothing...
    }

    function onUploadComplete(event) {
        var elem = $("#" + event.id);
        elem.find("div").addClass("disabled");
        elem.find("div.status").empty().html("<span class='complete'>&nbsp;</span>");
    }

    function onUploadCompleteData(event) {
        //uploader.removeFile(event.id);
    }

    function onUploadError(event) {
        $("#" + event.id).find("div.status").empty().html("<span class='error'>&nbsp;</span>");
    }
    
    /* ----- Utility functions ----- */
    
    function parseAllowedDomain(uploadUrl) {
        
    }
    
    function renderFileList() {
        resetFileList();
        var rows = new Array();
        $.each($.transmit.files, function(id, file) {
            var row = $("#row-template").clone().attr("id", id).removeClass("hidden");
            row.find("div.name").html(file.name);
            row.find("div.size").html(formatFileSize(file.size));
            row.find("a.remove").attr("title", "Remove " + file.name + "?").click(function() {
                $.fn.removeFile(id);
            });
            rows.push(row);
        });
        sortFileList(rows);
        $.each(rows, function(index, row) {
            row.insertBefore("#row-template");
        });
        $("div.step1").addClass("hidden");
        $("div.step2").removeClass("hidden");
        renderFileTotals();
    }
    
    function resetFileList() {
        var rows = $('#file-list').find('li').get();
        $.each(rows, function(index, row) {
            if (!$(row).is('.hidden')) {
                $(row).remove();
            }
        });
    }
    
    function renderFileTotals() {
        $.transmit.numFiles = 0;
        var totalSize = 0;
        $.each($.transmit.files, function(id, file) {
            totalSize += file.size;
            $.transmit.numFiles++;
        });
        $("#upload-file-count").html($.transmit.numFiles + " Files");
        $("#upload-total-bytes").html("Total: " + formatFileSize(totalSize));
    }
    
    function formatFileSize(fileSize) {
        var suffix = "KB";
        var size = new Number(fileSize);
        if (size >= 1073741824) {
            size = size / 1073741824;
            suffix = "GB";
        } else if (size >= 1048576) {
            size = size / 1048576;
            suffix = "MB";
        } else {
            size = size / 1024;
        }
        return size.toFixed(2).toString() + " " + suffix;
    }
    
    function sortFileList(rows) {
        rows.sort(function(a, b) {
            var nameA = $(a).children('div.name').text().toLowerCase();
            var nameB = $(b).children('div.name').text().toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
    }
    
})(jQuery);