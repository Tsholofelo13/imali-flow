package za.co.hercode.imali.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import za.co.hercode.imali.model.IncomeEvent;

public interface IncomeRepository extends JpaRepository<IncomeEvent, UUID> {

    List<IncomeEvent> findByUserIdOrderByReceivedOnAsc(UUID userId);

    List<IncomeEvent> findByUserIdOrderByReceivedOnDesc(UUID userId);
}
