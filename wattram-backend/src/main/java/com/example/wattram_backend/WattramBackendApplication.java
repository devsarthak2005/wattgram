package com.example.wattram_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class WattramBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WattramBackendApplication.class, args);
	}

}
