package salvo.salvo;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Gerard on 21/08/2017.
 */
@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer_id")
    private GamePlayer gamePlayer;

    private int turnNumber;

    @ElementCollection
    @Column(name = "location")
    private List<String> location = new ArrayList<>();

    public Salvo (){}

    public Salvo(GamePlayer gamePlayer, int turnNumber, List<String> location) {
        this.gamePlayer = gamePlayer;
        this.turnNumber = turnNumber;
        this.location = location;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public int getTurnNumber() {
        return turnNumber;
    }

    public void setTurnNumber(int turnNumber) {
        this.turnNumber = turnNumber;
    }

    public List<String> getLocation() {
        return location;
    }

    public List<String> getLocationWithGamePlayerAndturn(GamePlayer gamePlayer, int turnNumber){
        return location;
    }

    public void setLocation(List<String> location) {
        this.location = location;
    }


}
