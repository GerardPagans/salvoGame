//global variables
var headers = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
var columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var shipClicked = false;
var sizeOfBoat = 0;
var shipSelected;
var ships = [];
var maximumSalvos = 0;
var salvos = [];


//when the document is ready do these function
$(document).ready(function () {
    createGrid("hitsAndMyShips", "hits");
    createGrid("shotsIFired", "shots");

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


            if ($("#placeVertical").prop("checked")) {
                console.log("VERTICAL");
                //check if there is enought vertical 
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

        //maximum we can have 5 salvos
        if (maximumSalvos < 5 && !($("#shots" + cell).hasClass("salvo"))) {

            $("#shots" + cell).addClass("salvo");
            salvos.push(cell);
            maximumSalvos = maximumSalvos + 1;
            
            console.log(salvos);
            //if we click a cell with a salvo, we remove the salvo    
        } else if ((maximumSalvos < 5 && ($("#shots" + cell).hasClass("salvo"))) || (maximumSalvos == 5 && ($("#shots" + cell).hasClass("salvo")))) {

            $("#shots" + cell).removeClass("salvo");
            var index = salvos.indexOf(cell);
            salvos.splice(index, 1);
            maximumSalvos = maximumSalvos - 1;
            
            console.log(salvos);

        } else {
            alert("The maximum of salvos is 5");
        }
    });

    //place the ships and send to java
    $("#placeShips").click(placeShips);

    //send the salvos
    $("#sendSalvos").click(sendSalvos);

    //get the JSON from the URL that finishes with /api/game_view
    var gamePlayerId = getParameterByName("gp");
    $.getJSON("/api/game_view/" + gamePlayerId, function (json) {
        whoIsPlaying(json);
        putShipsInTheGrid(json);
        putSalvosShotsAndHitsInTheTwoGrids(json);
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

    function putSalvosShotsAndHitsInTheTwoGrids(json) {
        for (var k = 0; k < json.salvoes.length; k++) {
            var turn = json.salvoes[k].turn;

            //salvos atacking me (hits)
            if (gamePlayerId != json.salvoes[k].player) {
                for (var l = 0; l < json.salvoes[k].locations.length; l++) {
                    var cellIdHit = json.salvoes[k].locations[l];
                    if ($("#hits" + cellIdHit).hasClass("ship")) {

                        //change the green cell to orange because the ship has hit
                        $("#hits" + cellIdHit).removeClass("ship");
                        $("#hits" + cellIdHit).addClass("hitShotShip");

                        $("#hits" + cellIdHit).append(turn);

                    } else {
                        $("#hits" + cellIdHit).addClass("salvo");
                        $("#hits" + cellIdHit).append(turn);

                    }
                }
                //salvos I attack (shots)
            } else {
                for (var i = 0; i < json.salvoes[k].locations.length; i++) {
                    var cellIdShot = json.salvoes[k].locations[i];
                    $("#shots" + cellIdShot).addClass("salvo");
                    $("#hits" + cellIdShot).append(turn);
                }
            }
        }
    }


    function placeShips() {
        console.log("/api/games/players/" + 1 + "/ships");
        $.post({
                url: "/api/games/players/" + 1 + "/ships",
                data: JSON.stringify(ships),
                dataType: "text",
                contentType: "application/json"
            })
            .done(function () {
                alert("ship added");
            })
            .fail(function (jqXHR, status, httpError) {
                alert("Cannot place ships");
            })

    }

    function sendSalvos() {

    }

});
