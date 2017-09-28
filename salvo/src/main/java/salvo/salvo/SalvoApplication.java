package salvo.salvo;


import org.springframework.security.core.userdetails.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Arrays;

@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class);
	}


	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository,
									  GameRepository gameRepository,
									  GamePlayerRepository gamePlayerRepository,
									  ShipRepository shipRepository,
									  SalvoRepository salvoRepository,
									  ScoreRepository scoreRepository) {
		return (args) -> {
			// save some customers
			Player p1 = new Player("Jack", "Bauer", "1@1", "1");
			Player p2 = new Player("Kim", "Bauer", "kimie@example.com", "password2");
			Player p3 = new Player("David", "Palmer", "dave@example.com", "password3");
			Player p4 = new Player("Michelle", "Dessler", "michelle@example.com", "password4");
			Player p5 = new Player("Chloe", "O'Brian", "cloie@example.com", "password5");

			//we save in Data Base
			playerRepository.save(p1);
			playerRepository.save(p2);
			playerRepository.save(p3);
			playerRepository.save(p4);
			playerRepository.save(p5);

			Game myFirstGame = new Game();
			Game mySecondGame = new Game();
			Game myThirdGame= new Game();


			gameRepository.save(myFirstGame);

			myThirdGame.addSeconds(3600);
			gameRepository.save(mySecondGame);

			myThirdGame.addSeconds(7200);
			gameRepository.save(myThirdGame);

			//some players in some games
			GamePlayer gameOnePlayerOne = new GamePlayer(myFirstGame, p1);
			GamePlayer gameOnePlayerTwo = new GamePlayer(myFirstGame, p2);
			GamePlayer gameTwoPlayerThree = new GamePlayer(mySecondGame, p3);
			GamePlayer gameTwoPlayerFour = new GamePlayer(mySecondGame, p4);
			GamePlayer gameThirdPlayerFour = new GamePlayer(myThirdGame, p4);

			gamePlayerRepository.save(gameOnePlayerOne);
			gamePlayerRepository.save(gameOnePlayerTwo);
			gamePlayerRepository.save(gameTwoPlayerThree);
			gamePlayerRepository.save(gameTwoPlayerFour);
			gamePlayerRepository.save(gameThirdPlayerFour);

			//some ships
			Ship ship1 = new Ship(Ship.ShipType.DESTROYER,new ArrayList<>(Arrays.asList("A2", "B2", "C2")), gameOnePlayerOne);
			Ship ship2 = new Ship(Ship.ShipType.SUBMARINE,  new ArrayList<>(Arrays.asList("C3", "C4", "C5")), gameOnePlayerOne);
			Ship ship3 = new Ship(Ship.ShipType.SUBMARINE,  new ArrayList<>(Arrays.asList("D7", "E7", "F7")), gameOnePlayerTwo);
			Ship ship4 = new Ship(Ship.ShipType.SUBMARINE,  new ArrayList<>(Arrays.asList("J7", "J8", "J9")), gameOnePlayerTwo);
			Ship ship5 = new Ship(Ship.ShipType.SUBMARINE , new ArrayList<>(Arrays.asList("A1", "A2", "A3")),gameTwoPlayerFour);

			System.out.println(gameOnePlayerOne.getShips().size());

			shipRepository.save(ship1);
			shipRepository.save(ship2);
			shipRepository.save(ship3);
			shipRepository.save(ship4);
			shipRepository.save(ship5);

			Salvo salvo1 = new Salvo(gameOnePlayerOne, 1, new ArrayList<>(Arrays.asList("J7", "J8", "B6")));
			Salvo salvo2 = new Salvo(gameOnePlayerOne, 2, new ArrayList<>(Arrays.asList("E1", "H3", "A2")));
			Salvo salvo3 = new Salvo(gameOnePlayerTwo, 1, new ArrayList<>(Arrays.asList("D3", "D4", "C7")));
			Salvo salvo4 = new Salvo(gameOnePlayerTwo, 2, new ArrayList<>(Arrays.asList("G2", "G3", "G4")));
			Salvo salvo5 = new Salvo(gameOnePlayerTwo, 3, new ArrayList<>(Arrays.asList("C2", "C3", "C4")));


			salvoRepository.save(salvo1);
			salvoRepository.save(salvo2);
			salvoRepository.save(salvo3);
			salvoRepository.save(salvo4);
			salvoRepository.save(salvo5);

			Score score1 = new Score(myFirstGame, p1, 1.0 );
			Score score2 = new Score(myFirstGame, p2, 0.0);
			Score score3 = new Score(mySecondGame, p3, 0.5);
			Score score4 = new Score(mySecondGame, p4, 0.5);

			scoreRepository.save(score1);
			scoreRepository.save(score2);
			scoreRepository.save(score3);
			scoreRepository.save(score4);

		};
	}

}

@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

	@Autowired
	PlayerRepository playerRepository;

	@Override
	public void init(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userDetailsService());
	}

	@Bean
	UserDetailsService userDetailsService() {
		return new UserDetailsService() {

			@Override
			public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
				Player player = playerRepository.findByEmail(email);
				if (player != null) {
					String thisEmail = player.getEmail();
					String thisPassword = player.getPassword();
					return new User(thisEmail,thisPassword ,
							AuthorityUtils.createAuthorityList("USER"));
				} else {
					throw new UsernameNotFoundException("Unknown user: " + email);
				}
			}
		};
	}
}

@EnableWebSecurity
@Configuration
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {

		http.authorizeRequests()
				.antMatchers("/web/games.html").permitAll()
				.antMatchers("/web/games.js").permitAll()
				.antMatchers("/api/game_view/**").hasAuthority("USER")
				.antMatchers("/api/games").permitAll()
				.antMatchers("/api/login").permitAll()
				.antMatchers("/rest/players").permitAll()
				.antMatchers("/api/players").permitAll()
				.antMatchers("/api/games").permitAll()
				.anyRequest().permitAll();
				//.anyRequest().fullyAuthenticated();

		http.formLogin()
				.usernameParameter("email")
				.passwordParameter("password")
				.loginPage("/api/login");

		http.logout().logoutUrl("/api/logout");

		// turn off checking for CSRF tokens
		http.csrf().disable();

		// if user is not authenticated, just send an authentication failure response
		http.exceptionHandling()
				.authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if login is successful, clear the flags asking for authentication
		http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

		// if login fails, just send an authentication failure response
		http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if logout is successful, just send a success response
		http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
	}

	private void clearAuthenticationAttributes(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
		}
	}
}