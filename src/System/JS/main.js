/* global $, dir_data, ajax_url,resourceLoader,alert, window */
$(function(){
    $('#filetree').fileTree({
        json : window.DashboardGlobals.dir_data,
        files: {
            hidden : true,
            element: '#files',
            event: function(elem){
                
                window.DashboardGlobals.folderpath = elem.data('path');

                if (elem.data('type') === 'file'){
                    window.DashboardGlobals.folderpath = window.DashboardGlobals.folderpath.replace(elem.data('name'), '').replace(/[\/\\]*$/g, '');
                }
                
                var xhr = $.post(
                    window.DashboardGlobals.resourceLoader,
                    { 
                        dir : window.DashboardGlobals.folderpath, 
                        file: elem.data('name') 
                    }
                );
                
                xhr.identifier = "serviceLoader"
                
                xhr.done(
                    function(data){
                        $('#main').html('').append(data);
                    }
                )
            }
        }
    });
    
    var menu = new $.slidebars({ siteClose: true });
    
    window.DashboardGlobals.URLparameters = {};
    resolveURLParams();
    
    if (window.DashboardGlobals.URLparameters.dir && window.DashboardGlobals.URLparameters.file){
        window.DashboardGlobals.folderpath = window.DashboardGlobals.URLparameters.dir;
        $.post(window.DashboardGlobals.resourceLoader,
               { 
                   dir : window.DashboardGlobals.URLparameters.dir, 
                   file: window.DashboardGlobals.URLparameters.file 
               })
        .done(function(data){
            $('#main').html(data);
            $('.navbar').hide();
            $('body').removeClass('has-navbar');
            
            if(window.DashboardGlobals.URLparameters.db && window[window.DashboardGlobals.URLparameters.db]){
                var dashboard = window[window.DashboardGlobals.URLparameters.db];
                
                var params = window.DashboardGlobals.URLparameters;
                
                for(var key in params){
                    if ( ['dir','file', 'db'].indexOf(key) >= 0) continue;
                    
                    dashboard.setVariable(key, params[key]);
                }
            }
            
        }).always(function(){
            //menu.toggle('left');
        });
    } else {
        menu.open('left');
    }
    
    function resolveURLParams(){
        
        var req = window.location.search.substring(1); 
        
        if (req === "") return false;
        
        var params = req.split('&');
        
        for (var i = 0; i < params.length; i++){
            var param = params[i].split('=');
            if(!window.DashboardGlobals.URLparameters[param[0]]){
                param[1] = decodeURIComponent(param[1]);
                if(param[1].indexOf(',') > -1 ) param[1] = param[1].split(',');
                window.DashboardGlobals.URLparameters[param[0]] = param[1];
            } else {
                if (!$.isArray(window.DashboardGlobals.URLparameters[param[0]])){
                    window.DashboardGlobals.URLparameters[param[0]] = window.DashboardGlobals.URLparameters[param[0]].split('');
                }
                window.DashboardGlobals.URLparameters[param[0]].push(param[1]);
            }
        }
        return true;
    }
    
});
