package co.edu.uptc.EventTracker.test;


import jakarta.persistence.*;

@Entity
@Table(name="dummy_table")
public class DummyTable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String address;
}

