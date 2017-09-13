//when the document is ready do this main function
$(document).ready(function () {

    //get the JSON from the URL that finishes with /api/games
    $.getJSON(" /api/games", function (json) {
        createRankingTable(json.games);
        console.log("funciona1: ", json);
        if (json.player !== undefined) {
            console.log(json.games);
            createListGames(json.games);
            createRankingTable(json.games);
            console.log("funciona2");
        }

        //button join game 
        $(".joinGame").click(joinGame);

        //button to log out
        $("#logOut").click(logOut);

        //get the value of the labels for login and do the login
        $("#logIn").click(logIn);

        //get the value from sign up, sign up login
        $("#signIn").click(signIn);
    });
});

function createListGames(games) {
    for (var i = 0; i < games.length; i++) {
        console.log(" createListGames");
        var date = new Date(games[i].createDate).toLocaleString();
        var player1 = games[i].players[0].email;

        if (!games[i].players[1]) {
            var player2 = "<button id='" + games[i].id + "' class='joinGame'>JoinGame</button>";
        } else {
            var player2 = games[i].players[1].email;
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
        console.log(k);
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
    console.log(this.id);
    console.log("/api/game/" + idGame + "/players");
    $.post("/api/game/" + idGame + "/players").done(function () {

        console.log("joined game");
    });

}

function logOut() {
    $.post("/api/logout").done(function () {
        console.log("log out");
        $("#logOut").hide();
        $("#createNewGame").hide();
        $("#logIn").show();
        $(".logIn").show();
        $(".signIn").show();
    });


}

function logIn() {

    //get the variables
    var email = $("#email").val();

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
        $("#logOut").show();
        $("#createNewGame").show();
        $("#logIn").hide();
        $(".logIn").hide();
        $(".signIn").hide();
        location.reload();
    });
}

function signIn() {
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var emailSignIn = $("#emailSignIn").val();

    if (emailSignIn.indexOf("@") == -1) {
        alert("InvalidEmail");
    }

    var passwordSignIn = $("#passwordSignIn").val();
    var user = {
        "firstName": firstName,
        "lastName": lastName,
        "email": emailSignIn,
        "password": passwordSignIn,
    };

    $.post("/api/players", user)
        .done(function () {
            $.post("/api/login", user);
            $("#logOut").show();
            $("#createNewGame").show();
            $("#logIn").hide();
            $(".logIn").hide();
            $(".signIn").hide();
        });

    //button create new game
    $("#createNewGame").click(function () {
        $.post("/api/games").done(function () {
            console.log("created game");
        });
    });
}
