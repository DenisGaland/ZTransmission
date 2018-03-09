sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageBox, MessageToast, ResourceModel, ODataModel, BusyIndicator) {
	"use strict";
	return Controller.extend("zdistriplus.ZTransmission.controller.View1", {
		saved: false,
		onInit: function() {
			var oView = this.getView();
			var i18nModel = new ResourceModel({
				bundleName: "zdistriplus.ZTransmission.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
			var oController = this;
			var query = "/ListcheckSet(ListId=-1,Ean='',Umrez=-1)";
			this.getView().bindElement({
				path: query
			});
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("eansearchid").focus();
			});
			oController.showButtons("init");
		},

		showButtons: function(oEvent) {
			var oController = this;
			var event = oEvent;
			var oView = this.getView();
			var oTable = this.getView().byId("listtable");
			oTable.attachUpdateFinished(function() {
				debugger;
				if (this.getItems().length > 0 && oController.saved === false) {
					oView.byId("button_box").setVisible(true);
					oView.byId("listtable").setVisible(true);
				} else {
					oView.byId("button_box").setVisible(false);
					oView.byId("listtable").setVisible(false);
				}
			});
		},

		/**
		 *@memberOf zdistriplus.ZTransmission.controller.View1
		 * @param {sap.m.SearchField} oEvent}
		 */
		EanSearch: function(oEvent) {
			var oController = this;
			var oView = this.getView();
			var listid = oView.byId("listid").getValue();
			var config = this.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZTRANSMISSIONLIST_SRV.uri;
			var oData = new ODataModel(sServiceUrl, true);
			var query = "/ListcheckSet(ListId=" + listid + ",Ean='" + oEvent.getSource().getValue() + "',Umrez=-1)";
			oView.byId("eansearchid").setValue("");
			BusyIndicator.show();
			oData.read(
				query, {
					async: false,
					success: function(response) {
						BusyIndicator.hide();
						oController.saved = false;
						if (response.Message === '') {
							oController.getOwnerComponent().getModel().refresh();
							oController.showButtons("search");
						} else {
							var path = $.sap.getModulePath("zdistriplus.ZTransmission", "/audio");
							var aud = new Audio(path + "/MOREINFO.png");
							aud.play();
							MessageBox.error(response.Message);
						}
					}, // function
					error: function(error) {
						BusyIndicator.hide();
						MessageBox.error(JSON.parse(error.response.body).error.message.value, {
							title: "Error"
						});
					}
				}
			);
		},

		onSave: function(oEvent) {
			var oController = this;
			var oView = oController.getView();
			var msg = "";
			if (oView.byId("zcommenttext").getValue() === "") {
				msg = oView.getModel("i18n").getResourceBundle().getText("fillcomment");
				MessageBox.error(msg, {
					title: "Error",
					onClose: function() {
						jQuery.sap.delayedCall(500, this, function() {
							oView.byId("zcommenttext").focus();
						});
					}
				});
			} else {
				msg = oView.getModel("i18n").getResourceBundle().getText("savewithcomment");
				MessageBox.confirm(msg, {
					//title: sTitle,
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function(sButton) {
						if (sButton === MessageBox.Action.OK) {
							var listid = oView.byId("listid").getValue();
							var comment = oView.byId("zcommenttext").getValue();
							var config = oController.getOwnerComponent().getManifest();
							var sServiceUrl = config["sap.app"].dataSources.ZTRANSMISSIONLIST_SRV.uri;
							var oData = new ODataModel(sServiceUrl, true);
							var query = "/SaveListSet(ListId=" + listid + ",ZComment='" + comment + "')";
							oView.byId("zcommenttext").setValue("");
							oView.byId("listid").setValue("");
							BusyIndicator.show();
							oData.read(
								query, {
									async: false,
									success: function(response) {
										BusyIndicator.hide();
										oController.saved = true;
										debugger;
										MessageBox.information(response.Mesage, {
											onClose: function() {
												window.history.go(-1);
												//oController.getOwnerComponent().getModel().refresh();
												//oView.byId("listtable").setVisible(false);
												//oView.byId("button_box").setVisible(false);
											}
										});
									},
									error: function(error) {
										BusyIndicator.hide();
										MessageBox.error(JSON.parse(error.response.body).error.message.value, {
											title: "Error"
										});
									}
								}
							);
						}
					}
				});
			}
		},

		onClear: function(oEvent) {
			var oController = this;
			var oView = oController.getView();
			var msg = oView.getModel("i18n").getResourceBundle().getText("clearlist");
			MessageBox.confirm(msg, {
				//title: sTitle,
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var config = oController.getOwnerComponent().getManifest();
						var sServiceUrl = config["sap.app"].dataSources.ZTRANSMISSIONLIST_SRV.uri;
						var oData = new ODataModel(sServiceUrl, true);
						var query = "/ListcheckSet(ListId=-2,Ean='',Umrez=-1)";
						oView.byId("eansearchid").setValue("");
						BusyIndicator.show();
						oData.read(
							query, {
								async: false,
								success: function(response) {
									BusyIndicator.hide();
									oController.getOwnerComponent().getModel().refresh();
									oView.byId("button_box").setVisible(false);
									oView.byId("listtable").setVisible(false);
									MessageBox.information(response.Message, {
										onClose: function() {
											jQuery.sap.delayedCall(500, this, function() {
												oView.byId("eansearchid").focus();
											});
										}
									});
								},
								error: function(error) {
									BusyIndicator.hide();
									MessageBox.error(JSON.parse(error.response.body).error.message.value, {
										title: "Error"
									});
								}
							}
						);
					}
				}
			});
		},

		update: function(oEvent) {
			debugger;
			var oController = this;
			var oView = this.getView();
			//var oArticle_input = oView.byId("SearchArt");
			var listid = oView.byId("listid").getValue();
			var id = oEvent.mParameters.id;
			var number = oEvent.mParameters.selectedItem.getText();
			id = id.replace("oSelect", "eanid");
			var gtin = oView.byId(id).getText();
			if (!isNaN(number) && number > 0) {
				var config = oController.getOwnerComponent().getManifest();
				var sServiceUrl = config["sap.app"].dataSources.ZTRANSMISSIONLIST_SRV.uri;
				var oData = new ODataModel(sServiceUrl, true);
				var query = "/ListcheckSet(ListId=" + listid + ",Ean='" + gtin + "',Umrez=" + number + ")";
				oView.byId("eansearchid").setValue("");
				BusyIndicator.show();
				oData.read(
					query, {
						async: false,
						success: function(response) {
							BusyIndicator.hide();
							oController.getOwnerComponent().getModel().refresh();
							//oView.byId("button_box").setVisible(false);
							//oView.byId("listtable").setVisible(false);
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("eansearchid").focus();
							});
							var msg = oView.getModel("i18n").getResourceBundle().getText("updated");
							MessageToast.show(msg, {
								my: "center top",
								at: "center top"
							});
						},
						error: function(error) {
							BusyIndicator.hide();
							MessageBox.error(JSON.parse(error.response.body).error.message.value, {
								title: "Error"
							});
						}
					}
				);
			} else {
				var path = $.sap.getModulePath("Press_Shop_Fiori2", "/audio");
				var aud = new Audio(path + "/MOREINFO.png");
				aud.play();
				MessageBox.show("numeric", {
					icon: MessageBox.Icon.ERROR,
					onClose: function() {
						jQuery.sap.delayedCall(500, this, function() {
							oView.byId("eansearchid").focus();
						});
					}
				});
			}
		}
	});
});