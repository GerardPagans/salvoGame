//global variables
var headers = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
var columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var shipClicked = false;
var sizeOfBoat = 0;
var shipSelected;
var ships = [];
var maximumSalvos = 0;
var salvos = [];
var turnNumber = 0;
var cantSalvo = true;



//when the document is ready do these function
$(document).ready(function () {


    //get the JSON from the URL that finishes with /api/game_view
    var gamePlayerId = getParameterByName("gp");

    createGrid("hitsAndMyShips", "hits");
    createGrid("shotsIFired", "shots");

    $.getJSON("/api/game_view/" + gamePlayerId, function (json) {
        if (json.ships.length > 0) {
            console.log("already ships");
            cantSalvo = false;
            $("#placeShips").hide();
            $(".tableShips").hide();
            $(".placeVertical").hide();
        }

        if (json.ships.length == undefined) {
            $("#sendSalvos").hide();
            $("shotsIFired").hide();

        }
        if (isTheGameOver(json) == true) {
            console.log("GAME OVER");
            $(".tableShips").hide();
            $("informationBoatsAndTables").hide();
            $("#placeShips").hide();
            $("#sendSalvos").hide();
            //$("#gameOver").removeClass("hidden");
        }
        if (waitForMyTurn(json) == false) {
            console.log("I CAN SALVO, IT IS MY TURN");
            $("#waitForMyTurn").removeClass("hidden");
        }


        whoIsPlaying(json);
        putShipsInTheGrid(json);
        putSalvosAndEnemyHits(json);
        putMySalvosAndMyHits(json);
        boatsInfo(json);
    });


    //place the ships and send to java
    $("#placeShips").click(placeShips);

    //send the salvos
    $("#sendSalvos").click(sendSalvos);

    //Come to the games menu page
    $("#BackToMenu").click(BackToMenu);

    //click the ships in order to select which ome you want to put
    $("img[data-number-cells]").click(function () {
        shipClicked = true;
        sizeOfBoat = $(this).attr("data-number-cells");
        shipSelected = $(this).parent();
        console.log(shipClicked, sizeOfBoat, shipSelected);
    });

    //click the grid in order to select where you can put your ship
    $("td[locations-cellhits]").click(function () {
        if (shipClicked) {
            var locationFirst = $(this).attr("locations-cellhits");
            var numbreLocationFirst = locationFirst.substr(1);
            var chartLocationFirst = locationFirst.charAt(0);
            var locationShip = [locationFirst];
            var placementRight = true;

            //when the checbox is clicked do that
            if ($("#placeVertical").prop("checked")) {

                console.log("VERTICAL");

                //check if there is enought vertical space
                if (sizeOfBoat == 5 && (chartLocationFirst == "G" || chartLocationFirst == "H" || chartLocationFirst == "I" || chartLocationFirst == "J")) {

                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;
                }
                if (sizeOfBoat == 4 && (chartLocationFirst == "H" || chartLocationFirst == "I" || chartLocationFirst == "J")) {
                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;

                }
                if (sizeOfBoat == 3 && (chartLocationFirst == "I" || chartLocationFirst == "J")) {
                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;
                }
                if (sizeOfBoat == 2 && (chartLocationFirst == "J")) {
                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;
                }

                //storing location vertical
                var letters = "ABCDEFGHIJ";
                console.log(letters);
                console.log(chartLocationFirst);
                var positionFirstChart = letters.indexOf(chartLocationFirst);
                console.log("positionFirstChart", positionFirstChart);
                console.log("positionFirstChart + 1", positionFirstChart + 1);
                console.log("letter positionFirstChart + 1", letters[positionFirstChart + 1]);


                for (var j = 1; j < sizeOfBoat; j++) {
                    locationShip.push(letters[positionFirstChart + j] + numbreLocationFirst);
                }
                console.log(locationShip);

                //check if the location for place the ship is occupied
                var locationOccupied = false;
                for (var j = 0; j < locationShip.length; j++) {
                    if ($("#hits" + locationShip[j]).hasClass("ship")) {
                        locationOccupied = true;
                        alert("You cannot place the ship here");
                        break;
                    }
                }
                if (locationOccupied == false && (placementRight == true)) {
                    console.log(letters);
                    console.log("chartLocationFirst", chartLocationFirst);
                    console.log("sum", (parseInt(numbreLocationFirst)));
                    console.log(locationFirst);
                    $("#hits" + locationFirst).addClass("ship");
                    for (var j = 1; j < locationShip.length; j++) {
                        console.log("#hits", letters[(parseInt(positionFirstChart) + j)] + numbreLocationFirst);
                        $("#hits" + letters[(parseInt(positionFirstChart) + j)] + numbreLocationFirst).addClass("ship");
                    }
                    $(shipSelected).hide();
                    ships.push(locationShip);
                }
            } else {
                console.log("HORITZONTAL");

                //check if there is enought space (horizontal)
                if (sizeOfBoat == 5 && numbreLocationFirst >= 7) {
                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;
                }
                if (sizeOfBoat == 4 && numbreLocationFirst >= 8) {
                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;

                }
                if (sizeOfBoat == 3 && numbreLocationFirst >= 9) {
                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;
                }
                if (sizeOfBoat == 2 && numbreLocationFirst == 10) {
                    alert("You cannot place the ship here");
                    placementRight = false;
                    return;
                }

                //storing location horizontal
                for (var i = 1; i < sizeOfBoat; i++) {
                    locationShip.push(chartLocationFirst + (parseInt(numbreLocationFirst) + parseInt(i)));
                }

                //check if the location for place the ship is occupied
                var locationOccupied = false;
                for (var j = 0; j < locationShip.length; j++) {
                    if ($("#hits" + locationShip[j]).hasClass("ship")) {
                        locationOccupied = true;
                        alert("You cannot place the ship here");
                        break;
                    }
                }
                if (locationOccupied == false && (placementRight == true)) {
                    $("#hits" + locationFirst).addClass("ship");
                    for (var j = 0; j < locationShip.length; j++) {
                        $("#hits" + chartLocationFirst + (parseInt(numbreLocationFirst) + parseInt(j))).addClass("ship");
                    }
                    $(shipSelected).hide();
                    ships.push(locationShip);
                }
            }
        }
        shipClicked = false;
    });

    //click the grid to put salvos
    $("td[locations-cellshots]").click(function () {
        var cell = $(this).attr("locations-cellshots");
        if (cantSalvo == true) {
            alert("Place your ships first");
        } else
            //maximum we can have 5 salvos
            if (maximumSalvos < 5 && !($("#shots" + cell).hasClass("salvo")) && !($("#shots" + cell).hasClass("trySalvo"))) {

                $("#shots" + cell).addClass("trySalvo");
                salvos.push(cell);
                maximumSalvos = maximumSalvos + 1;

                console.log(salvos);
                //if we click a cell with a salvo, we remove the salvo    
            } else if ((maximumSalvos <= 5 && ($("#shots" + cell).hasClass("trySalvo")))) {
            console.log("cela marcada");
            console.log(salvos);
            $("#shots" + cell).removeClass("trySalvo");
            var index = salvos.indexOf(cell);
            salvos.splice(index, 1);
            console.log(salvos);
            maximumSalvos = maximumSalvos - 1;

        } else if ((maximumSalvos <= 5 && ($("#shots" + cell).hasClass("salvo"))) || (maximumSalvos <= 5 && ($("#shots" + cell).hasClass("hitShotShip")))) {

            alert("You already put a salvo here");
        } else {
            alert("The maximum of salvos is 5");
        }
    });

    //get the value of the URL giving the names of the variable
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    //show all the games and who is playing with who
    function whoIsPlaying(json) {
        var mail1 = json.gamePlayers[0].email;

        if (!json.gamePlayers[1]) {
            var mail2 = "Waiting for a player";
        } else {
            var mail2 = json.gamePlayers[1].email;
        }
        var info = "<li>" + mail1 + " VS. " + mail2;
        $("#whoVersusWho").append(info);
    }

    //creates the grid with the headers and columns
    function createGrid(idGiven, typeTable) {
        createHeaders(headers, idGiven);
        createColumns(headers, columns, idGiven, typeTable);
    }

    //creates the grid header's
    function createHeaders(headers, idGiven) {
        var row = "<tr>";
        for (var i = 0; i < headers.length; i++) {
            row = row + "<td>" + headers[i] + "</td>";
        }
        row = row + "</tr>";
        $("#" + idGiven).append(row);
    }

    //creates the grid column's
    function createColumns(headers, columns, idGiven, typeTable) {
        var row = "<tr class='row0'>";
        var k = 1;
        for (var i = 0; i < columns.length; i++) {
            row = row + "<td>" + columns[i] + "</td>";
            for (var j = 0; j < headers.length - 1; j++) {
                row = row + "<td locations-cell" + typeTable + "='" + columns[i] + k + "' id='" + typeTable + columns[i] + k + "'></td>";
                if (j == headers.length - 2) {
                    k = 1;
                } else {
                    k++;
                }
            }
            if (i == columns.length - 2) {
                row = row + "</tr><tr class='row" + (i + 1) + "'>";
            } else {
                row = row + "</tr>";
            }
        }
        $("#" + idGiven).append(row);
    }

    //show the ships into the map
    function putShipsInTheGrid(json) {
        var cellIdShip;
        for (var i = 0; i < json.ships.length; i++) {
            for (var j = 0; j < json.ships[i].locations.length; j++) {
                cellIdShip = json.ships[i].locations[j];
                $("#hits" + cellIdShip).addClass("ship");
            }
        }
    }

    //salvos atacking me (hits)
    function putSalvosAndEnemyHits(json) {
        console.log(json);
        for (var k = 0; k < json.enemiesSalvoes.length; k++) {
            var turn = json.enemiesSalvoes[k].turn;

            for (var i = 0; i < json.enemiesSalvoes[k].hits.length; i++) {
                var cellIdHit = json.enemiesSalvoes[k].hits[i];
                $("#hits" + cellIdHit).removeClass("ship");
                $("#hits" + cellIdHit).addClass("hitShotShip");
                $("#hits" + cellIdHit).append(turn);
            }

            for (var l = 0; l < json.enemiesSalvoes[k].locations.length; l++) {
                var cellSalvoFail = json.enemiesSalvoes[k].locations[l];

                if (!$("#hits" + cellSalvoFail).hasClass("hitShotShip")) {
                    $("#hits" + cellSalvoFail).addClass("salvo");
                    $("#hits" + cellSalvoFail).append(turn);
                }
            }
        }
    }

    //salvos I attack
    function putMySalvosAndMyHits(json) {
        console.log(json);
        for (var k = 0; k < json.mySalvoes.length; k++) {
            var turn = json.mySalvoes[k].turn;

            //put in the grid all my guesses of salvos
            for (var l = 0; l < json.mySalvoes[k].locations.length; l++) {
                var cellTrySalvo = json.mySalvoes[k].locations[l];
                $("#shots" + cellTrySalvo).addClass("salvo");
                $("#shots" + cellTrySalvo).append(turn);
            }

            //put in the grid all my hits
            for (var i = 0; i < json.mySalvoes[k].hits.length; i++) {
                var cellIdHit = json.mySalvoes[k].hits[i];
                if ($("#shots" + cellIdHit).hasClass("salvo")) {
                    $("#shots" + cellIdHit).removeClass("salvo");
                    $("#shots" + cellIdHit).addClass("hitShotShip");
                } else {
                    $("#shots" + cellIdHit).addClass("hitShotShip");
                    $("#shots" + cellIdHit).append(turn);
                }
            }
        }
    }


    function placeShips() {
        console.log("/api/games/players/" + gamePlayerId + "/ships");
        console.log(ships);

        if (ships.length < 5) {
            alert("Must be placed 5 ships!");
        }
        
        var shipsO = [];
        for(var i = 0; i < ships.length; i++){
            var obj = {};
            obj.type = "Destroyer";
            obj.locations = ships[i];
            shipsO.push(obj);
        }
        $.post({
                url: "/api/games/players/" + gamePlayerId + "/ships",
                data: JSON.stringify(shipsO),
                dataType: "text",
                contentType: "application/json"
            })
            .done(function () {
                alert("ship added");
            })
            .fail(function (jqXHR, status, httpError) {
                alert("Cannot place ships");
            });
    }

    function sendSalvos() {
        $.post({
                url: "/api/games/players/" + gamePlayerId + "/salvos",
                data: JSON.stringify({
                    "location": salvos
                }),
                dataType: "text",
                contentType: "application/json"
            })
            .done(function () {
                alert("salvos added");
                maximumSalvos = 0;
                location.reload();
                //$("#sendSalvos");
            })
            .fail(function (jqXHR, status, httpError) {
                alert("Cannot send salvos");
            });
    }

    function BackToMenu() {
        location.assign("/web/games.html?gp=" + gamePlayerId);
    }
    
    function boatsInfo(json) {
        console.log("infoBoats");
        var listShips = "<div class='listOfShips'><ul><li><img class= 'shipWord' src='img/ships.jpg'></li>";
        var infoHits = "<div class='infoHits'><ul><li><img class= 'turn' src='img/turn.jpg'></li>";
        //put the names of boats and image if the ship has been sunk
        for (var i = 0; i < json.sunkShips.length; i++) {
            if (json.sunkShips[i].isSunk == true) {
                listShips = listShips + "<li><img class = 'dead' src='img/dead.png'> " + json.sunkShips[i].typeShip + "</li>";
            } else {
                listShips = listShips + "<li>" + json.sunkShips[i].typeShip + "</li>";
            }
        }

        listShips = listShips + "</ul></div>";
        $("#myBoatsInfo").append(listShips);
        $("#OpponentBoatsInfo").append(listShips);

        //put information about hits you done
        for (var j = 0; j < json.mySalvoes.length; j++) {
            infoHits = infoHits + "<li>turn" + json.mySalvoes[j].turn + ":" + json.mySalvoes[j].hits.length + " </li> ";
        }
        infoHits = infoHits + "</ul></div>";
        $("#myBoatsInfo").append(infoHits);

        //put information about hits of you opponent
        infoHits = "<div class='infoHits'><ul><li><img class= 'turn' src='img/turn.jpg'></li>";

        for (var l = 0; l < json.enemiesSalvoes.length; l++) {
            infoHits = infoHits + "<li>turn" + json.enemiesSalvoes[l].turn + ":" + json.enemiesSalvoes[l].hits.length + " </li> ";
        }
        infoHits = infoHits + "</ul></div>";
        $("#OpponentBoatsInfo").append(infoHits);

    }

    function isTheGameOver(json) {
        var gameOver = true;
        for (var i; i < json.sunkShips.length; i++) {
            console.log(i);
            if (json.sunkShips[i].isSunk == false) {
                gameOver = false;
                console.log("There is at least one ship alive");
                break;
            }
        }
        return gameOver;
    }

    function waitForMyTurn(json) {
        var biggestTurn = 0;
        var myTurn = true;

        for (var i; i < json.mySalvoes.length; i++) {
            if (json.mySalvoes[i].turn > biggestTurn) {
                biggestTurn = json.mySalvoes[i].turn;
            }
        }

        for (var j; j < json.enemiesSalvoes.length; j++) {
            if (json.enemiesSalvoes[j].turn == biggestTurn) {
                myTurn = false;
                console.log("I can salvo again");
                break;
            }
        }
        return myTurn;
    }



});
