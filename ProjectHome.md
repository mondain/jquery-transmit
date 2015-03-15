Welcome!  Transmit (jquery-transmit) is a sophisticated jQuery plugin providing an elegant multi-file upload utility.  At the core of the plugin is a small SWF file which provides single or multiple file selection and upload services.  Getting started with the plugin couldn't be easier:

```
           $(document).ready(function() {
                $("#transmit").transmit("http://mysite.com/upload/");
            });
```

Want to narrow the type of selected files to allow only images?  Here's how to do it:

```
           $(document).ready(function() {
                var options = {
                    allowedFileTypes: [{
                        description: "Images",
                        extensions: "*.jpg; *.gif; *.png"
                    }]
                };
                $("#transmit").transmit("http://mysite.com/upload/", options);
            });
```

For complete usage details, see the plugin [documentation](http://code.google.com/p/jquery-transmit/wiki/Documentation).
