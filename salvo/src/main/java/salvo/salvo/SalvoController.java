package salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;


/**
 * Created by Gerard on 13/07/2017.
 */

@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private GamePlayerRepository gamePlayerRepository;
    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    private ShipRepository shipRepository;
    @Autowired
    private SalvoRepository salvoRepository;



    @RequestMapping("/game_view/{gamePlayerId}")
    public ResponseEntity<Object> getGame_view(@PathVariable Long gamePlayerId, Authentication authentication) {

        Map<String, Object> map = new LinkedHashMap<>();
        GamePlayer currentGamePlayer = gamePlayerRepository.findOne(gamePlayerId);



        if (isGuest(authentication)) {
            return new ResponseEntity<Object>("you are not login", HttpStatus.FORBIDDEN);
        }

        if(authentication.getName() != currentGamePlayer.getPlayer().getEmail()){
            return new ResponseEntity<Object>("you are not login", HttpStatus.FORBIDDEN);

        }

        // gp id is not in the repo
        else if (currentGamePlayer == null) {
            map.put("error", "no such game player");
            return new ResponseEntity<Object>(map, HttpStatus.UNAUTHORIZED);
        }

        else{


        List<String> enemySalvoes = listOfSalvoes(getEnemyPlayer(currentGamePlayer));

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", currentGamePlayer.getGame().getId());
        dto.put("game", currentGamePlayer.getGame().getDate());
        dto.put("gamePlayers", currentGamePlayer.getGame().getPlayers().stream().map(player -> PlayerDTO(player)).collect(Collectors.toList()));
        dto.put("ships", currentGamePlayer.getShips().stream().map(ship -> ShipDTO(ship)).collect(Collectors.toList()));
        dto.put("enemy", getEnemyPlayer(currentGamePlayer).getPlayer().getEmail());
        dto.put("mySalvoes", currentGamePlayer.getSalvos().stream().map(salvo -> getSalvoInfoDTO(salvo)).collect(Collectors.toList()));
        dto.put("enemiesSalvoes", (getEnemyPlayer(currentGamePlayer)).getSalvos().stream().map(salvoEnemy -> getSalvoInfoDTO(salvoEnemy)).collect(Collectors.toList()));
        dto.put("list Of Salvoes",enemySalvoes);
        dto.put("sunkShips", currentGamePlayer.getShips().stream().map(ship -> shipIsSunk(enemySalvoes, ship)).collect(Collectors.toList()));
            return new ResponseEntity<Object>(dto, HttpStatus.OK);
    }
}

    @RequestMapping("/games")
    public Map<String, Object> getGamesAndPlayer(Authentication authentication) {
        Map<String, Object> dto = new LinkedHashMap<>();

        if (!isGuest(authentication)) {
            //for every game in the repository we do gamesDTO function that creates a Hashmap and then we collect all with a list

            Player currentplayer = currentAuthedUser(authentication);
            dto.put("player", playerDTO(currentplayer));

        }
        dto.put("games", gameRepository.findAll().stream().map(game -> gamesDTO(game)).collect(Collectors.toList()));
        return dto;

    }

    @RequestMapping(value = "/games",  method = RequestMethod.POST)
    public ResponseEntity<Object> createGame(Authentication authentication) {

        if (isGuest(authentication)) {
            return new ResponseEntity<Object>("you are not login", HttpStatus.FORBIDDEN);
        } else {

            Game game = new Game();
            gameRepository.save(game);

            Player currentPlayer = currentAuthedUser(authentication);
            GamePlayer firstGamePlayer = new GamePlayer(game, currentPlayer);
            gamePlayerRepository.save(firstGamePlayer);

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("gpid", firstGamePlayer.getId());
            return new ResponseEntity<Object>(map, HttpStatus.CREATED);
        }
    }

    @RequestMapping (value = "/game/{gameId}/players", method = RequestMethod.POST)
    public ResponseEntity<Object> joinGame (@PathVariable Long gameId, Authentication authentication){
        if (isGuest(authentication)) {
            return new ResponseEntity<Object>("you are not login", HttpStatus.UNAUTHORIZED);
        }
        if (gameId == null){
            return new ResponseEntity<Object>("No such game", HttpStatus.FORBIDDEN);
        }

        //get the game with this gameId
        Game gameToJoin = gameRepository.findOne(gameId);
        if (gameToJoin.getPlayers().size() > 1 ){

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("error", "Game is full");
            return new ResponseEntity<Object>(response, HttpStatus.FORBIDDEN);
        }
        Player currentPlayer = currentAuthedUser(authentication);
        Player waitingPlayer = gameToJoin.getGamePlayers().stream().findFirst().get().getPlayer();
        if(currentPlayer == waitingPlayer){
            return new ResponseEntity<Object>("No such game", HttpStatus.FORBIDDEN);
        }

        GamePlayer secondGamePlayer = new GamePlayer(gameToJoin, currentPlayer);
        gamePlayerRepository.save(secondGamePlayer);
        return new ResponseEntity<Object>("Joined Game", HttpStatus.CREATED);
    }

    @RequestMapping(value = "/players",  method = RequestMethod.POST)
    public ResponseEntity<Object> createPlayer(String firstName, String lastName, String email, String password){
        if(!isTheEmailTaken(email)) {
            Player newPlayer = new Player(firstName, lastName,email,password);
            playerRepository.save(newPlayer);
            return new ResponseEntity<Object>("Player saved", HttpStatus.CREATED);
        }else {
            Map<String, Object> map = new LinkedHashMap();
            map.put("error", "name in use");

            return new ResponseEntity<Object>(map,
                    HttpStatus.FORBIDDEN);
        }
    }

    @RequestMapping(value = "/games/players/{gamePlayerId}/ships", method = RequestMethod.POST)
    public ResponseEntity<Object> keepShips(@PathVariable Long gamePlayerId, Authentication authentication, @RequestBody Set<Ship> ships){

        if (isGuest(authentication)) {
            return new ResponseEntity<Object>("you are not login", HttpStatus.UNAUTHORIZED);
        }

        if(gamePlayerId == null){
            return new ResponseEntity<Object>("No such gamePlayer", HttpStatus.UNAUTHORIZED);
        }
        Player currentPlayer = currentAuthedUser(authentication);
        Player PlayerGamePlayer = gamePlayerRepository.findOne(gamePlayerId).getPlayer();
        GamePlayer gamePlayer = gamePlayerRepository.findOne(gamePlayerId);

        if(currentPlayer != PlayerGamePlayer){
            return new ResponseEntity<Object>("the is no coincidence between the user and the user ogf the gamePlayer ", HttpStatus.UNAUTHORIZED);
        }
        Set<Ship> ExistingShips = gamePlayerRepository.findOne(gamePlayerId).getShips();

        if (ExistingShips != null) {
            return new ResponseEntity<Object>("ships placed already", HttpStatus.UNAUTHORIZED);
        }

        for (Ship ship: ships) {
            if(ship.getLocation().size() == 5){
                ship.setShipType(Ship.ShipType.valueOf("CARRIER"));
            }
            if(ship.getLocation().size() == 4){
                ship.setShipType(Ship.ShipType.valueOf("BATTLESHIP"));
            }
            if(ship.getLocation().size() == 3){
                ship.setShipType(Ship.ShipType.valueOf("SUBMARINE"));
            }
            if(ship.getLocation().size() == 3){
                ship.setShipType(Ship.ShipType.valueOf("DESTROYER"));
            }
            if(ship.getLocation().size() == 2){
                ship.setShipType(Ship.ShipType.valueOf("PATROL_BOAT"));
            }

            ship.setGamePlayer(gamePlayer);
            shipRepository.save(ship);
        }

        return new ResponseEntity<Object>("Ship saved", HttpStatus.CREATED);
    }

    @RequestMapping(value = "/games/players/{gamePlayerId}/salvos", method = RequestMethod.POST)
    public ResponseEntity<Object> storeSalvos (@PathVariable Long gamePlayerId, Authentication authentication, @RequestBody Salvo salvo){

        if (isGuest(authentication)) {
            return new ResponseEntity<Object>("you are not login", HttpStatus.UNAUTHORIZED);
        }

        if(gamePlayerId == null){
            return new ResponseEntity<Object>("No such gamePlayer", HttpStatus.UNAUTHORIZED);
        }

        Player currentPlayer = currentAuthedUser(authentication);
        Player PlayerGamePlayer = gamePlayerRepository.findOne(gamePlayerId).getPlayer();
        GamePlayer gamePlayer = gamePlayerRepository.findOne(gamePlayerId);

        if(currentPlayer != PlayerGamePlayer){
            return new ResponseEntity<Object>("the is no coincidence between the user and the user ogf the gamePlayer ", HttpStatus.UNAUTHORIZED);
        }

        Set<Salvo> salvos = gamePlayer.getSalvos();
        int lastTurnNumber = gamePlayer.getLastTurn(salvos);

//        // checking if the user has already added salvo in this turn
//        if (salvo == null) {
//            Map<String, Object> response = new LinkedHashMap();
//            response.put("error", "the user has already submitted salvos");
//            return new ResponseEntity<Object>(response, HttpStatus.FORBIDDEN);
//        }

        salvo.setTurnNumber(lastTurnNumber + 1);
        salvo.setGamePlayer(gamePlayer);
        salvoRepository.save(salvo);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", "the salvos have been successfuly placed");
        return new ResponseEntity<Object>(response, HttpStatus.CREATED);
    }

    public Boolean isTheEmailTaken (String email) {
        Player player = playerRepository.findByEmail(email);
        if (player == null) {
            return false;
        } else {
            return true;
        }
    }


    private boolean isGuest(Authentication authentication) {
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    private Player currentAuthedUser(Authentication auth) {
        return playerRepository.findByEmail(auth.getName());
    }

    public Map<String, Object> salvoDTO(Salvo salvo) {

        Map<String, Object> dto = new LinkedHashMap<>();

        dto.put("turn", salvo.getTurnNumber());
        dto.put("player", salvo.getGamePlayer().getId());
        dto.put("locations", salvo.getLocation());
        return dto;
    }


    public Map<String, Object> PlayerDTO(Player player) {

        Map<String, Object> dto = new LinkedHashMap<>();

        dto.put("id", player.getId());
        dto.put("email", player.getEmail());
        return dto;
    }

    public Map<String, Object> ShipDTO(Ship ship) {

        Map<String, Object> dto = new LinkedHashMap<>();

        dto.put("type", ship.getShipType());
        dto.put("locations", ship.getLocation());
        return dto;
    }

    public Map<String, Object> playerDTO(Player player){

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", player.getId() );
        dto.put("name", player.getEmail());

        return dto;
    }

    public Map<String, Object> gamesDTO(Game game){

        Map<String, Object> dto = new LinkedHashMap<>();

        dto.put("id",game.getId());
        dto.put("createDate",game.getDate());
        dto.put("players", game.getGamePlayers().stream().map(gameplayer -> gamePlayerDTO(gameplayer)).collect(Collectors.toList()));
        dto.put("scores",game.getScores().stream().map(score-> getScoreDTO(score)).collect(Collectors.toList()));

        return dto;
    }

    public Map<String, Object> getScoreDTO (Score score){

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("player", score.getPlayer().getEmail());
        dto.put("score", score.getScore());

        return dto;
    }

    public Map<String, Object> gamePlayerDTO (GamePlayer gamePlayer){

        Map<String, Object> dto = new LinkedHashMap<>();

        dto.put("pgid",gamePlayer.getId());
        dto.put("id", gamePlayer.getPlayer().getId());
        dto.put("email",gamePlayer.getPlayer().getEmail());
        return dto;
    }


    public Map<String, Object> getShipsCollectionDTO (Ship ship){

        //playersSalvoes =
        Map<String, Object> dto = new LinkedHashMap<>();

        dto.put("type",ship.getShipType());
        dto.put("location",ship.getLocation());
        //dto.put("isSunk", shipIsSunk(playersSalvoes,ship))
        return dto;
    }


    private GamePlayer  getEnemyPlayer(GamePlayer gamePlayer) {

        Long playerId = gamePlayer.getId();
        Set<GamePlayer> gamePlayers = gamePlayer.getGame().getGamePlayers();

        GamePlayer enemyGamePlayer = gamePlayers.stream()

                .filter(gp -> gp.getId() != playerId).findAny().orElse(null);

        return enemyGamePlayer;
    }


    public List<String> getShipsLocations(GamePlayer gamePlayer){
        List<String> shipsLocations = gamePlayer.getShips().stream()
                .map(ship -> ship.getLocation())
                .flatMap(cells -> cells.stream()).collect(Collectors.toList());
        return shipsLocations;
    }

    public List <String> getHits(Salvo salvo){

        List<String> locationSalvo = salvo.getLocation();
        List<String> shipsLocationsEnemy = getShipsLocations(getEnemyPlayer(salvo.getGamePlayer()));

        List<String> hits = locationSalvo.stream()
                .filter(cell -> shipsLocationsEnemy.contains(cell))
                .collect(Collectors.toList());

    return hits;
    }


    private Map<String, Object> shipIsSunk(List<String> enemySalvoes, Ship ship) {

        Map<String, Object> shipInfoSunkTypeDTO = new LinkedHashMap<>();
        boolean shipIsSunk = ship.getLocation().stream()
                .allMatch(locations -> enemySalvoes.contains(locations));

        shipInfoSunkTypeDTO.put("typeShip", ship.getShipType());
        shipInfoSunkTypeDTO.put("isSunk",shipIsSunk );

        return shipInfoSunkTypeDTO;
    }

    public Map<String, Object> getSalvoInfoDTO(Salvo salvo){

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("turn", salvo.getTurnNumber());
        map.put("hits", getHits(salvo));
        map.put("locations", salvo.getLocation());

        return map;
    }


    public List<String> listOfSalvoes(GamePlayer gamePlayer) {

        return gamePlayer.getSalvos().stream()
                .map(salvo -> salvo.getLocation())
                .flatMap(cells -> cells.stream()).collect(Collectors.toList());
    }

}








