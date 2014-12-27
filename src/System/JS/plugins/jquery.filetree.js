/*global define, alert, jQuery, window, document */
;(function($, window, document, undefined) {

    $.fn.fileTree = function(options) {

        var defaults = {
            json: '', //JSON data,
            animationSpeed: 400,
            folders: {
                trigger: 'click',
                open: {
                    class: 'expanded',
                    event: function(e) {}
                },
                close: {
                    class: 'collapsed',
                    event: function(e) {}
                },
                event: function(e) {}
            },
            files: {
                hidden: false,
                trigger: 'click',
                event: function(e) {},
                element: false
            }
        };

        var settings = $.extend(true, {}, defaults, options);

        return this.each(function() {
            var elem = $(this);
            createTree(elem, settings.json, settings);
            addListeners(elem, settings);
        });

        function createTree(elem, obj, options) {

            //temporay containers for file and folders
            var temp_files = [],
                temp_folders = [];

            //separting files and folders
            for (var i = 0; i < obj.length; i++) {
                var file = obj[i];
                if (file.type == 'folder') {
                    temp_folders.push(file);
                } else if (file.type == 'file') {
                    temp_files.push(file);
                }
            }

            //Sort folders and files by names
            temp_files.sort(nameSort);
            temp_folders.sort(nameSort);

            //merge folders and then files
            obj = temp_folders.concat(temp_files);

            var ul = $('<ul class="filetree"></ul>');

            for (var j = 0; j < obj.length; j++) {
                var fs = obj[j],
                    li = $('<li></li>').addClass('filetree-' + fs.type),
                    a;
                if(fs.type === 'file'){
                    a = $('<a></a>').attr('href', '#').html(fs.title).attr('title', fs.description)
                        .addClass('sb-disable-close');
                } else if (fs.type === 'folder'){
                    a = $('<a></a>').attr('href', '#').html(fs.name).attr('title', fs.description)
                        .addClass('sb-disable-close');
                }

                for (var key in fs) {
                    if (key !== 'children') a.data(key, fs[key]);
                }

                li.append(a);
                ul.append(li);

                if (options.files.hidden && fs.type == 'file') {
                    li.css('display', 'none');
                }

                if (fs.type == 'folder' && fs.children !== undefined && fs.children.length > 0) {
                    li.addClass(options.folders.close.class);

                    if (options.files.hidden){

                        var subfolders = $.grep(fs.children,
                                                function(e,i){
                                                        return e.type === 'folder';
                                                    }
                                               );

                        if (subfolders.length > 0) li.prepend('<span class="arrow"></span>');

                    } else li.prepend('<span class="arrow"></span>');

                    createTree(li, fs.children, options);
                }
            }

            elem.append(ul);
        }

        function addListeners(elem, options) {
            elem.on(options.folders.trigger, 'li.filetree-folder > a', function(event) {
                var e = $(this);

                elem.find('li.selected').removeClass('selected');
                e.closest('li').addClass('selected');

                if (options.files.hidden && options.files.element) {
                    var files = e.closest('li').children('ul').children('li.filetree-file').clone(true);
                    var node = $(options.files.element);

                    if (files.length < 1){
                        node.html('<p class="empty-folder">&lt;empty folder&gt;</p>');
                    } else {
                        var ul = $('<ul class="filelist"></ul>');
                        ul.append(files).find('li').removeAttr('style');
                        node.html('').append(ul);
                    }
                }

                options.folders.event(e);
                return false;
            });

            elem.on('click', 'li.filetree-folder > span.arrow', function() {
                //alert('123');
                var arrow = $(this),
                    open = options.folders.open.class,
                    close = options.folders.close.class;
                if (arrow.closest('li').hasClass(close)) {
                    //Expand
                    arrow.siblings('ul').stop().slideDown(options.animationSpeed, function() {
                        options.folders.open.event(elem);
                    });
                    arrow.closest('li').removeClass(close).addClass(open);
                } else if (arrow.closest('li').hasClass(open)) {
                    //Collapse
                    arrow.siblings('ul').stop().slideUp(options.animationSpeed, function() {
                        options.folders.close.event(elem);
                    });
                    arrow.closest('li').removeClass(open).addClass(close);
                }
                return false;
            });

            elem.on('click', 'li.filetree-file > a', function(event) {
                elem.find('li.selected').removeClass('selected');
                $(this).closest('li').addClass('selected');
                options.files.event($(this));
                alert('file clicked');
                return false;
            });

            if (options.files.hidden && options.files.element) {
                //console.log(typeof options.files.element);
                var f = $(options.files.element);
                //console.log(f.find('li.filelist-file > a'));
                f.on('click', 'li.filetree-file > a', function() {
                    f.find('li.selected').removeClass('selected');
                    $(this).closest('li').addClass('selected');
                    options.files.event($(this));
                    return false;
                });
            }

        }

        function nameSort(a, b) {
            if (a.name.toLowerCase() < b.name.toLowerCase())
                return -1;
            else if (a.name.toLowerCase() > b.name.toLowerCase())
                return 1;
            return 0;
        }
    };

})(jQuery, window, document);
