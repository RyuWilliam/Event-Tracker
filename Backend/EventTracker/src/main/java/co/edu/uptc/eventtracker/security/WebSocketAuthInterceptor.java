package co.edu.uptc.eventtracker.security;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthInterceptor(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() != StompCommand.CONNECT) {
            return message;
        }

        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return message;
        }

        String token = authHeader.substring(7);
        String email = null;
        try {
            email = jwtService.extractUsername(token);
        } catch (Exception ignored) {
            email = null;
        }

        String principalName = email;
        if (email != null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                if (userDetails instanceof UserDetailsImpl userDetailsImpl) {
                    principalName = String.valueOf(userDetailsImpl.getId());
                } else if (userDetails != null) {
                    principalName = userDetails.getUsername();
                }
            } catch (Exception ignored) {
                // Fallback to email when user lookup fails.
            }
        }

        if (principalName != null && !principalName.isBlank()) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principalName, null, Collections.emptyList());
            accessor.setUser(authentication);
        }

        return message;
    }
}
