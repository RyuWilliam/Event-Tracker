package co.edu.uptc.eventtracker.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String NOTIFICATIONS_EXCHANGE = "notifications.topic.exchange";
    public static final String PURCHASE_RESULT_QUEUE = "purchase.result.queue";
    public static final String RK_PURCHASE_RESULT = "purchase.result.v1";

    @Bean
    public TopicExchange notificationsExchange() {
        return new TopicExchange(NOTIFICATIONS_EXCHANGE, true, false);
    }

    @Bean
    public Queue purchaseResultQueue() {
        return new Queue(PURCHASE_RESULT_QUEUE, true);
    }

    @Bean
    public Binding purchaseResultBinding() {
        return BindingBuilder.bind(purchaseResultQueue())
                .to(notificationsExchange())
                .with(RK_PURCHASE_RESULT);
    }
}