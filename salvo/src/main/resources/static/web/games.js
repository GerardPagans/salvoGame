//when the document is ready do this main function
$(document).ready(function () {

    //get the JSON from the URL that finishes with /api/games
    $.getJSON(" /api/games", onDataReady);

    $('#login-form-link').click(function (e) {
        $("#login-form").delay(100).fadeIn(100);
        $("#register-form").fadeOut(100);
        $('#register-form-link').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });
    $('#register-form-link').click(function (e) {
        $("#register-form").delay(100).fadeIn(100);
        $("#login-form").fadeOut(100);
        $('#login-form-link').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });

});

function onDataReady(data) {
    console.log(data);
    createRankingTable(data.games);

    if (data.player !== undefined) {
        $(".container").hide();
        console.log("GamePlayer connected");
        createListGamesForLoginPlayers(data);
    }

    if (data.player == undefined) {
        console.log("No gamePlayer");
        createListGames(data.games);
        $("#logout-form").hide();
        $("#createNewGame").hide();
    }

    //button join game 
    $(".joinGame").click(joinGame);

    //button to play a game that you are already a player
    $(".play").click(playGame);

    //button to log out
    $("#logOut").click(logOut);

    //get the value of the labels for login and do the login
    $("#login-submit").click(logIn);

    //get the value from sign up, sign up login
    $("#register-submit").click(signIn);

    //create a new game
    $("#createNewGame").click(createGame);
}


function createListGamesForLoginPlayers(data) {
    for (var i = 0; i < data.games.length; i++) {

        var date = new Date(data.games[i].createDate).toLocaleString();
        var player1 = data.games[i].players[0].email;
        var idPlayer = data.player.id;
        var player2;

        if (data.games[i].players.length == 1) {
            if (data.games[i].players[0].id !== idPlayer) {
                var idGamePlayer1 = data.games[i].players[1].pgid;
                player2 = "<button id='gp" + idGamePlayer1 + "join" + parseInt(i + 1) + "' class='joinGame'>JoinGame</button>";
            } else {
                var idGamePlayer0 = data.games[i].players[0].pgid;
                player2 = "WAITING FOR A PLAYER" + "<button id='" + i + "play" + idGamePlayer0 + "' class='play'>Play</button>";
            }
        } else {
            var idGamePlayer;
            if (data.games[i].players[0].id == idPlayer || data.games[i].players[1].id == idPlayer) {
                if (data.games[i].players[0].id == idPlayer) {
                    idGamePlayer = data.games[i].players[0].pgid;
                } else {
                    idGamePlayer = data.games[i].players[1].pgid;
                }

                player2 = data.games[i].players[1].email + "<button id='" + i + "play" + idGamePlayer + "' class='play'>Play</button>";
            } else {
                player2 = data.games[i].players[1].email;
            }
        }
        var info = "<li>" + date + ": " + player1 + " VS. " + player2;
        $(".listOfGames").append(info);
    }
}

function createListGames(games) {
    console.log("games:", games);

    for (var i = 0; i < games.length; i++) {
        var date = new Date(games[i].createDate).toLocaleString();
        var player1 = games[i].players[0].email;
        var player2;

        if (!games[i].players[1]) {
            player2 = "WAITING FOR A PLAYER";
        } else {
            player2 = games[i].players[1].email;
        }
        var info = "<li>" + date + ": " + player1 + " VS. " + player2;
        $(".listOfGames").append(info);
    }
}

