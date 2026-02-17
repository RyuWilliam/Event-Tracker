package co.edu.uptc.EventTracker.test;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DummyController {

    private final DummyRepo dummyRepo;

    public DummyController(DummyRepo dummyRepo) {
        this.dummyRepo = dummyRepo;
    }

    @GetMapping("/")
    public List<DummyEntity> getAll(){
        return dummyRepo.findAll();
    }

    @PostMapping("/save")
    public DummyEntity save(@RequestBody DummyEntity dummyEntity){
        return dummyRepo.save(dummyEntity);
    }


}
