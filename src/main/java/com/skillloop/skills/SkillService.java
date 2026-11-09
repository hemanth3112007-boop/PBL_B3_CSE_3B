package com.skillloop.skills;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.training.Course;
import com.skillloop.training.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final CourseRepository courseRepository;

    public SkillService(
            SkillRepository skillRepository,
            CourseSkillRepository courseSkillRepository,
            CourseRepository courseRepository) {
        this.skillRepository = skillRepository;
        this.courseSkillRepository = courseSkillRepository;
        this.courseRepository = courseRepository;
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public List<Skill> searchSkills(String query) {
        return skillRepository.findByNameContainingIgnoreCase(query);
    }

    @Transactional
    public Skill getOrCreateSkill(String name, SkillEnums.SkillCategory category, String description) {
        String normalized = name.trim().toLowerCase();
        Optional<Skill> existing = skillRepository.findByNormalizedKey(normalized);
        if (existing.isPresent()) {
            return existing.get();
        }
        Skill skill = new Skill(name.trim(), category != null ? category : SkillEnums.SkillCategory.TECHNICAL, description);
        return skillRepository.save(skill);
    }

    @Transactional
    public Skill createSkill(SkillDtos.CreateSkillRequest req) {
        return getOrCreateSkill(req.getName(), req.getCategory(), req.getDescription());
    }

    public List<CourseSkill> getCourseSkills(Long courseId) {
        return courseSkillRepository.findByCourseId(courseId);
    }

    @Transactional
    public CourseSkill addSkillToCourse(Long courseId, SkillDtos.AddCourseSkillRequest req) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        Skill skill;
        if (req.getSkillId() != null) {
            skill = skillRepository.findById(req.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + req.getSkillId()));
        } else if (req.getSkillName() != null && !req.getSkillName().isBlank()) {
            skill = getOrCreateSkill(req.getSkillName(), req.getCategory(), null);
        } else {
            throw new IllegalArgumentException("Either skillId or skillName must be provided");
        }

        Optional<CourseSkill> existing = courseSkillRepository.findByCourseIdAndSkillId(courseId, skill.getId());
        if (existing.isPresent()) {
            CourseSkill cs = existing.get();
            cs.setProficiencyLevel(req.getProficiencyLevel());
            cs.setHoursAllocated(req.getHoursAllocated());
            cs.setCore(req.isCore());
            return courseSkillRepository.save(cs);
        }

        CourseSkill cs = new CourseSkill(course, skill, req.getProficiencyLevel(), req.getHoursAllocated(), req.isCore());
        return courseSkillRepository.save(cs);
    }

    @Transactional
    public void removeSkillFromCourse(Long courseId, Long skillId) {
        CourseSkill cs = courseSkillRepository.findByCourseIdAndSkillId(courseId, skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not assigned to course"));
        courseSkillRepository.delete(cs);
    }
}
