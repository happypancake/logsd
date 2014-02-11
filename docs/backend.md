Supported Backends
------------------

LogsD supports pluggable backend modules that can publish
statistics from the local LogsD daemon to a backend service or data
store. 

LogsD includes the following built-in backends:

* Console (`console`): Outputs the received
  metrics to stdout (see what's going on during development).
* Logentries (`logentries`): An hosted log management service that provides visualization through a web-browser.


By default, the `console` backend will be loaded automatically. Multiple
backends can be run at once. To select which backends are loaded, set
the `backends` configuration variable to the list of backend modules to load.