function createRankingTable(games) {
    var table = document.createElement('table');
    var row = table.insertRow();
    var cellName = row.insertCell();
    var cellTotal = row.insertCell();
    var cellWon = row.insertCell();
    var cellLost = row.insertCell();
    var cellTied = row.insertCell();

    var listPlayersWithPoints = [];

    cellName.innerHTML = "NAME";
    cellTotal.innerHTML = "TOTAL";
    cellWon.innerHTML = "WON";
    cellLost.innerHTML = "LOST";
    cellTied.innerHTML = "TIED";

    for (var k = 0; k < games.length; k++) {
        for (var i = 0; i < games[k].scores.length; i++) {
            var player = games[k].scores[i].player;
            var score = games[k].scores[i].score;

            var playerObject = findPlayer(listPlayersWithPoints, player);

            if (playerObject === null) {
                playerObject = {
                    "player": player,
                    "total": 0,
                    "won": 0,
                    "lost": 0,
                    "tied": 0
                };
            }

            playerObject.total = playerObject.total + games[k].scores[i].score;

            if (score == 1.0) {
                playerObject.won = playerObject.won + 1.0;
            } else if (score == 0.5) {
                playerObject.tied = playerObject.tied + 1.0;
            } else {
                playerObject.lost = playerObject.lost + 1.0;
            }
            listPlayersWithPoints.push(playerObject);
        }
    }

    listPlayersWithPoints.sort(function (a, b) {
        return b.total - a.total;
    });

    for (var j = 0; j < listPlayersWithPoints.length; j++) {
        var newRow = table.insertRow();
        var cellNewName = newRow.insertCell();
        var cellNewTotal = newRow.insertCell();
        var cellNewWon = newRow.insertCell();
        var cellNewLost = newRow.insertCell();
        var cellNewTied = newRow.insertCell();
        cellNewName.innerHTML = listPlayersWithPoints[j].player;
        cellNewTotal.innerHTML = listPlayersWithPoints[j].total;
        cellNewWon.innerHTML = listPlayersWithPoints[j].won;
        cellNewLost.innerHTML = listPlayersWithPoints[j].lost;
        cellNewTied.innerHTML = listPlayersWithPoints[j].tied;

        $(".ranking").append(table);
    }
}

function findPlayer(list, player) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].player == player) {
            return list[i];
        }
    }
    return null;
}

function joinGame() {
    var idGame = this.id;
    var idThisGamePlayer = idGame.charAt(2);
    console.log(idThisGamePlayer);
    idGame = idGame.substr(7);
    console.log(idGame);
    console.log("/api/game/" + idGame + "/players");
    $.post("/api/game/" + idGame + "/players").done(function () {
        console.log("joined game");
        console.log("id player:");

        location.assign("/web/game.html?gp=" + idThisGamePlayer);
    });

}

function playGame() {
    var idGamePlayer = this.id;
    idGamePlayer = idGamePlayer.substr(5);
    console.log(idGamePlayer);

    location.assign("/web/game.html?gp=" + idGamePlayer);
}

function logOut() {
    $.post("/api/logout").done(function () {
        console.log("LOG OUT");
        location.reload();
    });

}

function logIn() {

    //get the variables
    var email = $("#username").val();

    if (email.indexOf("@") == -1) {
        alert("InvalidName");
    }
    var password = $("#password").val();

    //do an object with the variables
    var user = {
        "email": email,
        "password": password
    };
    //send this user object
    $.post("/api/login", user).done(function () {
        console.log("logged in");
        onDataReady();
    });
}

function signIn() {
    console.log("pressed botton register sign in");
    var usernameRegister = $("#usernameRegister").val();
    var lastNameRegister = $("#lastNameRegister").val();
    var emailSignIn = $("#emailSignIn").val();

    if (emailSignIn.indexOf("@") == -1 || usernameRegister == null) {
        alert("InvalidEmail");
    }

    var passwordSignIn = $("#passwordSignIn").val();
    var user = {
        "username": usernameRegister,
        "lastName": lastNameRegister,
        "email": emailSignIn,
        "password": passwordSignIn,
    };

    console.log(user);

    $.post("/api/players", user)
        .done(function () {
            console.log("NEW USER REGISTERD. CONGRATS");
            $.post("/api/login", user);
            $("#logout-form").show();
            $("#createNewGame").show();
            $("#login-form").hide();
            $("#signIn-form").hide();
            location.assign("/web/games.html");
        });
}

function createGame() {
    $.post("/api/games").done(function (data) {
        console.log("created game");
        console.log(data);
        location.assign("/web/game.html?gp=" + data.gpid);
    });
}
