package salvo.salvo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Created by Gerard on 10/08/2017.
 */

@RepositoryRestResource
public interface ShipRepository extends JpaRepository<Ship, Long> {

}

