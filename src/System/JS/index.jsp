<html>
    <head>
        <title>Dashboard</title>
        <link rel="stylesheet" href="css/bootstrap.css">
        <link rel="stylesheet" href="css/styles.css">
        <script>
                if(!window.DashboardGlobals) window.DashboardGlobals = {};
                window.DashboardGlobals.dir_data = ${json};
                window.DashboardGlobals.resourceLoader = "${pageContext.request.contextPath}/serviceLoad.html";
                window.DashboardGlobals.updateService = "${pageContext.request.contextPath}/jsonData.html";
                window.DashboardGlobals.chartingService = "${pageContext.request.contextPath}/chartLoader.html";
        </script>
        <script src="js/lib/jquery.js"></script>
        <script src="js/lib/bootstrap.js"></script>
        <script src="js/lib/underscore.js"></script>
        <script src="js/lib/backbone.js"></script>
        <script src="js/lib/d3.js" charset="utf-8"></script>
        <!--  plugins  -->
        <script src="js/plugins/jquery.filetree.js"></script>
        <script src="js/plugins/slidebars.js"></script>
        <script src="js/lib/moment.js"></script>
        <script src="js/plugins/daterangepicker.js"></script>
        <script src="js/plugins/select2.js"></script>
        <!-- end of plugins -->
        <script src="js/dashboard.js"></script>
        <script src="js/main.js"></script>
    </head>
    <body class="has-navbar">
        <div id="loading-panel" class="modal fade">
            <div   class="modal-dialog">
                <div  class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title"><b>Updating</b><span class="glyphicon glyphicon-repeat rotate pull-right"></span></h4>
                    </div>
                    <div class="modal-body">
                        <p><b>Please wait while dashboard is being updated.</b></p>
                        <p class="">Pending requests: <span id="request-count">0</span></p>
                    </div>
                    <div class="modal-footer">
                        <p class="pull-left text-danger">Time elapsed: <span id="elpased_time">0:00</span></p>
                        <input type="button" id="cancel_all_requests" class="btn btn-danger" data-dismiss="modal" value="Cancel">
                    </div>
                </div>
            </div>
        </div>
        <div id="error-panel" class="modal fade">
            <div   class="modal-dialog">
                <div  class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title text-danger"><b>ERROR OCCURED</b></h4>
                    </div>
                    <div class="modal-body">
                        <p><b>An Error Occurred</b></p>
                        <p class="text-danger"><span id="error-generated"></span></p>
                    </div>
                    <div class="modal-footer">
                        <input type="button" class="btn btn-warning" value="OK" data-dismiss="modal">
                    </div>
                </div>
            </div>
        </div>
        <div class="navbar navbar-default navbar-fixed-top sb-slide" role="navigation">
         <div class="sb-toggle-left navbar-left">
                <div class="navicon-line"></div>
                <div class="navicon-line"></div>
                <div class="navicon-line"></div>
          </div> 
          <div class="container-fluid">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="#">Project name</a>
            </div>
            <div class="navbar-collapse collapse">
              <ul class="nav navbar-nav navbar-right">
                <li><a href="#">Settings</a></li>
                <li><a href="#">Help</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="container-fluid" id="sb-site">
            <div class="container main" id="main">   
                
            </div>
        </div>
        <div class="sb-slidebar sb-left sb-style-push">
            <div class="sidebar">
                <div id="filetree" class="filetree-container"></div>
                <div id="files" class="filetree-container"></div>
            </div>
        </div>

    </body>
</html>
