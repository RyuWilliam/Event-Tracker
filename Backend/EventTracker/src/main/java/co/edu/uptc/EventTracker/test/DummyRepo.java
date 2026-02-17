package co.edu.uptc.EventTracker.test;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DummyRepo extends JpaRepository<DummyEntity, Integer> {

}
