var RestAPIHelper = {

	busyDialog : new sap.m.BusyDialog(),
	busyDialogRequests : [],

	getAbsolute : function(url, async, successHandler, errorHandler, context) {
		this.genericGet(window.location.origin + url, async, successHandler, errorHandler, context);
	},

	get : function(url, async, successHandler, errorHandler, context) {
		this.genericGet(ServerConfig.getServerAddress() + url, async, successHandler, errorHandler, context);
	},

	genericGet : function(url, async, successHandler, errorHandler, context, headers = {Authorization: "Bearer " + this.getCookie("wlcp.userSession")}) {
		this.requestBusyDialog();
		var that = this;
		$.ajax({
			headers : headers,
			url: url, 
			type: 'GET',
			async : async,
			success: function(data) {
				that.callHandlerBasedOnContext(successHandler, data, context);
			},
			error : function(error) {
				that.createErrorResponseDialog(error);
				that.callHandlerBasedOnContext(errorHandler, error, context);
			}
		});
	},

	postAbsolute : function(url, data, async, successHandler, errorHandler, context) {
		this.genericPost(window.location.origin + url, data, async, successHandler, errorHandler, context);
	},

	post : function(url, data, async, successHandler, errorHandler, context) {
		this.genericPost(ServerConfig.getServerAddress() + url, data, async, successHandler, errorHandler, context);
	},

	genericPost : function(url, data, async, successHandler, errorHandler, context, headers = {Authorization: "Bearer " + this.getCookie("wlcp.userSession")}) {
		this.requestBusyDialog();
        var that = this;
		$.ajax({
		headers : headers,
		contentType : "application/json",
		url: url,
		type: 'POST',
		async : async,
		data: JSON.stringify(data),
		success: function(data) {
            that.callHandlerBasedOnContext(successHandler, data, context);
		},
		error : function(error) {
				that.createErrorResponseDialog(error);
				that.callHandlerBasedOnContext(errorHandler, error, context);
			}
		});
	},

	getCookie : function(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
		  var c = ca[i];
		  while (c.charAt(0) == ' ') {
			c = c.substring(1);
		  }
		  if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		  }
		}
		return "";
	},
	
	createErrorResponseDialog : function(error) {
		if(typeof(error.responseJSON.subErrors) === "undefined") { error.responseJSON.subErrors = []; error.responseJSON.subErrors.push({message:"No Sub-errors..."}); }
		var controller = sap.ui.controller("org.wlcp.wlcp-ui.controller.ErrorResponse");
		var fragment = sap.ui.xmlfragment("org.wlcp.wlcp-ui.fragment.ErrorResponse", controller);
		controller.dialog = fragment;
		controller.errorResponseDataModel = new sap.ui.model.json.JSONModel(error.responseJSON);
		fragment.setModel(controller.errorResponseDataModel);
		fragment.open();
	},
    
    callHandlerBasedOnContext : function(handler, data, context) {
		this.closeBusyDialog();
        if(typeof(context) !== "undefined") {
            var handler = handler.bind(context);
            handler(data);
        } else {
            handler(data);
        }
	},
	
	requestBusyDialog : function() {
		if(this.busyDialogRequests.length > 0) {
			this.busyDialogRequests.push("");
		} else {
			this.busyDialog.open();
		}
	},

	closeBusyDialog : function() {
		this.busyDialogRequests.pop();
		if(this.busyDialogRequests.length <= 0) {
			this.busyDialog.close();
			this.busyDialog.destroy();
			this.busyDialog = new sap.m.BusyDialog()
		}
	}
}