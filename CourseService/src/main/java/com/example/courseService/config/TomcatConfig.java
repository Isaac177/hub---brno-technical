package com.example.courseService.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {
    
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> containerCustomizer() {
        return factory -> {
            factory.addConnectorCustomizers(connector -> {
                connector.setProperty("socketBuffer", "65536");
                connector.setProperty("processorCache", "500");
                connector.setProperty("maxKeepAliveRequests", "100");
                connector.setProperty("maxConnections", "10000");
                connector.setProperty("acceptCount", "100");
                connector.setProperty("connectionTimeout", "20000");
                connector.setAsyncTimeout(180000);
                
                // Additional properties for better connection handling
                connector.setProperty("socket.soTimeout", "20000");
                connector.setProperty("socket.tcpNoDelay", "true");
                connector.setProperty("socket.keepAlive", "true");
                connector.setProperty("socket.oobInline", "false");
                connector.setProperty("socket.performanceConnectionTime", "1");
                connector.setProperty("socket.performanceLatency", "0");
                connector.setProperty("socket.performanceBandwidth", "1");
            });
        };
    }
}
