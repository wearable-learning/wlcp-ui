sap.ui.controller("org.wlcp.wlcp-ui.controller.CreateLoadGame", {
	
	getMaxPlayer : function (max, teamCount) {
		  return Math.floor(max / teamCount);
		},
		
	onPlayerChange: function (oEvent) {
		
		var playerCount = GameEditor.getEditorController().newGameModel.playersPerTeam;
		var teamCount = GameEditor.getEditorController().newGameModel.teamCount;
		
		var maxPlayerValue = this.getMaxPlayer(9, teamCount)
		if(playerCount > maxPlayerValue){
			GameEditor.getEditorController().newGameModel.playersPerTeam = playerCount - 1;
			sap.m.MessageBox.error(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.team1") + teamCount + " " + sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.team2")+ maxPlayerValue + " " + sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.team3"));
		}
			
	},
			
	onTeamChange: function (oEvent) {
					
		var playerCount = GameEditor.getEditorController().newGameModel.playersPerTeam;
		var teamCount = GameEditor.getEditorController().newGameModel.teamCount;
			
		var maxPlayerValue = this.getMaxPlayer(9, teamCount)
		if(playerCount > maxPlayerValue){
			GameEditor.getEditorController().newGameModel.TeamCount = teamCount - 1;
			sap.m.MessageBox.error(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.team1") + teamCount + " " + sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.team2")+ maxPlayerValue + " " + sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.team3"));
		}
			
	},
	
	
	cancelCreateLoadGame : function() {
		sap.ui.getCore().byId("createLoadGame").close();
		sap.ui.getCore().byId("createLoadGame").destroy();
	},
	
	/**
	 * This is called when the create button is pressed on the Create Game
	 * Dialog. If it succeeds, createGameSuccess will be called.
	 */
	createGame : function() {
		if(!GameEditor.getEditorController().newGameModel.gameId.match(/^[a-zA-Z]+$/)) {
			sap.m.MessageBox.error(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.copy.gameNameError"));
			return;
		}
		$.ajax({headers : { 'Accept': 'application/json', 'Content-Type': 'application/json'},
			url: "http://localhost:8050/wlcp-api/gameController/createGame",
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify(GameEditor.getEditorController().newGameModel),
			success : $.proxy(this.createGameSuccess, this),
			error : $.proxy(this.createGameError, this)
		});
	},
	
	loadGame : function() {
		var gameToLoad = "";
		if(sap.ui.getCore().byId("userLoadGameComboBox").getSelectedKey() != "" && sap.ui.getCore().byId("publicLoadGameComboBox").getSelectedKey() != "") {
			sap.m.MessageBox.error(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.load.selectError"));
			return;
		} else if(sap.ui.getCore().byId("userLoadGameComboBox").getSelectedKey() != "") {
			gameToLoad = sap.ui.getCore().byId("userLoadGameComboBox").getSelectedKey();
		} else if(sap.ui.getCore().byId("publicLoadGameComboBox").getSelectedKey() != "") {
			gameToLoad = sap.ui.getCore().byId("publicLoadGameComboBox").getSelectedKey();
		} else {
			sap.m.MessageBox.error(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.load.selectNoneError"));
			return;
		}
		var filters = [];
		filters.push(new sap.ui.model.Filter({path: "GameId", operator: sap.ui.model.FilterOperator.EQ, value1: gameToLoad}));
		ODataModel.getODataModel().read("/Games", {filters : filters, success : this.loadGameSuccess, error: this.loadGameError});
		this.cancelLoadGame();
	},
	
	/**
	 * Called when the user wants to cancel creating a game.
	 * They will be returned to main editor screen with all controls disabled
	 * except for the main toolbar.
	 */
	cancelCreateGame : function() {
		sap.ui.getCore().byId("createGame").close();
		sap.ui.getCore().byId("createGame").destroy();
	},
	
	cancelLoadGame : function() {
		sap.ui.getCore().byId("loadGame").close();
		sap.ui.getCore().byId("loadGame").destroy();
	},
	
	/**
	 * Called if the game has been created in the back end successfully.
	 * The game editors or game managers model will be updated accordingly.
	 * The dialog will be closed and a success message shown.
	 */
	createGameSuccess : function(oSuccess) {
		GameEditor.getEditorController().resetEditor();
		if(GameEditor.getEditor() != null) {
			GameEditor.getEditorController().gameModel.gameId = oSuccess.object.gameId;
			GameEditor.getEditorController().gameModel.teamCount = oSuccess.object.teamCount;
			GameEditor.getEditorController().gameModel.playersPerTeam = oSuccess.object.playersPerTeam;
			GameEditor.getEditorController().gameModel.visibility = oSuccess.object.visibility;
			GameEditor.getEditorController().gameModel.stateIdCount = oSuccess.object.stateIdCount;
			GameEditor.getEditorController().gameModel.transitionIdCount = oSuccess.object.transitionIdCount;
			GameEditor.getEditorController().gameModel.connectionIdCount = oSuccess.object.connectionIdCount;
			GameEditor.getEditorController().gameModel.usernameId = oSuccess.object.usernameId;
			GameEditor.getEditorController().newGameModel.gameId = "";
			GameEditor.getEditorController().newGameModel.teamCount = 3;
			GameEditor.getEditorController().newGameModel.playersPerTeam = 3;
			GameEditor.getEditorController().newGameModel.visibility = true;
			GameEditor.getEditorController().newGameModel.stateIdCount = 0;
			GameEditor.getEditorController().newGameModel.transitionIdCount = 0;
			GameEditor.getEditorController().newGameModel.connectionIdCount = 0;
			GameEditor.getEditorController().initNewGame();
		}
		sap.ui.getCore().byId("createGame").close();
		sap.ui.getCore().byId("createGame").destroy();
		sap.m.MessageToast.show(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.messages.createSuccess"));
	},
	
	loadGameSuccess : function(oData) {
		GameEditor.getEditorController().resetEditor();
		GameEditor.getEditorController().gameModel.gameId = oData.results[0].gameId;
		GameEditor.getEditorController().gameModel.TeamCount = oData.results[0].TeamCount;
		GameEditor.getEditorController().gameModel.PlayersPerTeam = oData.results[0].PlayersPerTeam;
		GameEditor.getEditorController().gameModel.Visibility = oData.results[0].Visibility;
		GameEditor.getEditorController().gameModel.StateIdCount = oData.results[0].StateIdCount;
		GameEditor.getEditorController().gameModel.TransitionIdCount = oData.results[0].TransitionIdCount;
		GameEditor.getEditorController().gameModel.ConnectionIdCount = oData.results[0].ConnectionIdCount;
		GameEditor.getEditorController().gameModel.Username = oData.results[0].Username;
		GameEditor.getEditorController().load();
	},
	
	loadGameError : function() {
		sap.m.MessageBox.error(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.load.error"));
	},
	
	/**
	 * If an error occurs creating the game in the back end
	 * and error message will be shown.
	 */
	createGameError : function(oError) {
		sap.m.MessageBox.error(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("gameEditor.create.error"));
	}
});