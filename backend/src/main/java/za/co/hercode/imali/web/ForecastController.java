package za.co.hercode.imali.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import za.co.hercode.imali.domain.RunwayForecaster.Forecast;
import za.co.hercode.imali.service.ForecastService;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final ForecastService service;

    public ForecastController(ForecastService service) {
        this.service = service;
    }

    /** Days the money lasts, when the next income is expected, and a warning if a shortfall is likely. */
    @GetMapping
    public Forecast get(Authentication auth) {
        return service.forecastFor(CurrentUser.id(auth));
    }
}
