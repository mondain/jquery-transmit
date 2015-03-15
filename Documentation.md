# Introduction #

Welcome! Transmit (jquery-transmit) is a sophisticated jQuery plugin providing an elegant multi-file upload utility. At the core of the plugin is a small SWF file which provides single or multiple file selection and upload services.

# Quick Start #

Getting started with the plugin couldn't be easier:

```
           $(document).ready(function() {
                $("#transmit").transmit("http://mysite.com/upload/");
            });
```

For a complete explanation of the plugin usage, see the **Usage** section below.

# Dependencies #

#### External ####

See the links on the project [home page](http://code.google.com/p/jquery-transmit/) for the complete list of external dependencies.

#### Internal ####

Internal requirements include the CSS file jquery.transmit.css and the HTML file jquery.transmit.html.  The HTML contents are marked with comments for the essential DOM elements.  To use the HTML within a php, jsp or asp page, simply copy and paste the required elements, include the stylesheet and the plugin and you're good to go.

# Usage #

The `$('#transmit').transmit()` function takes 2 arguments, with only the first being required.

##### Arguments #####
  * **uploadUrl**: The URL used to handle the uploaded files.
  * **options**: (OPTIONAL) User defined set of options which overrides the defaults provided.  See the **Options** section below for a detailed explanation of each configurable option.

Transmit provides several useful options for customizing your upload experience.  These options are outlined below.

#### Options ####
  * **allowedDomain**: One or more strings that specify domains that can access objects and variables in the SWF.
  * **allowedFileTypes**: An array of file types accepted by the upload SWF.  Format for each file type object is: `{description: "Images", extensions: "*.jpg; *.gif; *.png"}`
  * **maxFileSize**: The maximum size of an individual file, specified in bytes.  The default is 5242880 (5 MB).
  * **swfId**: The DOM id of the SWF embed/object tags.  Defaults to "transmit".
  * **swfUrl**:  The relative URL specifying the location of the uploader SWF file.  Default: "uploader.swf"

#### Complete Usage Example ####
```
           $(document).ready(function() {
                var options = {
                    allowedDomain: "mysite.com",
                    allowedFileTypes: [{
                        description: "Images",
                        extensions: "*.jpg; *.gif; *.png"
                    }],
                    maxFileSize: 10240, // 10 KB
                    swfId: "mySwfId",
                    swfUrl: "../resources/uploader.swf"
                };
                $("#transmit").transmit("http://mysite.com/upload/", options);
            });
```