package salvo.salvo;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Gerard on 10/08/2017.
 */

@Entity
public class Ship {

    public enum ShipType { BATTLESHIP, CARRIER, SUBMARINE, DESTROYER, PATROL_BOAT }

@Id
@GeneratedValue(strategy= GenerationType.AUTO)
private long id;

@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name="gamePlayer_id")
private GamePlayer gamePlayer;

private ShipType shipType;

@ElementCollection
@Column(name = "location")
private List<String> location= new ArrayList<>();


    public Ship() {}

    public Ship(ShipType shipType, List<String> location, GamePlayer gamePlayer) {
        this.shipType = shipType;
        this.location = location;
        this.gamePlayer = gamePlayer;
        gamePlayer.addShip(this);
    }

    public long getId() {return id;}

    public void setId(long id) {
        this.id = id;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public ShipType getShipType() {
        return shipType;
    }

    public void setShipType(ShipType shipType) {
        this.shipType = shipType;
    }

    public List<String> getLocation() {
        return location;
    }

    public void setLocation(List<String> location) {
        this.location = location;
    }

}
