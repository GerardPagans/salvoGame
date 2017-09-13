package salvo.salvo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

/**
 * Created by Gerard on 11/07/2017.
 */

@RepositoryRestResource
public interface PlayerRepository extends JpaRepository<Player, Long> {


    Player findByEmail(@Param("mail") String email);



}
